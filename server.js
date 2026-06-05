import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import { MOCK_SOAL, MOCK_MATERI } from "./src/data/mockData.js";
import Singlebase from "@singlebase/singlebase-js";
import WebSocket from "ws";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";

globalThis.WebSocket = WebSocket;

// Load environment variables
dotenv.config();

const app = express();
const PORT = 5001;

// Railway backend URL — digunakan untuk proxy jika diperlukan
const RAILWAY_API_URL =
  process.env.RAILWAY_API_URL ||
  "https://utbk-backend-production.up.railway.app/api/v1";

app.use(express.json());

// Session middleware (required for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "eduptn-super-secret-key-2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialize/deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5001/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user info from Google profile
        const user = {
          id: `google-${profile.id}`,
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          avatar: profile.photos[0]?.value,
          role: "SISWA", // Default role
          provider: "google",
        };

        // TODO: Save user to database (Supabase/Railway)
        // For now, just return the user object
        console.log("[Google OAuth] User authenticated:", user.email);

        return done(null, user);
      } catch (error) {
        console.error("[Google OAuth] Error:", error);
        return done(error, null);
      }
    }
  )
);

// Configure LinkedIn OAuth Strategy with custom profile URL
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: process.env.LINKEDIN_CALLBACK_URL || "http://localhost:5001/auth/linkedin/callback",
      scope: ["openid", "profile", "email"],
      state: true,
      // Use OIDC userinfo endpoint instead of the deprecated v2 API
      profileURL: "https://api.linkedin.com/v2/userinfo",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user info from LinkedIn profile
        console.log("[LinkedIn OAuth] Raw profile:", JSON.stringify(profile, null, 2));
        console.log("[LinkedIn OAuth] Access token:", accessToken ? "Present" : "Missing");
        
        // LinkedIn OpenID Connect profile structure
        const user = {
          id: `linkedin-${profile.id || profile.sub}`,
          linkedinId: profile.id || profile.sub,
          email: profile.email || profile.emails?.[0]?.value || `linkedin-${profile.id || profile.sub}@temp.com`,
          name: profile.name || profile.displayName || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || "LinkedIn User",
          firstName: profile.given_name || profile.name?.givenName || profile.givenName || "",
          lastName: profile.family_name || profile.name?.familyName || profile.familyName || "",
          avatar: profile.picture || profile.photos?.[0]?.value || "",
          role: "SISWA", // Default role
          provider: "linkedin",
        };

        console.log("[LinkedIn OAuth] User authenticated:", user.email);

        return done(null, user);
      } catch (error) {
        console.error("[LinkedIn OAuth] Error:", error);
        return done(error, null);
      }
    }
  )
);

// Fallback credentials provided by the user
const FALLBACK_SB_PUB = process.env.SINGLEBASE_PUBLISHABLE_KEY || "";
const FALLBACK_SB_SEC = process.env.SINGLEBASE_SECRET_KEY || "";

// State and database provider detection
const dbType = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  const singlebaseKey = process.env.SINGLEBASE_SECRET_KEY || process.env.SINGLEBASE_PUBLISHABLE_KEY;

  // Prioritas: Supabase > Singlebase fallback > local
  if (supabaseUrl && supabaseKey) return "supabase";
  if (singlebaseKey && singlebaseKey !== FALLBACK_SB_SEC) return "singlebase";
  return "local";
};

// Initialize Singlebase Datastore Client
let singlebaseStore = null;
const getSinglebaseStore = () => {
  if (singlebaseStore) return singlebaseStore;
  const sKey = process.env.SINGLEBASE_SECRET_KEY || process.env.SINGLEBASE_PUBLISHABLE_KEY || FALLBACK_SB_SEC;
  if (sKey) {
    try {
      const sbc = Singlebase({
        api_key: sKey,
        api_url: "https://cloud.singlebaseapis.com/api"
      });
      singlebaseStore = sbc.useDatastore();
      console.log("Singlebase Datastore Client successfully activated!");
    } catch (e) {
      console.error("Gagal meluncurkan Singlebase Client:", e);
    }
  }
  return singlebaseStore;
};

// Initialize Supabase Client dynamically
let supabase = null;
const getSupabaseClient = () => {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      supabase = createClient(url, key);
      console.log("Supabase Client initialized successfully!");
    } catch (e) {
      console.error("Failed to initialize Supabase client:", e);
    }
  }
  return supabase;
};

