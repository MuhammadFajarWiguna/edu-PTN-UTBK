/**
 * api.js
 * Unified API service untuk EduPTN.
 *
 * Strategi:
 *  1. Coba Railway backend (production) terlebih dahulu.
 *  2. Jika gagal (network error / offline), fallback ke localStorage + mockData.
 *
 * Auth token disimpan di localStorage key "utbk_token".
 * User object disimpan di localStorage key "utbk_user".
 */

import {
  authApi,
  tryoutApi,
  soalApi,
  latihanApi,
  ptnApi,
} from "./railwayApi";
import {
  MOCK_KAMPUS_IMPIAN,
  MOCK_MATERI,
  MOCK_SOAL,
  MOCK_COMMUNITY_POSTS,
  INITIAL_CALENDER_EVENTS,
  INITIAL_GAMIFICATION,
} from "../data/mockData";

// ─── Token helpers ────────────────────────────────────────────────────────────

const saveSession = (user, token) => {
  localStorage.setItem("utbk_token", token);
  localStorage.setItem("utbk_user", JSON.stringify(user));
};



const clearSession = () => {
  localStorage.removeItem("utbk_token");
  localStorage.removeItem("utbk_user");
};

/**
 * Normalisasi raw user object dari API menjadi format standar app.
 * Dipanggil di login, register, dan getCurrentUser agar konsisten.
 */
const normalizeUser = (rawUser, fallbackName) => {
  if (!rawUser) return null;
  return {
    id: rawUser.id,
    email: rawUser.email,
    name: rawUser.user_metadata?.name || rawUser.name || fallbackName || rawUser.email,
    // app_metadata.role dulu, baru rawUser.role (karena rawUser.role = "authenticated" dari Supabase)
    role: rawUser.app_metadata?.role || (rawUser.role !== "authenticated" ? rawUser.role : null) || "SISWA",
    createdAt: rawUser.created_at || rawUser.createdAt,
  };
};

// ─── Main apiService ──────────────────────────────────────────────────────────

