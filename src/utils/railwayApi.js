/**
 * railwayApi.js
 * Service layer untuk komunikasi dengan Railway backend API.
 * Base URL: https://utbk-backend-production.up.railway.app/api/v1
 *
 * Semua request yang butuh auth akan menyertakan Bearer token dari localStorage.
 * Jika Railway tidak tersedia, fungsi akan throw error agar caller bisa fallback.
 */

export const RAILWAY_BASE_URL =
  import.meta.env.VITE_RAILWAY_API_URL ||
  "https://utbk-backend-production.up.railway.app/api/v1";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem("utbk_token");

const authHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Wrapper fetch yang melempar error jika response tidak ok.
 * Mengembalikan parsed JSON.
 */
async function apiFetch(path, options = {}) {
  const url = `${RAILWAY_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const errBody = await res.json();
      errMsg = errBody.message || errBody.error || errMsg;
    } catch (_) { }
    throw new Error(errMsg);
  }

  return res.json();
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const authApi = {
  /**
   * Register akun baru.
   * POST /auth/register
   * Body: { email, name, password }
   * Returns: { user, token }
   */
  register: (email, name, password) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, name, password }),
    }),

  /**
   * Login.
   * POST /auth/login
   * Body: { email, password }
   * Returns: { user, token }
   */
  login: (email, password) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  /**
   * Logout — invalidate token di server.
   * POST /auth/logout
   */
  logout: () => {
    console.log("[Railway] Mengirim logout request...");
    return apiFetch("/auth/logout", { method: "POST" });
  },

  /**
   * Ambil profil user yang sedang login.
   * GET /auth/me
   * Returns: { user }
   */
  me: () => apiFetch("/auth/me"),

  /**
   * Ubah role user (ADMIN only).
   * PATCH /auth/role
   * Body: { userId, role }
   */
  changeRole: (userId, role) =>
    apiFetch("/auth/role", {
      method: "PATCH",
      body: JSON.stringify({ userId, role }),
    }),
};

// ─── SOAL ────────────────────────────────────────────────────────────────────

export const soalApi = {
  /**
   * Ambil daftar soal, bisa difilter by mapel.
   * GET /soal?mapel=TPS
   */
  list: (mapel) => {
    const qs = mapel ? `?mapel=${encodeURIComponent(mapel)}` : "";
    return apiFetch(`/soal${qs}`);
  },

  /** GET /soal/:id */
  get: (id) => apiFetch(`/soal/${id}`),

  /** POST /soal — ADMIN only */
  create: (payload) =>
    apiFetch("/soal", { method: "POST", body: JSON.stringify(payload) }),

  /** PUT /soal/:id — ADMIN only */
  update: (id, payload) =>
    apiFetch(`/soal/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  /** DELETE /soal/:id — ADMIN only */
  delete: (id) => apiFetch(`/soal/${id}`, { method: "DELETE" }),
};

// ─── LATIHAN (Practice Session) ──────────────────────────────────────────────

export const latihanApi = {
  /**
   * Mulai sesi latihan.
   * POST /latihan/mulai
   * Body: { mapel }
   * Returns: { session, soal[] }
   */
  mulai: (mapel) =>
    apiFetch("/latihan/mulai", {
      method: "POST",
      body: JSON.stringify({ mapel, jumlah: 20 }),
    }),

  /**
   * Submit jawaban sesi latihan.
   * POST /latihan/:sessionId/submit
   * Body: { jawaban: [{ soalId, jawaban }] }
   */
  submit: (sessionId, jawaban) =>
    apiFetch(`/latihan/${sessionId}/submit`, {
      method: "POST",
      body: JSON.stringify({ jawabans: jawaban }),
    }),

  /** GET /latihan/riwayat — riwayat semua sesi milik siswa */
  riwayat: () => apiFetch("/latihan/riwayat"),

  /** GET /latihan/:sessionId — detail sesi + hasil */
  detail: (sessionId) => apiFetch(`/latihan/${sessionId}`),
};

// ─── TRYOUT ──────────────────────────────────────────────────────────────────