// Memory fallback cache in case Supabase is not configured or table doesn't exist
let cacheSoal = [...MOCK_SOAL];
let cacheMateri = [...MOCK_MATERI];
let cacheUsers = [
  {
    id: "usr-1",
    name: "Ahmad Rivaldi",
    email: "ahmad.rivaldi@gmail.com",
    role: "SISWA",
    createdAt: "2026-05-18T10:00:00Z",
    pilihanKampus: "Universitas Indonesia (UI) - Pendidikan Dokter"
  },
  {
    id: "usr-2",
    name: "Sarah Azzahra",
    email: "sarah.azzahra@outlook.com",
    role: "SISWA",
    createdAt: "2026-05-20T11:45:00Z",
    pilihanKampus: "Institut Teknologi Bandung (ITB) - STEI"
  },
  {
    id: "usr-3",
    name: "Budi Santoso",
    email: "budi.santoso@yahoo.com",
    role: "SISWA",
    createdAt: "2026-05-22T09:12:00Z",
    pilihanKampus: "Universitas Gadjah Mada (UGM) - Hukum"
  },
  {
    id: "usr-4",
    name: "Clara Angelica",
    email: "clara.angelica@gmail.com",
    role: "SISWA",
    createdAt: "2026-05-24T14:30:00Z",
    pilihanKampus: "Universitas Padjadjaran (UNPAD) - Ilmu Komunikasi"
  }
];
let cacheTryoutHistory = [];

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// GOOGLE OAUTH ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// Initiate Google OAuth login
app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}));

// Google OAuth callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/google/failure" }),
  (req, res) => {
    // Success! User is authenticated
    const user = req.user;
    
    // Generate a simple token (in production, use JWT)
    const token = Buffer.from(JSON.stringify({
      id: user.id,
      email: user.email,
      timestamp: Date.now()
    })).toString('base64');

    // Redirect to frontend with user data
    // Frontend will catch this and store in localStorage
    const redirectUrl = `/?google_auth=success&user=${encodeURIComponent(JSON.stringify(user))}&token=${token}`;
    res.redirect(redirectUrl);
  }
);

// Google OAuth failure handler
app.get("/auth/google/failure", (req, res) => {
  res.redirect("/?google_auth=failed");
});

// ═══════════════════════════════════════════════════════════════════════════
// LINKEDIN OAUTH ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// Initiate LinkedIn OAuth login
app.get("/auth/linkedin", passport.authenticate("linkedin", {
  scope: ["openid", "profile", "email"],
}));

// LinkedIn OAuth callback
app.get(
  "/auth/linkedin/callback",
  (req, res, next) => {
    passport.authenticate("linkedin", (err, user, info) => {
      if (err) {
        console.error("[LinkedIn OAuth] Authentication error:", err);
        return res.redirect("/?linkedin_auth=failed&error=" + encodeURIComponent(err.message || "Unknown error"));
      }
      
      if (!user) {
        console.error("[LinkedIn OAuth] No user returned:", info);
        return res.redirect("/?linkedin_auth=failed&error=no_user");
      }

      // Login user
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error("[LinkedIn OAuth] Login error:", loginErr);
          return res.redirect("/?linkedin_auth=failed&error=login_failed");
        }

        // Success! Generate token
        const token = Buffer.from(JSON.stringify({
          id: user.id,
          email: user.email,
          timestamp: Date.now()
        })).toString('base64');

        // Redirect to frontend with user data
        const redirectUrl = `/?linkedin_auth=success&user=${encodeURIComponent(JSON.stringify(user))}&token=${token}`;
        res.redirect(redirectUrl);
      });
    })(req, res, next);
  }
);

// LinkedIn OAuth failure handler
app.get("/auth/linkedin/failure", (req, res) => {
  res.redirect("/?linkedin_auth=failed");
});

// ═══════════════════════════════════════════════════════════════════════════

// Logout endpoint
app.get("/auth/google/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// ═══════════════════════════════════════════════════════════════════════════

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "EduPTN Local Server",
    railwayApi: RAILWAY_API_URL,
    dbProvider: dbType(),
    googleOAuth: !!process.env.GOOGLE_CLIENT_ID,
    timestamp: new Date().toISOString(),
  });
});