export const apiService = {
  // ── Token ──────────────────────────────────────────────────────────────────

  getSavedToken: () => localStorage.getItem("utbk_token"),

  // ── AUTH ───────────────────────────────────────────────────────────────────

  // api.js — register
  register: async (email, name, password = "123456") => {
    try {
      const data = await authApi.register(email, name, password);
      const token = data.token || data.access_token || data.accessToken;
      const rawUser = data.data || data.user;
      const user = normalizeUser(rawUser, name);

      if (user) {
        // Token mungkin tidak ada jika butuh verifikasi email dulu
        if (token) {
          saveSession(user, token);
          _syncUserToLocalList(user);
        }
        return { user, token: token || null, message: data.message };
      }
      throw new Error("Format response register tidak sesuai");
    } catch (e) {
      console.error("[Railway] register gagal:", e.message);
      throw e;
    }
  },

  // api.js — login: simpan token dulu, lalu fetch /auth/me untuk dapat role lengkap
  login: async (email, password = "123456") => {
    try {
      const data = await authApi.login(email, password);
      console.log("LOGIN RESPONSE:", data);

      const token = data.token || data.access_token || data.accessToken;
      // Ambil user dari response login (mungkin belum ada role-nya)
      const rawUser = data.data || data.user;
      const userFromLogin = normalizeUser(rawUser);

      if (!token || !userFromLogin) {
        throw new Error("Format response login tidak sesuai");
      }

      // Simpan token & user sementara agar /auth/me bisa pakai Authorization header
      saveSession(userFromLogin, token);

      // Langsung panggil /auth/me untuk mendapatkan user LENGKAP termasuk role
      // (/auth/login API tidak selalu mengembalikan role di response-nya)
      try {
        const meData = await authApi.me();
        const rawMeUser = meData.data || meData.user || meData;
        const fullUser = normalizeUser(rawMeUser);
        if (fullUser && fullUser.id) {
          // Simpan user lengkap dengan role yang benar
          saveSession(fullUser, token);
          _syncUserToLocalList(fullUser);
          console.log("[Railway] Login berhasil, user role:", fullUser.role);
          return { user: fullUser, token };
        }
      } catch (meErr) {
        // /auth/me gagal — pakai data dari login response saja
        console.warn("[Railway] /auth/me setelah login gagal, pakai data login:", meErr.message);
      }

      _syncUserToLocalList(userFromLogin);
      return { user: userFromLogin, token };
    } catch (e) {
      console.error("[Railway] login gagal:", e.message);
      throw e;
    }
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem("utbk_token");
    if (!token) return null;

    // Token mock: langsung pakai cache
    if (token.startsWith("mock-jwt")) {
      const saved = localStorage.getItem("utbk_user");
      return saved ? JSON.parse(saved) : null;
    }

    try {
      const data = await authApi.me();
      // /auth/me Railway dapat return: { data: {...} } atau { user: {...} } atau langsung objek user
      const rawUser = data.data || data.user || data;
      // Normalisasi agar role & nama selalu ada — sama persis seperti saat login
      const user = normalizeUser(rawUser);
      if (user) {
        saveSession(user, token); // Update cache dengan data yang sudah dinormalisasi
      }
      return user;
    } catch (e) {
      console.warn("[Railway] /auth/me gagal, pakai cache:", e.message);
      const saved = localStorage.getItem("utbk_user");
      // Cache sudah dinormalisasi saat login, jadi aman dipakai langsung
      return saved ? JSON.parse(saved) : null;
    }
  },

  logout: async () => {
    const token = localStorage.getItem("utbk_token");
    if (token && !token.startsWith("mock-jwt")) {
      try {
        await authApi.logout();
        console.log("[Railway] Logout berhasil dari server");
      } catch (e) {
        // Tetap clear session meski logout server gagal
        console.warn("[Railway] Logout server gagal, clear session lokal:", e.message);
      }
    }
    clearSession();
  },

  /**
   * Social OAuth login via Supabase.
   * provider: "google" | "facebook" | "linkedin_oidc" | "instagram"
   * Supabase akan redirect browser ke halaman provider, lalu kembali ke app.
   * Setelah callback, panggil getCurrentUser() untuk mendapatkan data user.
   */
  socialLogin: async (provider) => {
    try {
      // Import dinamis agar tidak break jika VITE_SUPABASE_URL belum di-set
      const { supabase } = await import("./supabaseClient");
      const redirectTo = `${window.location.origin}${window.location.pathname}`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: {
            // Paksa pilih akun setiap kali (hindari auto-select cached account)
            prompt: "select_account",
          },
        },
      });
      if (error) throw new Error(error.message);
      console.log(`[Supabase] OAuth ${provider} dimulai, redirect ke provider...`);
      return data;
    } catch (e) {
      console.error(`[Supabase] socialLogin(${provider}) gagal:`, e.message);
      throw e;
    }
  },

  /**
   * Dipanggil saat app load setelah OAuth callback.
   * Baca session dari Supabase, simpan ke localStorage agar compatible dgn flow biasa.
   */
  handleOAuthCallback: async () => {
    try {
      const { supabase } = await import("./supabaseClient");
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) return null;

      const rawUser = session.user;
      const user = normalizeUser(rawUser, rawUser.user_metadata?.full_name || rawUser.email);
      if (user) {
        saveSession(user, session.access_token);
        _syncUserToLocalList(user);
        console.log("[Supabase] OAuth callback sukses, user:", user.name);
      }
      return user;
    } catch (e) {
      console.warn("[Supabase] handleOAuthCallback gagal:", e.message);
      return null;
    }
  },

  // Force refresh user data from Railway API
  refreshUserFromRailway: async () => {
    const token = localStorage.getItem("utbk_token");
    if (!token || token.startsWith("mock-jwt")) {
      console.log("[Railway] Cannot refresh - using mock token");
      return null;
    }

    try {
      console.log("[Railway] Refreshing user data from API...");
      const data = await authApi.me();
      const rawUser = data.data || data.user || data;
      const user = normalizeUser(rawUser);
      if (user) saveSession(user, token);
      console.log("[Railway] User data refreshed successfully:", user);
      return user;
    } catch (e) {
      console.error("[Railway] Failed to refresh user data:", e.message);
      return null;
    }
  },

  // ── SOAL ───────────────────────────────────────────────────────────────────

 getQuestions: async (mapel, { forceRefresh = false } = {}) => {
  // Kalau forceRefresh atau cache tidak ada, fetch dari Railway
  const cached = localStorage.getItem("utbk_custom_soal");
  if (!forceRefresh && cached) {
    const all = JSON.parse(cached);
    return mapel ? all.filter((s) => s.mapel === mapel) : all;
  }

  try {
    const data = await soalApi.list(mapel);
    const list = Array.isArray(data) ? data : data.data || [];
    if (list.length > 0) {
      // Kalau fetch semua (tanpa filter mapel), update full cache
      if (!mapel) localStorage.setItem("utbk_custom_soal", JSON.stringify(list));
      return list;
    }
  } catch (e) {
    console.warn("[Railway] getQuestions gagal, pakai cache:", e.message);
  }

  // Fallback hanya jika Railway benar-benar tidak bisa dijangkau
  if (cached) return mapel ? JSON.parse(cached).filter((s) => s.mapel === mapel) : JSON.parse(cached);
  return MOCK_SOAL;
},

  saveQuestions: (soalList) => {
    localStorage.setItem("utbk_custom_soal", JSON.stringify(soalList));
  },

  invalidateSoalCache: () => {
  localStorage.removeItem("utbk_custom_soal");
  console.log("[EduPTN] Soal cache cleared — siswa akan fetch fresh dari Railway");
},

  // ── MATERI ─────────────────────────────────────────────────────────────────

  getMaterials: () => {
    const saved = localStorage.getItem("utbk_custom_materi");
    if (!saved) {
      localStorage.setItem("utbk_custom_materi", JSON.stringify(MOCK_MATERI));
      return MOCK_MATERI;
    }
    return JSON.parse(saved);
  },

  saveMaterials: (materiList) => {
    localStorage.setItem("utbk_custom_materi", JSON.stringify(materiList));
  },

  // ── TRYOUT ─────────────────────────────────────────────────────────────────

  /**
   * Ambil daftar tryout PUBLISHED & ONGOING dari Railway.
   */
  getTryouts: async () => {
    try {
      const data = await tryoutApi.list();
      const list = Array.isArray(data) ? data : data.data || [];

      return list;
    } catch (e) {
      console.warn("[Railway] getTryouts gagal:", e.message);
      return [];
    }
  },

  /**
   * Mulai sesi tryout di Railway.
   * Returns: { sesiId, subtes, soal[] }
   */
  startTryout: async (tryoutId) => {
    const data = await tryoutApi.mulai(tryoutId);
    return data;
  },

  /**
   * Submit jawaban subtes aktif.
   * jawaban: [{ soalId, jawaban }]
   */
  submitSubtes: async (sesiId, jawaban) => {
    const data = await tryoutApi.submitSubtes(sesiId, jawaban);
    return data;
  },

  /**
   * Selesaikan tryout & ambil skor final.
   */
  selesaiTryout: async (sesiId) => {
    const data = await tryoutApi.selesai(sesiId);
    return data;
  },

  /**
   * Ambil hasil sesi tryout.
   */
  hasilTryout: async (sesiId) => {
    const data = await tryoutApi.hasil(sesiId);
    return data;
  },

  /**
   * Riwayat sesi tryout siswa dari Railway.
   */
  getTryoutRiwayat: async () => {
    try {
      const data = await tryoutApi.riwayat();
      return Array.isArray(data) ? data : data.data || [];
    } catch (e) {
      console.warn("[Railway] getTryoutRiwayat gagal:", e.message);
      return [];
    }
  },

  // ── LATIHAN (Practice) ─────────────────────────────────────────────────────

  startSession: async (mapel) => {
  const token = localStorage.getItem("utbk_token");
  const isMockToken = !token || token.startsWith("mock-jwt");

  if (isMockToken) {
    console.warn("[Railway] startSession: token tidak valid, pakai fallback lokal");
    return await _localFallbackSession(mapel);
  }

  try {
    const data = await latihanApi.mulai(mapel);
    const result = data.data || data;

    const session = result.session || result;
    const soal = result.soal || result.questions || [];

    if (soal.length === 0) {
      console.warn("[Railway] startSession: Railway return soal kosong untuk mapel", mapel);
      const localSoal = await apiService.getQuestions(mapel, { forceRefresh: false });
      return {
        session,
        soal: localSoal.slice(0, 20),
        _fallbackSoal: true,
      };
    }

    return { session, soal };

  } catch (e) {
    const isAuthError = e.message?.includes("401") ||
      e.message?.includes("403") ||
      e.message?.toLowerCase().includes("unauthorized") ||
      e.message?.toLowerCase().includes("forbidden");

    const isNetworkError = e.message?.includes("Failed to fetch") ||
      e.message?.includes("NetworkError") ||
      e.message?.includes("ERR_");

    if (isAuthError) {
      console.error("[Railway] startSession: Auth error —", e.message);
      throw new Error("Sesi login kamu sudah habis. Silakan logout lalu login ulang.");
    }

    if (isNetworkError) {
      // Benar-benar offline — fallback ke lokal boleh karena tidak ada pilihan lain
      console.warn("[Railway] startSession: Network error, fallback lokal —", e.message);
      return await _localFallbackSession(mapel);
    }

    // Error lain (500, dll) — fallback lokal
    console.warn("[Railway] startSession gagal, fallback lokal:", e.message);
    return await _localFallbackSession(mapel);
  }
},