export const tryoutApi = {
  /**
   * Daftar tryout PUBLISHED & ONGOING (SISWA).
   * GET /tryout
   */
  list: () => apiFetch("/tryout"),

  /**
   * Detail tryout.
   * GET /tryout/:id
   */
  get: (id) => apiFetch(`/tryout/${id}`),

  /**
   * Mulai sesi tryout — mendapat soal TPS pertama.
   * POST /tryout/:id/mulai
   * Returns: { sesiId, subtes, soal[] }
   */
  mulai: (tryoutId) =>
    apiFetch(`/tryout/${tryoutId}/mulai`, { method: "POST" }),

  /**
   * Submit jawaban subtes aktif, lanjut ke subtes berikutnya.
   * POST /tryout/sesi/:sesiId/submit-subtes
   * Body: { jawaban: [{ soalId, jawaban }] }
   */
  submitSubtes: (sesiId, jawaban) =>
    apiFetch(`/tryout/sesi/${sesiId}/submit-subtes`, {
      method: "POST",
      body: JSON.stringify({ jawaban }),
    }),

  /**
   * Selesaikan tryout & hitung skor final.
   * POST /tryout/sesi/:sesiId/selesai
   */
  selesai: (sesiId) =>
    apiFetch(`/tryout/sesi/${sesiId}/selesai`, { method: "POST" }),

  /**
   * Lihat hasil sesi tryout.
   * GET /tryout/sesi/:sesiId/hasil
   */
  hasil: (sesiId) => apiFetch(`/tryout/sesi/${sesiId}/hasil`),

  /**
   * Riwayat sesi tryout milik siswa.
   * GET /tryout/sesi/riwayat
   */
  riwayat: () => apiFetch("/tryout/sesi/riwayat"),

  // ── ADMIN endpoints ──

  /** POST /tryout — buat tryout baru (DRAFT) */
  create: (payload) =>
    apiFetch("/tryout", { method: "POST", body: JSON.stringify(payload) }),

  /** PATCH /tryout/:id/status — update status tryout */
  updateStatus: (id, status) =>
    apiFetch(`/tryout/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  /** POST /tryout/:id/subtes — tambah/replace soal di subtes */
  setSubtes: (id, payload) =>
    apiFetch(`/tryout/${id}/subtes`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** DELETE /tryout/:id — hapus tryout DRAFT */
  delete: (id) => apiFetch(`/tryout/${id}`, { method: "DELETE" }),
};

// ─── PTN & JURUSAN ───────────────────────────────────────────────────────────

export const ptnApi = {
  /**
   * Daftar PTN dengan filter opsional.
   * GET /ptn?provinsi=&tipe=&akreditasi=&search=
   */
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return apiFetch(`/ptn${qs ? `?${qs}` : ""}`);
  },

  /** GET /ptn/:id — detail PTN beserta semua jurusannya */
  get: (id) => apiFetch(`/ptn/${id}`),

  /** POST /ptn — ADMIN only */
  create: (payload) =>
    apiFetch("/ptn", { method: "POST", body: JSON.stringify(payload) }),

  /** PUT /ptn/:id — ADMIN only */
  update: (id, payload) =>
    apiFetch(`/ptn/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  /** DELETE /ptn/:id — ADMIN only */
  delete: (id) => apiFetch(`/ptn/${id}`, { method: "DELETE" }),

  // ── Jurusan ──

  /**
   * Daftar jurusan dari PTN tertentu.
   * GET /ptn/:ptnId/jurusan?kelompok=&jenjang=&search=
   */
  listJurusan: (ptnId, params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return apiFetch(`/ptn/${ptnId}/jurusan${qs ? `?${qs}` : ""}`);
  },

  /**
   * Daftar semua jurusan dari semua PTN.
   * GET /ptn/jurusan?kelompok=&jenjang=&search=
   */
  listAllJurusan: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return apiFetch(`/ptn/jurusan${qs ? `?${qs}` : ""}`);
  },

  /** GET /ptn/jurusan/:id — detail jurusan beserta data PTN */
  getJurusan: (id) => apiFetch(`/ptn/jurusan/${id}`),

  /** POST /ptn/jurusan — ADMIN only */
  createJurusan: (payload) =>
    apiFetch("/ptn/jurusan", { method: "POST", body: JSON.stringify(payload) }),

  /** PUT /ptn/jurusan/:id — ADMIN only */
  updateJurusan: (id, payload) =>
    apiFetch(`/ptn/jurusan/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  /** DELETE /ptn/jurusan/:id — ADMIN only */
  deleteJurusan: (id) =>
    apiFetch(`/ptn/jurusan/${id}`, { method: "DELETE" }),
};

// ─── INFO JALUR PTN ──────────────────────────────────────────────────────────

export const jalurApi = {
  /** GET /info/jalur — daftar semua jalur masuk PTN */
  list: () => apiFetch("/info/jalur"),

  /** GET /info/jalur/:slug — detail jalur tertentu */
  get: (slug) => apiFetch(`/info/jalur/${slug}`),
};

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────

export const healthCheck = () =>
  fetch(`${RAILWAY_BASE_URL.replace("/api/v1", "")}/health`)
    .then((r) => r.json())
    .catch(() => ({ status: "offline" }));