// AI Consultation Endpoint using @google/genai and gemini-2.0-flash
// AI Consultation Endpoint using @google/genai, gemini-2.0-flash with gemini-1.5-flash fallback
app.post("/api/v1/consultation", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Pesan (message) wajib diisi." });
  }

  try {
    // Support client-supplied custom API key via headers
    const clientApiKey = req.headers["x-gemini-api-key"] || req.headers["X-Gemini-API-Key"];
    let aiClient = ai;

    if (clientApiKey && clientApiKey.trim() !== "" && clientApiKey !== "null" && clientApiKey !== "undefined") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: clientApiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
      } catch (clientInitErr) {
        console.error("Gagal menginisialisasi custom Gemini Client:", clientInitErr);
      }
    }

    const systemInstruction = `Anda adalah "AI Mentor EduPTN", seorang asisten bimbingan belajar dan mentor persiapan UTBK SNBT Indonesia yang ahli, ramah, dan memotivasi. 
Tugas Anda adalah membantu siswa menjawab pembahasan soal UTBK (TPS seperti Penalaran Umum, Pemahaman Bacaan, Pengetahuan Kuantitatif, serta Penalaran Matematika, Literasi Bahasa Indonesia, & Literasi Bahasa Inggris), merencanakan jadwal belajar, memberikan info pendaftaran PTN, menganalisis peluang masuk jurusan, dan merekomendasikan program studi berdasarkan minat/nilai tryout mereka.
Berikan jawaban yang ramah, ringkas, mudah dipahami, berstruktur rapi dalam format Markdown, dan selalu gunakan bahasa Indonesia yang sopan dan menyemangati siswa.`;

    const contents = history && Array.isArray(history) && history.length > 0
      ? [...history, { role: "user", parts: [{ text: message }] }]
      : [{ role: "user", parts: [{ text: message }] }];

    // 1. Try with gemini-2.0-flash first
    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-2.0-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({ text: response.text });
    } catch (primaryModelErr) {
      const isQuotaExceeded =
        primaryModelErr.message?.includes("quota") ||
        primaryModelErr.message?.includes("Quota") ||
        primaryModelErr.message?.includes("RESOURCE_EXHAUSTED") ||
        primaryModelErr.status === 429 ||
        primaryModelErr.code === 429;

      if (isQuotaExceeded) {
        console.warn("gemini-2.0-flash quota terlampaui/exhausted. Mencoba fallback ke gemini-1.5-flash...");

        // 2. Fallback to gemini-1.5-flash which may have separate quota limits
        try {
          const responseFallback = await aiClient.models.generateContent({
            model: "gemini-3.5-flash",
            contents: contents,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
            },
          });

          return res.json({ text: responseFallback.text });
        } catch (fallbackErr) {
          console.error("Model fallback (gemini-1.5-flash) juga gagal:", fallbackErr);
          throw fallbackErr; // Lempar ke catch block utama
        }
      } else {
        throw primaryModelErr;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);

    // Parse status code
    let statusCode = error?.status || error?.code || 500;
    if (error.message?.includes("Quota exceeded") || error.message?.includes("RESOURCE_EXHAUSTED") || error.message?.includes("quota")) {
      statusCode = 429;
    }

    const httpStatus = typeof statusCode === 'number' && statusCode >= 400 && statusCode < 600 ? statusCode : 500;

    let cleanMessage = error.message || "Terjadi kesalahan pada AI Konsultan.";
    if (httpStatus === 429) {
      cleanMessage = "Kuota API Key Gemini (Free Tier) saat ini habis atau limit terlampaui. Silakan gunakan API Key Anda sendiri di pengaturan API Key (klik tombol 'API Key' di kanan atas chat) untuk terus berkonsultasi secara instan.";
    }

    res.status(httpStatus).json({
      error: cleanMessage,
      code: httpStatus
    });
  }
});

// --- DATABASE & SYNC API ROUTES ---