submitSession: async (sessionId, jawabanArray) => {
  if (sessionId?.startsWith("local-sess-")) {
    console.warn("[Railway] submitSession: local session, hitung hasil lokal");
    const benar = Math.floor(jawabanArray.length * 0.6); // simulasi 60% benar
    const salah = jawabanArray.length - benar;
    return {
      benar,
      salah,
      skor: Math.round((benar / Math.max(jawabanArray.length, 1)) * 800),
      selesai: true,
      _isLocal: true,
    };
  }

  try {
    const data = await latihanApi.submit(sessionId, jawabanArray);
    const result = data.data || data;
    return {
      ...result,
      benar: result.jumlahBenar ?? result.benar ?? result.correct ?? 0,
      salah: result.jumlahSalah ?? result.salah ?? result.wrong ?? 0,
      skor: result.skor ?? result.score ?? 0,
      selesai: true,
    };
  } catch (e) {
    const isAuthError = e.message?.includes("401") ||
      e.message?.includes("403") ||
      e.message?.toLowerCase().includes("unauthorized");

    if (isAuthError) {
      throw new Error("Sesi login kamu sudah habis. Silakan logout lalu login ulang.");
    }

    console.warn("[Railway] submitSession gagal:", e.message);
    throw e;
  }
},

  getLatihanRiwayat: async () => {
    try {
      const data = await latihanApi.riwayat();
      return Array.isArray(data) ? data : data.data || [];
    } catch (e) {
      console.warn("[Railway] getLatihanRiwayat gagal:", e.message);
      return [];
    }
  },

  // ── PTN & JURUSAN ──────────────────────────────────────────────────────────

  /**
   * Ambil daftar PTN dari Railway.
   * params: { provinsi, tipe, akreditasi, search }
   */
  getPTNList: async (params = {}) => {
    try {
      const data = await ptnApi.list(params);
      const list = Array.isArray(data) ? data : data.data || [];
      if (list.length > 0) {
        localStorage.setItem("utbk_ptn_cache", JSON.stringify(list));
        return list;
      }
    } catch (e) {
      console.warn("[Railway] getPTNList gagal, pakai cache:", e.message);
    }

    const cached = localStorage.getItem("utbk_ptn_cache");
    return cached ? JSON.parse(cached) : [];
  },

  /**
   * Ambil detail PTN beserta jurusannya.
   */
  getPTNDetail: async (id) => {
    try {
      return await ptnApi.get(id);
    } catch (e) {
      console.warn("[Railway] getPTNDetail gagal:", e.message);
      return null;
    }
  },

  /**
   * Ambil semua jurusan dari semua PTN.
   * params: { kelompok, jenjang, search }
   */
  getAllJurusan: async (params = {}) => {
    try {
      const data = await ptnApi.listAllJurusan(params);
      const list = Array.isArray(data) ? data : data.data || [];
      if (list.length > 0) {
        localStorage.setItem("utbk_jurusan_cache", JSON.stringify(list));
        return list;
      }
    } catch (e) {
      console.warn("[Railway] getAllJurusan gagal, pakai cache:", e.message);
    }

    const cached = localStorage.getItem("utbk_jurusan_cache");
    if (cached) return JSON.parse(cached);

    // Fallback ke mock data lama
    return MOCK_KAMPUS_IMPIAN.map((k) => ({
      id: k.id,
      nama: k.jurusan,
      kelompok: k.kategori,
      passingGrade: k.pasingGrade,
      ptn: { nama: k.namaPTN, singkatan: k.namaPTN.match(/\(([^)]+)\)/)?.[1] || "" },
      // field tambahan untuk kompatibilitas
      _legacy: k,
    }));
  },

  // ── AI KONSULTASI ──────────────────────────────────────────────────────────

  /**
   * Kirim pesan ke Gemini API langsung dari browser (client-side).
   * Tidak lagi bergantung pada server proxy — memanggil Gemini REST API secara langsung.
   * Prioritas key: custom key dari localStorage → VITE_GEMINI_API_KEY dari env.
   */
  askGeminiChat: async (message, history) => {
    // Ambil API key: prioritas custom key dari user, lalu key dari env
    const apiKey =
      localStorage.getItem("utbk_custom_gemini_key")?.trim() ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      "";

    if (!apiKey) {
      throw new Error(
        "API Key Gemini tidak ditemukan. Silakan atur Custom API Key di panel Konsultan AI, atau tambahkan VITE_GEMINI_API_KEY di file .env."
      );
    }

    // System prompt khusus untuk konteks UTBK/SNBT
    const systemInstruction = {
      parts: [{
        text: `Anda adalah AI Mentor EduPTN, asisten belajar cerdas yang membantu siswa Indonesia mempersiapkan diri untuk UTBK SNBT 2026. 
Tugas Anda:
- Jelaskan konsep TPS (Penalaran Umum, Pengetahuan Kuantitatif, Literasi Bahasa), TKA (Matematika, Fisika, Kimia, Biologi, Sejarah, Sosiologi, Ekonomi, Geografi), dan pola soal SNBT.
- Bantu analisis soal-soal yang dikirim siswa, berikan pembahasan langkah demi langkah.
- Berikan rekomendasi strategi belajar, jadwal, dan tips menghadapi ujian.
- Informasikan tentang PTN, passing grade, dan peluang masuk.
- Selalu gunakan bahasa Indonesia yang ramah, jelas, dan memotivasi.
- Gunakan format Markdown (### untuk heading, - untuk bullet, **teks** untuk bold) agar jawaban rapi.
Jawab dalam bahasa Indonesia kecuali jika pertanyaan dalam bahasa Inggris.`
      }]
    };

    // Bangun riwayat percakapan dalam format Gemini
    const geminiContents = history.map((msg) => ({
      role: msg.role === "model" ? "model" : "user",
      parts: [{ text: msg.text || msg.parts?.[0]?.text || "" }],
    }));

    // Tambahkan pesan terbaru dari user
    geminiContents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Semua model menggunakan v1beta — endpoint yang mendukung system_instruction
    // dan memiliki ketersediaan model paling lengkap
    const MODEL_FALLBACKS = [
      "gemini-2.5-flash",        // terbaru, prioritas utama
      "gemini-2.0-flash",        // stabil, fallback 1
      "gemini-2.0-flash-lite",   // ringan, fallback 2
      "gemini-1.5-flash-latest", // fallback 3
      "gemini-1.5-flash-8b",     // paling ringan, last resort
    ];

    const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

    // Request body sama untuk semua model (v1beta semua)
    const requestBody = {
      system_instruction: systemInstruction,
      contents: geminiContents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    };

    let lastError = null;

    for (const model of MODEL_FALLBACKS) {
      const endpoint = `${BASE_URL}/${model}:generateContent?key=${apiKey}`;

      let response;
      try {
        response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
      } catch (networkErr) {
        console.error(`[Gemini] Network error saat mencoba ${model}:`, networkErr);
        lastError = new Error("Tidak dapat terhubung ke Gemini API. Periksa koneksi internet Anda.");
        continue;
      }

      // Sukses — ambil teks respons
      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          console.log(`[Gemini] Sukses menggunakan model: ${model}`);
          return text;
        }
        lastError = new Error("Gemini tidak mengembalikan respons yang valid.");
        continue;
      }

      // Parse error dari response
      let errMsg = `${model}: HTTP ${response.status}`;
      try {
        const errData = await response.json();
        errMsg = errData?.error?.message || errMsg;
      } catch (_) { /* ignore */ }

      console.warn(`[Gemini] Model ${model} gagal (${response.status}):`, errMsg);
      lastError = new Error(errMsg);

      // Error retryable: overload (503), rate limit (429), model tidak ditemukan (404)
      // Error fatal: API key salah (401) — stop langsung
      const isRetryable = response.status === 503 || response.status === 429 || response.status === 404;
      if (!isRetryable) {
        throw lastError;
      }
    }

    // Semua model gagal
    console.error("[Gemini] Semua model fallback gagal. Error terakhir:", lastError?.message);
    throw new Error(
      "Semua model AI sedang tidak tersedia saat ini. Silakan coba lagi dalam beberapa menit, atau gunakan Custom API Key Anda sendiri."
    );
  },

  // ── USER LIST (Admin) ──────────────────────────────────────────────────────

  getRegisteredUsers: () => {
    const saved = localStorage.getItem("utbk_registered_users");
    const defaultList = [
      { id: "usr-1", name: "Ahmad Rivaldi", email: "ahmad.rivaldi@gmail.com", role: "SISWA", createdAt: "2026-05-18T10:00:00Z", pilihanKampus: "Universitas Indonesia (UI) - Pendidikan Dokter" },
      { id: "usr-2", name: "Sarah Azzahra", email: "sarah.azzahra@outlook.com", role: "SISWA", createdAt: "2026-05-20T11:45:00Z", pilihanKampus: "Institut Teknologi Bandung (ITB) - STEI" },
      { id: "usr-3", name: "Budi Santoso", email: "budi.santoso@yahoo.com", role: "SISWA", createdAt: "2026-05-22T09:12:00Z", pilihanKampus: "Universitas Gadjah Mada (UGM) - Hukum" },
      { id: "usr-4", name: "Clara Angelica", email: "clara.angelica@gmail.com", role: "SISWA", createdAt: "2026-05-24T14:30:00Z", pilihanKampus: "Universitas Padjadjaran (UNPAD) - Ilmu Komunikasi" },
    ];
    if (!saved) {
      localStorage.setItem("utbk_registered_users", JSON.stringify(defaultList));
      return defaultList;
    }
    return JSON.parse(saved);
  },

  saveRegisteredUsers: (users) => {
    localStorage.setItem("utbk_registered_users", JSON.stringify(users));
  },

  // ── TRYOUT HISTORY (lokal + Railway) ──────────────────────────────────────

  getSavedTryoutHistory: () => {
    const saved = localStorage.getItem("utbk_tryout_history");
    const defaultHistory = [
      {
        id: "th-1",
        tryoutId: "to-1",
        tryoutJudul: "Tryout Akbar SNBT Nasional Jilid I",
        selesai: true,
        skorTPS: 620,
        skorLiterasi: 640,
        skorTotal: 630,
        tanggalAmbil: "2026-05-18T10:00:00Z",
        subtestScores: {
          "Penalaran Umum": 650,
          "Pengetahuan Kuantitatif": 580,
          "Pemahaman Bacaan": 630,
          "Penalaran Matematika": 615,
          "Literasi B. Indonesia": 655,
          "Literasi B. Inggris": 625,
        },
      },
      {
        id: "th-2",
        tryoutId: "to-2",
        tryoutJudul: "Simulasi Khusus Penalaran Kuantitatif",
        selesai: true,
        skorTPS: 690,
        skorLiterasi: 0,
        skorTotal: 690,
        tanggalAmbil: "2026-05-24T14:00:00Z",
        subtestScores: {
          "Penalaran Umum": 640,
          "Pengetahuan Kuantitatif": 720,
          "Penalaran Matematika": 710,
        },
      },
    ];
    if (!saved) {
      localStorage.setItem("utbk_tryout_history", JSON.stringify(defaultHistory));
      return defaultHistory;
    }
    return JSON.parse(saved);
  },

  saveTryoutHistory: (history) => {
    localStorage.setItem("utbk_tryout_history", JSON.stringify(history));
  },

  // ── KALENDER ───────────────────────────────────────────────────────────────

  getSavedSchedules: () => {
    const saved = localStorage.getItem("utbk_calendar");
    if (!saved) {
      localStorage.setItem("utbk_calendar", JSON.stringify(INITIAL_CALENDER_EVENTS));
      return INITIAL_CALENDER_EVENTS;
    }
    return JSON.parse(saved);
  },

  saveSchedule: (events) => {
    localStorage.setItem("utbk_calendar", JSON.stringify(events));
  },

  // ── GAMIFIKASI ─────────────────────────────────────────────────────────────

  getSavedGamifikasi: () => {
    const saved = localStorage.getItem("utbk_game");
    if (!saved) {
      localStorage.setItem("utbk_game", JSON.stringify(INITIAL_GAMIFICATION));
      return INITIAL_GAMIFICATION;
    }
    return JSON.parse(saved);
  },

  saveGamifikasi: (state) => {
    localStorage.setItem("utbk_game", JSON.stringify(state));
  },

  // ── FORUM POSTS ────────────────────────────────────────────────────────────

  getSavedPosts: () => {
    const saved = localStorage.getItem("utbk_posts");
    if (!saved) {
      localStorage.setItem("utbk_posts", JSON.stringify(MOCK_COMMUNITY_POSTS));
      return MOCK_COMMUNITY_POSTS;
    }
    return JSON.parse(saved);
  },

  savePosts: (posts) => {
    localStorage.setItem("utbk_posts", JSON.stringify(posts));
  },

  // ── SYNC (startup) ─────────────────────────────────────────────────────────

  /**
   * Sinkronisasi awal: ambil data dari Railway dan simpan ke cache lokal.
   * Dipanggil sekali saat app mount.
   */
  syncWithSupabase: async () => {
    // Nama fungsi dipertahankan untuk kompatibilitas dengan App.jsx
    try {
      // 1. Soal
      const soalData = await soalApi.list().catch(() => null);
      if (soalData && (Array.isArray(soalData) ? soalData : soalData.data || []).length > 0) {
        const list = Array.isArray(soalData) ? soalData : soalData.data;
        localStorage.setItem("utbk_custom_soal", JSON.stringify(list));
      }

      // 2. PTN & Jurusan
      const ptnData = await ptnApi.list().catch(() => null);
      if (ptnData && (Array.isArray(ptnData) ? ptnData : ptnData.data || []).length > 0) {
        const list = Array.isArray(ptnData) ? ptnData : ptnData.data;
        localStorage.setItem("utbk_ptn_cache", JSON.stringify(list));
      }

      const jurusanData = await ptnApi.listAllJurusan().catch(() => null);
      if (jurusanData && (Array.isArray(jurusanData) ? jurusanData : jurusanData.data || []).length > 0) {
        const list = Array.isArray(jurusanData) ? jurusanData : jurusanData.data;
        localStorage.setItem("utbk_jurusan_cache", JSON.stringify(list));
      }

      console.log("[EduPTN] Sinkronisasi Railway berhasil.");
    } catch (e) {
      console.warn("[EduPTN] Sinkronisasi Railway gagal, mode offline:", e.message);
    }
  },

  // ── ADMIN API SERVICES (Railway + Fallbacks) ───────────────────────────────

  fetchRegisteredUsers: async () => {
    try {
      const response = await fetch("/api/v1/users");
      if (response.ok) {
        const list = await response.json();
        if (Array.isArray(list) && list.length > 0) {
          localStorage.setItem("utbk_registered_users", JSON.stringify(list));
          return list;
        }
      }
    } catch (e) {
      console.warn("[Railway] fetchRegisteredUsers gagal, pakai cache:", e.message);
    }
    return apiService.getRegisteredUsers();
  },

  fetchMaterials: async () => {
    try {
      const response = await fetch("/api/v1/materi");
      if (response.ok) {
        const list = await response.json();
        if (Array.isArray(list) && list.length > 0) {
          localStorage.setItem("utbk_custom_materi", JSON.stringify(list));
          return list;
        }
      }
    } catch (e) {
      console.warn("[Railway] fetchMaterials gagal, pakai cache:", e.message);
    }
    return apiService.getMaterials();
  },

 createQuestion: async (payload) => {
  try {
    // Format opsi ke object { A: "...", B: "...", C: "..." }
    const opsiFormatted = Array.isArray(payload.opsi)
      ? Object.fromEntries(
          payload.opsi.filter(Boolean).map((val, idx) => [String.fromCharCode(65 + idx), val])
        )
      : payload.opsi;

    const cleanPayload = {
      pertanyaan: payload.pertanyaan,
      mapel: payload.mapel,
      subtest: payload.subtest,
      tingkat: payload.tingkat || "sedang",
      tipe: payload.tipe || "SINGLE_CHOICE",
      opsi: opsiFormatted,
      jawaban: payload.jawaban, // huruf: "A", "B", "C"
      pembahasan: payload.pembahasan || "",
    };

    const res = await soalApi.create(cleanPayload);
    // Invalidate cache supaya siswa dapat soal terbaru

    apiService.invalidateSoalCache();

    return res;
  } catch (e) {
    console.warn("[Railway] createQuestion gagal:", e.message);
    throw e; 
  }
},

  updateQuestion: async (id, payload) => {
    try {
      const res = await soalApi.update(id, payload);
      const freshList = await apiService.getQuestions();
      const idx = freshList.findIndex(q => q.id === id);
      if (idx > -1) {
        freshList[idx] = { ...freshList[idx], ...payload };
        apiService.saveQuestions(freshList);
      }
      apiService.invalidateSoalCache();
      return res;
    } catch (e) {
      console.warn("[Railway] updateQuestion gagal, save ke local cache:", e.message);
      const freshList = await apiService.getQuestions();
      const idx = freshList.findIndex(q => q.id === id);
      if (idx > -1) {
        freshList[idx] = { ...freshList[idx], ...payload };
        apiService.saveQuestions(freshList);
      }
      return { success: true, item: payload, offline: true };
    }
  },

  deleteQuestion: async (id) => {
    try {
      const res = await soalApi.delete(id);
      const freshList = await apiService.getQuestions();
      const filtered = freshList.filter(q => q.id !== id);
      apiService.saveQuestions(filtered);
      apiService.invalidateSoalCache();

      return res;
    } catch (e) {
      console.warn("[Railway] deleteQuestion gagal, remove dari local cache:", e.message);
      const freshList = await apiService.getQuestions();
      const filtered = freshList.filter(q => q.id !== id);
      apiService.saveQuestions(filtered);
      return { success: true, offline: true };
    }
  },

  createMaterial: async (payload) => {
    try {
      const response = await fetch("/api/v1/materi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      const list = apiService.getMaterials();
      list.push(payload);
      apiService.saveMaterials(list);
      return data;
    } catch (e) {
      console.warn("[Railway] createMaterial gagal, save ke local cache:", e.message);
      const list = apiService.getMaterials();
      list.push(payload);
      apiService.saveMaterials(list);
      return { success: true, item: payload, offline: true };
    }
  },

  updateMaterial: async (id, payload) => {
    const list = apiService.getMaterials();
    const idx = list.findIndex(m => m.id === id);
    if (idx > -1) {
      list[idx] = { ...list[idx], ...payload };
      apiService.saveMaterials(list);
    }
    return { success: true, item: payload };
  },

  deleteMaterial: async (id) => {
    const list = apiService.getMaterials();
    const filtered = list.filter(m => m.id !== id);
    apiService.saveMaterials(filtered);
    return { success: true };
  },

  // SESUDAH
createTryout: async (payload) => {
  try {
    // Prioritas: pakai durasiTPS/TKA dari form kalau ada
    // Fallback: bagi durasiMenit jika tidak ada
    const totalDurasi = parseInt(payload.durasiMenit) || 180;
    const durasiTPS = parseInt(payload.durasiTPS) || Math.floor(totalDurasi / 2);
    const durasiTKA = parseInt(payload.durasiTKA) || Math.ceil(totalDurasi / 2);

    // Validasi sebelum kirim ke Railway — tangkap lebih awal
    if (!durasiTPS || durasiTPS <= 0 || !durasiTKA || durasiTKA <= 0) {
      throw new Error("Durasi TPS dan TKA harus lebih dari 0 menit");
    }

    const cleanPayload = {
      judul: payload.judul,
      kategori: payload.kategori,
      status: payload.status || "DRAFT",
      totalSoal: parseInt(payload.totalSoal) || 155,
      durasiTPS,
      durasiTKA,
    };

    if (payload.jadwalMulai && payload.jadwalMulai.trim() !== "") {
      cleanPayload.mulaiAt = new Date(payload.jadwalMulai).toISOString();
    }
    if (payload.jadwalSelesai && payload.jadwalSelesai.trim() !== "") {
      cleanPayload.selesaiAt = new Date(payload.jadwalSelesai).toISOString();
    }

    console.log("[Railway] createTryout payload:", cleanPayload);
    const data = await tryoutApi.create(cleanPayload);
    return Array.isArray(data) ? data : data.data || data;
  } catch (e) {
    console.error("[Railway] createTryout gagal:", e.message);
    throw e;
  }
},

  updateTryoutStatus: async (id, status) => {
    try {
      return await tryoutApi.updateStatus(id, status);
    } catch (e) {
      console.warn("[Railway] updateTryoutStatus gagal, mock success locally:", e.message);
      return { success: true, offline: true };
    }
  },

  deleteTryout: async (id) => {
    try {
      return await tryoutApi.delete(id);
    } catch (e) {
      console.warn("[Railway] deleteTryout gagal, mock success locally:", e.message);
      return { success: true, offline: true };
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      const res = await authApi.changeRole(userId, role);
      const list = apiService.getRegisteredUsers();
      const idx = list.findIndex(u => u.id === userId);
      if (idx > -1) {
        list[idx].role = role;
        apiService.saveRegisteredUsers(list);
      }
      return res;
    } catch (e) {
      console.warn("[Railway] changeRole gagal, update ke local cache:", e.message);
      const list = apiService.getRegisteredUsers();
      const idx = list.findIndex(u => u.id === userId);
      if (idx > -1) {
        list[idx].role = role;
        apiService.saveRegisteredUsers(list);
      }
      return { success: true, offline: true };
    }
  },

  suspendUser: async (userId, isSuspended) => {
    const list = apiService.getRegisteredUsers();
    const idx = list.findIndex(u => u.id === userId);
    if (idx > -1) {
      list[idx].suspended = isSuspended;
      apiService.saveRegisteredUsers(list);
    }
    return { success: true };
  },

  resetUserPassword: async (userId, newPassword) => {
    return { success: true };
  },

  deleteUser: async (userId) => {
    const list = apiService.getRegisteredUsers();
    const filtered = list.filter(u => u.id !== userId);
    apiService.saveRegisteredUsers(filtered);
    return { success: true };
  },

  createPTN: async (payload) => {
    try {
      return await ptnApi.create(payload);
    } catch (e) {
      return { success: true, item: payload, offline: true };
    }
  },

  updatePTN: async (id, payload) => {
    try {
      return await ptnApi.update(id, payload);
    } catch (e) {
      return { success: true, item: payload, offline: true };
    }
  },

  deletePTN: async (id) => {
    try {
      return await ptnApi.delete(id);
    } catch (e) {
      return { success: true, offline: true };
    }
  },

  createJurusan: async (payload) => {
    try {
      return await ptnApi.createJurusan(payload);
    } catch (e) {
      return { success: true, item: payload, offline: true };
    }
  },

  updateJurusan: async (id, payload) => {
    try {
      return await ptnApi.updateJurusan(id, payload);
    } catch (e) {
      return { success: true, item: payload, offline: true };
    }
  },

  deleteJurusan: async (id) => {
    try {
      return await ptnApi.deleteJurusan(id);
    } catch (e) {
      return { success: true, offline: true };
    }
  },
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

// ─── Internal: fallback session lokal ────────────────────────────────────────

async function _localFallbackSession(mapel) {
  const allSoal = await apiService.getQuestions(mapel, { forceRefresh: false });
  const filtered = mapel
    ? allSoal.filter(s => s.mapel === mapel)
    : allSoal;

 
  const soalToUse = (filtered.length > 0 ? filtered : allSoal).slice(0, 20);

  return {
    session: {
      id: "local-sess-" + Math.random().toString(36).substring(2, 11),
      mapel,
      selesai: false,
      createdAt: new Date().toISOString(),
      _isLocal: true, // flag: session ini tidak bisa disubmit ke Railway
    },
    soal: soalToUse,
    _isLocalSession: true,
  };
}

function _syncUserToLocalList(user) {
  const list = apiService.getRegisteredUsers();
  const idx = list.findIndex(
    (u) => u.email?.toLowerCase() === user.email?.toLowerCase()
  );
  const entry = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt || new Date().toISOString(),
    pilihanKampus: "Belum Memilih",
  };
  if (idx > -1) {
    list[idx] = { ...list[idx], ...entry };
  } else {
    list.unshift(entry);
  }
  apiService.saveRegisteredUsers(list);
}