// Check Status of DB Connections (Supporting both Singlebase and Supabase)
app.get("/api/v1/sync/status", async (req, res) => {
  const currentDb = dbType();
  const tables = {
    soal: { ok: false, count: 0, error: null },
    materi: { ok: false, count: 0, error: null },
    users: { ok: false, count: 0, error: null },
    tryout_history: { ok: false, count: 0, error: null }
  };

  if (currentDb === "singlebase") {
    try {
      const store = getSinglebaseStore();
      if (!store) {
        return res.json({
          configured: true,
          connected: false,
          message: "Gagal membuat koneksi ke Singlebase Cloud.",
          tables,
          dbProvider: "Singlebase"
        });
      }

      const checkCollection = async (col) => {
        try {
          const r = await store.list(col, { limit: 1000 });
          if (r.ok && Array.isArray(r.data)) {
            return { ok: true, count: r.data.length, error: null };
          }
          return { ok: true, count: 0, error: r.error ? (r.error.message || JSON.stringify(r.error)) : null };
        } catch (e) {
          return { ok: false, count: 0, error: e.message };
        }
      };

      tables.soal = await checkCollection("soal");
      tables.materi = await checkCollection("materi");
      tables.users = await checkCollection("users");
      tables.tryout_history = await checkCollection("tryout_history");

      const connected = true;
      return res.json({
        configured: true,
        connected: connected,
        message: "Koneksi ke Singlebase Cloud Aktif dan Diselaraskan!",
        tables,
        dbProvider: "Singlebase Cloud"
      });
    } catch (error) {
      return res.json({
        configured: true,
        connected: false,
        message: "Koneksi ke Singlebase gagal: " + error.message,
        tables,
        dbProvider: "Singlebase Cloud"
      });
    }
  }

  // Supabase fallback / standard config
  const url = process.env.SUPABASE_URL || "";
  const client = getSupabaseClient();
  const configured = !!(url && process.env.SUPABASE_ANON_KEY);

  if (!configured) {
    return res.json({
      configured: false,
      connected: false,
      message: "Database Cloud belum dikonfigurasi. Menggunakan data Fallback Lokal (Memory Cache).",
      tables,
      dbProvider: "Local Fallback"
    });
  }

  try {
    // Check soal
    const qSoal = await client.from("soal").select("id", { count: "exact", head: true });
    if (qSoal.error) {
      tables.soal.error = qSoal.error.message;
    } else {
      tables.soal.ok = true;
      tables.soal.count = qSoal.count || 0;
    }

    // Check materi
    const qMateri = await client.from("materi").select("id", { count: "exact", head: true });
    if (qMateri.error) {
      tables.materi.error = qMateri.error.message;
    } else {
      tables.materi.ok = true;
      tables.materi.count = qMateri.count || 0;
    }

    // Check users
    const qUsers = await client.from("users").select("id", { count: "exact", head: true });
    if (qUsers.error) {
      tables.users.error = qUsers.error.message;
    } else {
      tables.users.ok = true;
      tables.users.count = qUsers.count || 0;
    }

    // Check tryout_history
    const qHist = await client.from("tryout_history").select("id", { count: "exact", head: true });
    if (qHist.error) {
      tables.tryout_history.error = qHist.error.message;
    } else {
      tables.tryout_history.ok = true;
      tables.tryout_history.count = qHist.count || 0;
    }

    const connected = Object.values(tables).some(t => t.ok);

    return res.json({
      configured: true,
      connected: connected,
      message: connected ? "Terhubung ke Supabase dengan sukses!" : "Supabase terhubung tapi tabel belum terbuat di database Anda.",
      tables,
      dbProvider: "Supabase"
    });
  } catch (error) {
    return res.json({
      configured: true,
      connected: false,
      message: "Koneksi ke Supabase gagal: " + error.message,
      tables,
      dbProvider: "Supabase"
    });
  }
});

// Seed / Migrate mock data to serverless tables automatically!
app.post("/api/v1/sync/migrate", async (req, res) => {
  const currentDb = dbType();
  const results = {
    soal: { status: "skipped", count: 0, error: null },
    materi: { status: "skipped", count: 0, error: null },
    users: { status: "skipped", count: 0, error: null }
  };

  if (currentDb === "singlebase") {
    try {
      const store = getSinglebaseStore();
      if (!store) {
        return res.status(400).json({ error: "Singlebase Datastore client gagal diluncurkan." });
      }

      // 1. Sync Soal
      let errsSoal = 0;
      for (const s of MOCK_SOAL) {
        const payload = {
          id: s.id,
          pertanyaan: s.pertanyaan,
          tipe: s.tipe,
          opsi: s.opsi,
          jawaban: s.jawaban,
          pembahasan: s.pembahasan,
          mapel: s.mapel,
          subtest: s.subtest,
          tingkat: s.tingkat
        };
        const r = await store.set("soal", s.id, payload);
        if (!r.ok) errsSoal++;
      }
      if (errsSoal > 0) {
        results.soal.status = "partial";
        results.soal.error = `${errsSoal} Soal gagal disalurkan.`;
      } else {
        results.soal.status = "success";
        results.soal.count = MOCK_SOAL.length;
      }

      // 2. Sync Materi
      let errsMateri = 0;
      for (const m of MOCK_MATERI) {
        const payload = {
          id: m.id,
          judul: m.judul,
          kategori: m.kategori,
          subtest: m.subtest,
          konten: m.konten,
          estimasiMembaca: m.estimasiMembaca,
          poinReward: m.poinReward
        };
        const r = await store.set("materi", m.id, payload);
        if (!r.ok) errsMateri++;
      }
      if (errsMateri > 0) {
        results.materi.status = "partial";
        results.materi.error = `${errsMateri} Materi gagal disalurkan.`;
      } else {
        results.materi.status = "success";
        results.materi.count = MOCK_MATERI.length;
      }

      // 3. Sync Users
      let errsUsers = 0;
      for (const u of cacheUsers) {
        const payload = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          pilihanKampus: u.pilihanKampus
        };
        const r = await store.set("users", u.id, payload);
        if (!r.ok) errsUsers++;
      }
      if (errsUsers > 0) {
        results.users.status = "partial";
        results.users.error = `${errsUsers} User gagal disalurkan.`;
      } else {
        results.users.status = "success";
        results.users.count = cacheUsers.length;
      }

      return res.json({
        success: true,
        message: "Sinkronisasi data awal berhasil disalurkan ke Singlebase Cloud!",
        results
      });
    } catch (e) {
      return res.status(500).json({ error: "Gagal menyelaraskan data ke Singlebase: " + e.message, results });
    }
  }

  // Supabase migration flow
  const client = getSupabaseClient();
  if (!client) {
    return res.status(400).json({ error: "Database Cloud belum terkonfigurasi di env/secrets." });
  }

  try {
    // 1. Sync Soal
    const { error: errorSoal } = await client.from("soal").upsert(MOCK_SOAL.map(s => ({
      id: s.id,
      pertanyaan: s.pertanyaan,
      tipe: s.tipe,
      opsi: s.opsi,
      jawaban: s.jawaban,
      pembahasan: s.pembahasan,
      mapel: s.mapel,
      subtest: s.subtest,
      tingkat: s.tingkat
    })));
    if (errorSoal) {
      results.soal.error = errorSoal.message;
      results.soal.status = "failed";
    } else {
      results.soal.status = "success";
      results.soal.count = MOCK_SOAL.length;
    }

    // 2. Sync Materi
    const { error: errorMateri } = await client.from("materi").upsert(MOCK_MATERI.map(m => ({
      id: m.id,
      judul: m.judul,
      kategori: m.kategori,
      subtest: m.subtest,
      konten: m.konten,
      estimasiMembaca: m.estimasiMembaca,
      poinReward: m.poinReward
    })));
    if (errorMateri) {
      results.materi.error = errorMateri.message;
      results.materi.status = "failed";
    } else {
      results.materi.status = "success";
      results.materi.count = MOCK_MATERI.length;
    }

    // 3. Sync Users
    const { error: errorUsers } = await client.from("users").upsert(cacheUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      pilihanKampus: u.pilihanKampus
    })));
    if (errorUsers) {
      results.users.error = errorUsers.message;
      results.users.status = "failed";
    } else {
      results.users.status = "success";
      results.users.count = cacheUsers.length;
    }

    return res.json({
      success: true,
      message: "Sinkronisasi data awal berhasil disalurkan ke Supabase!",
      results
    });
  } catch (err) {
    return res.status(500).json({ error: "Gagal menyelaraskan data: " + err.message, results });
  }
});

// GET Questions (Soal)
app.get("/api/v1/soal", async (req, res) => {
  const currentDb = dbType();
  const mapel = req.query.mapel;

  if (currentDb === "singlebase") {
    try {
      const store = getSinglebaseStore();
      if (store) {
        const r = await store.list("soal", { limit: 1000 });
        if (r.ok && Array.isArray(r.data)) {
          cacheSoal = r.data;
          let filtered = cacheSoal;
          if (mapel) {
            filtered = cacheSoal.filter(q => q.mapel === mapel);
          }
          return res.json(filtered);
        }
      }
    } catch (e) {
      console.warn("Singlebase fetch soal failed, using fallback:", e.message);
    }
  } else if (currentDb === "supabase") {
    const client = getSupabaseClient();
    if (client) {
      try {
        let query = client.from("soal").select("*");
        if (mapel) {
          query = query.eq("mapel", mapel);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          cacheSoal = data;
          return res.json(data);
        }
        if (error) {
          console.warn("Supabase fetch soal error, using fallback:", error.message);
        }
      } catch (e) {
        console.warn("Supabase soal connection failed, using fallback:", e.message);
      }
    }
  }

  // Fallback
  let filtered = cacheSoal;
  if (mapel) {
    filtered = cacheSoal.filter(q => q.mapel === mapel);
  }
  res.json(filtered);
});

// POST Question (Soal)
app.post("/api/v1/soal", async (req, res) => {
  const question = req.body;
  if (!question.id) question.id = "s-custom-" + Math.random().toString(36).substr(2, 9);

  // Add to local cache
  cacheSoal.push(question);

  const currentDb = dbType();
  if (currentDb === "singlebase") {
    try {
      const store = getSinglebaseStore();
      if (store) {
        await store.set("soal", question.id, question);
      }
    } catch (e) {
      console.error("Gagal menyimpan ke Singlebase:", e.message);
    }
  } else if (currentDb === "supabase") {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client.from("soal").insert([question]);
        if (error) {
          console.error("Failed inserting question to Supabase:", error.message);
        }
      } catch (e) {
        console.error("Failed writing question to Supabase:", e.message);
      }
    }
  }
  res.json({ success: true, item: question });
});

// GET Materials (Materi)
app.get("/api/v1/materi", async (req, res) => {
  const currentDb = dbType();
  if (currentDb === "singlebase") {
    try {
      const store = getSinglebaseStore();
      if (store) {
        const r = await store.list("materi", { limit: 1000 });
        if (r.ok && Array.isArray(r.data)) {
          cacheMateri = r.data;
          return res.json(r.data);
        }
      }
    } catch (e) {
      console.warn("Singlebase fetch materi failed:", e.message);
    }
  } else if (currentDb === "supabase") {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from("materi").select("*");
        if (!error && data && data.length > 0) {
          cacheMateri = data;
          return res.json(data);
        }
        if (error) {
          console.warn("Supabase fetch materi error, using fallback:", error.message);
        }
      } catch (e) {
        console.warn("Supabase fetch materi connection failed:", e.message);
      }
    }
  }
  res.json(cacheMateri);
});

// POST Material (Materi)
app.post("/api/v1/materi", async (req, res) => {
  const material = req.body;
  if (!material.id) material.id = "m-custom-" + Math.random().toString(36).substr(2, 9);

  cacheMateri.push(material);

  const currentDb = dbType();
  if (currentDb === "singlebase") {
    try {
      const store = getSinglebaseStore();
      if (store) {
        await store.set("materi", material.id, material);
      }
    } catch (e) {
      console.error("Gagal menyimpan ke Singlebase:", e.message);
    }
  } else if (currentDb === "supabase") {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client.from("materi").insert([material]);
        if (error) {
          console.error("Failed inserting material to Supabase:", error.message);
        }
      } catch (e) {
        console.error("Failed writing material to Supabase:", e.message);
      }
    }
  }
  res.json({ success: true, item: material });
});

// GET Users (Registered Users)
app.get("/api/v1/users", async (req, res) => {
  const currentDb = dbType();
  if (currentDb === "singlebase") {
    try {
      const store = getSinglebaseStore();
      if (store) {
        const r = await store.list("users", { limit: 1000 });
        if (r.ok && Array.isArray(r.data)) {
          cacheUsers = r.data;
          return res.json(r.data);
        }
      }
    } catch (e) {
      console.warn("Singlebase fetch users failed:", e.message);
    }
  } else if (currentDb === "supabase") {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from("users").select("*");
        if (!error && data && data.length > 0) {
          cacheUsers = data;
          return res.json(data);
        }
        if (error) {
          console.warn("Supabase fetch users error, using fallback:", error.message);
        }
      } catch (e) {
        console.warn("Supabase fetch users failed:", e.message);
      }
    }
  }
  res.json(cacheUsers);
});

// POST User (Add or Sync Profile)
app.post("/api/v1/users", async (req, res) => {
  const user = req.body;
  if (!user.id) {
    user.id = "usr-" + Math.random().toString(36).substr(2, 9);
  }

  // Update local cache
  const idx = cacheUsers.findIndex(u => u.email?.toLowerCase() === user.email?.toLowerCase() || u.id === user.id);
  if (idx > -1) {
    cacheUsers[idx] = { ...cacheUsers[idx], ...user };
  } else {
    cacheUsers.unshift(user);
  }

  const currentDb = dbType();
  if (currentDb === "singlebase") {
    try {
      const store = getSinglebaseStore();
      if (store) {
        await store.set("users", user.id, user);
      }
    } catch (e) {
      console.error("Failed saving user to Singlebase:", e.message);
    }
  } else if (currentDb === "supabase") {
    const client = getSupabaseClient();
    if (client) {
      try {
        const dbPayload = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          pilihanKampus: user.pilihanKampus
        };
        const { error } = await client.from("users").upsert(dbPayload);
        if (error) {
          console.error("Failed saving user to Supabase:", error.message);
        }
      } catch (e) {
        console.error("Failed connecting user backend to Supabase:", e.message);
      }
    }
  }

  res.json(user);
});

// GET Tryout History
app.get("/api/v1/tryout_history", async (req, res) => {
  const email = req.query.email;
  const currentDb = dbType();

  if (currentDb === "singlebase") {
    try {
      const store = getSinglebaseStore();
      if (store) {
        const r = await store.list("tryout_history", { limit: 1000 });
        if (r.ok && Array.isArray(r.data)) {
          let data = r.data;
          if (email) {
            data = data.filter(h => h.userId === email);
          }
          return res.json(data);
        }
      }
    } catch (e) {
      console.warn("Singlebase fetch tryout history failed:", e.message);
    }
  } else if (currentDb === "supabase") {
    const client = getSupabaseClient();
    if (client) {
      try {
        let query = client.from("tryout_history").select("*");
        if (email) {
          query = query.eq("userId", email);
        }
        const { data, error } = await query;
        if (!error && data) {
          return res.json(data);
        }
        if (error) {
          console.warn("Supabase fetch tryout history error:", error.message);
        }
      } catch (e) {
        console.warn("Supabase connection for tryout history failed:", e.message);
      }
    }
  }

  let filtered = cacheTryoutHistory;
  if (email) {
    filtered = cacheTryoutHistory.filter(h => h.userId === email);
  }
  res.json(filtered);
});

// POST Tryout History
app.post("/api/v1/tryout_history", async (req, res) => {
  const history = req.body;
  if (!history.id) history.id = "th-" + Math.random().toString(36).substr(2, 9);
  cacheTryoutHistory.push(history);

  const currentDb = dbType();
  if (currentDb === "singlebase") {
    try {
      const store = getSinglebaseStore();
      if (store) {
        const payload = {
          id: history.id,
          tryoutId: history.tryoutId,
          tryoutJudul: history.tryoutJudul,
          selesai: history.selesai,
          skorTPS: history.skorTPS,
          skorLiterasi: history.skorLiterasi,
          skorTotal: history.skorTotal,
          tanggalAmbil: history.tanggalAmbil,
          subtestScores: history.subtestScores,
          userId: history.userId || history.email || "anonymous"
        };
        await store.set("tryout_history", history.id, payload);
      }
    } catch (e) {
      console.error("Gagal menyimpan tryout history ke Singlebase:", e.message);
    }
  } else if (currentDb === "supabase") {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client.from("tryout_history").insert([{
          id: history.id,
          tryoutId: history.tryoutId,
          tryoutJudul: history.tryoutJudul,
          selesai: history.selesai,
          skorTPS: history.skorTPS,
          skorLiterasi: history.skorLiterasi,
          skorTotal: history.skorTotal,
          tanggalAmbil: history.tanggalAmbil,
          subtestScores: history.subtestScores,
          userId: history.userId || history.email || "anonymous"
        }]);
        if (error) {
          console.error("Failed saving tryout history to Supabase:", error.message);
        }
      } catch (e) {
        console.error("Failed pushing tryout history to Supabase:", e.message);
      }
    }
  }
  res.json({ success: true, item: history });
});

// Configure Vite or Static Asset File Serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EduPTN server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

setupServer();
