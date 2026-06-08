import React, { useState } from "react";
import {
  GraduationCap, Mail, Lock, User, Eye, EyeOff,
  Loader2, AlertCircle, CheckCircle, ShieldCheck, ArrowRight,
  BookOpen, TrendingUp, Sparkles
} from "lucide-react";
import { apiService } from "../utils/api";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""
);

/**
 * AuthPage — Halaman login & register profesional.
 * Terhubung ke Railway API (/auth/login & /auth/register).
 * Fallback otomatis ke mode lokal jika Railway tidak tersedia.
 * Google OAuth menggunakan Supabase Auth untuk kompatibilitas Vercel.
 */
export default function AuthPage({ onAuthSuccess, darkMode, onToggleDarkMode }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Form fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetForm = () => {
    setEmail("");
    setName("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccessMsg("");
    setFieldErrors({});
    setShowPassword(false);
  };

  const switchMode = (newMode) => {
    resetForm();
    setMode(newMode);
  };

  // ── Validasi ──────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = "Email wajib diisi.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Format email tidak valid.";

    if (!password) errs.password = "Password wajib diisi.";
    else if (password.length < 6) errs.password = "Password minimal 6 karakter.";

    if (mode === "register") {
      if (!name.trim()) errs.name = "Nama lengkap wajib diisi.";
      else if (name.trim().length < 3) errs.name = "Nama minimal 3 karakter.";
      if (confirmPassword !== password) errs.confirmPassword = "Konfirmasi password tidak cocok.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === "register") {
        await apiService.register(email.trim(), name.trim(), password);
        // Hapus sesi agar tidak auto-login
        localStorage.removeItem("utbk_token");
        localStorage.removeItem("utbk_user");
        // Pindah ke mode login dengan pesan sukses
        resetForm();
        setMode("login");
        setError(""); // clear error
        // Tampilkan pesan sukses (pakai state baru)
        setSuccessMsg("Akun berhasil dibuat! Silakan login.");
      } else {
        const res = await apiService.login(email.trim(), password);
        if (res?.user) {
          onAuthSuccess(res.user);
        } else {
          setError("Respons server tidak valid. Coba lagi.");
        }
      }
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("Invalid") || msg.includes("credentials") || msg.includes("password") || msg.includes("401")) {
        setError("Email atau password salah. Periksa kembali.");
      } else if (msg.includes("already") || msg.includes("exists") || msg.includes("409")) {
        setError("Email sudah terdaftar. Silakan login.");
      } else if (msg.includes("network") || msg.includes("fetch") || msg.includes("Failed")) {
        setError("Tidak dapat terhubung ke server. Cek koneksi internet Anda.");
      } else {
        setError(msg || "Terjadi kesalahan. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth dengan Supabase ──────────────────────────────────────────
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        throw error;
      }

      // OAuth flow will redirect to Google, then back to callback
      // No need to do anything here, user will be redirected
    } catch (err) {
      console.error('Google OAuth error:', err);
      setError('Login dengan Google gagal: ' + (err.message || 'Coba lagi'));
      setLoading(false);
    }
  };

  // ── Quick login helper ────────────────────────────────────────────────────
 

  const inputBase =
    "w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2 dark:bg-zinc-900/60 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500";
  const inputNormal =
    "border-gray-200 focus:border-teal-500 focus:ring-teal-500/10 dark:border-zinc-700/80 dark:focus:border-teal-500";
  const inputError =
    "border-red-400 focus:border-red-400 focus:ring-red-400/10 dark:border-red-500/60";

  return (
    <div className="min-h-screen flex dark:bg-[#080C14] bg-slate-50 transition-colors">

      {/* ── Left panel — branding (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between bg-linear-to-br from-teal-600 via-teal-700 to-emerald-800 p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full border border-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 rounded-full border border-white/5" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="rounded-2xl bg-white/15 p-2.5 backdrop-blur-sm border border-white/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight">EduPTN</span>
            <span className="block text-teal-200 text-[10px] font-bold uppercase tracking-widest font-mono">UTBK-SNBT 2026</span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
              Raih PTN Impian<br />
              <span className="text-teal-200">Bersama EduPTN</span>
            </h1>
            <p className="text-teal-100/80 text-sm leading-relaxed max-w-sm">
              Platform persiapan UTBK-SNBT terlengkap dengan tryout CAT, analitik skor IRT, rekomendasi jurusan, dan bimbingan AI personal.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { icon: <BookOpen className="h-3.5 w-3.5" />, label: "Materi Lengkap" },
              { icon: <TrendingUp className="h-3.5 w-3.5" />, label: "Analitik IRT" },
              { icon: <Sparkles className="h-3.5 w-3.5" />, label: "AI Konsultan" },
              { icon: <GraduationCap className="h-3.5 w-3.5" />, label: "Rekomendasi PTN" },
            ].map((f) => (
              <span key={f.label} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                {f.icon} {f.label}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[
              { value: "10K+", label: "Siswa Aktif" },
              { value: "500+", label: "Soal Tryout" },
              { value: "98%", label: "Kepuasan" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-[10px] text-teal-200/70 font-medium uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-teal-200/50 text-[10px] font-mono">© 2026 EduPTN · Powered by Railway & Supabase</p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="rounded-xl bg-teal-600 p-2 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-gray-900 dark:text-white text-base">EduPTN</span>
            <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-widest font-mono">UTBK-SNBT 2026</span>
          </div>
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {mode === "login" ? "Selamat datang kembali" : "Buat akun baru"}
            </h2>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-zinc-400">
              {mode === "login"
                ? "Masuk untuk melanjutkan persiapan UTBK Anda."
                : "Daftar gratis dan mulai persiapan UTBK hari ini."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Nama — register only */}
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Contoh: Ahmad Rivaldi"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: "" })); }}
                    className={`${inputBase} ${fieldErrors.name ? inputError : inputNormal}`}
                    autoComplete="name"
                  />
                </div>
                {fieldErrors.name && <FieldError msg={fieldErrors.name} />}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-zinc-500" />
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
                  className={`${inputBase} ${fieldErrors.email ? inputError : inputNormal}`}
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && <FieldError msg={fieldErrors.email} />}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "register" ? "Minimal 6 karakter" : "Masukkan password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); }}
                  className={`${inputBase} pr-10 ${fieldErrors.password ? inputError : inputNormal}`}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && <FieldError msg={fieldErrors.password} />}
            </div>

            {/* Confirm password — register only */}
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: "" })); }}
                    className={`${inputBase} ${fieldErrors.confirmPassword ? inputError : inputNormal}`}
                    autoComplete="new-password"
                  />
                  {confirmPassword && confirmPassword === password && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  )}
                </div>
                {fieldErrors.confirmPassword && <FieldError msg={fieldErrors.confirmPassword} />}
              </div>
            )}

            {/* Global error */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 dark:border-red-500/20 dark:bg-red-950/20">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-red-700 dark:text-red-400 leading-snug">{error}</p>
              </div>
            )}

            {/* Success message */}
            {successMsg && (
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 dark:border-emerald-500/20 dark:bg-emerald-950/20">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 leading-snug">{successMsg}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary-hover w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-sm shadow-teal-600/20 hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none cursor-pointer mt-2"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</>
              ) : mode === "login" ? (
                <>Masuk ke Dashboard <ArrowRight className="h-4 w-4" /></>
              ) : (
                <>Buat Akun Sekarang <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          {/* Switch mode */}
         

          {/* Divider */}
          <div className="my-7 flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-zinc-700" />
            <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 px-2">Atau {mode === "login" ? "masuk" : "daftar"} dengan</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-zinc-700" />
          </div>

          {/* Social Login Buttons - Professional Design */}
          <div className="space-y-3">
            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="btn-secondary-hover group relative w-full flex items-center justify-center gap-3 rounded-xl bg-white border border-gray-200/80 px-5 py-3.5 text-sm font-semibold text-gray-700 shadow-sm dark:bg-zinc-900/60 dark:border-zinc-700/80 dark:text-zinc-200 overflow-hidden cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/50 to-red-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-blue-500/0 dark:via-blue-500/5 dark:to-red-500/0" />
              
              {/* Google Logo */}
              <svg className="relative h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              
              {/* Text */}
              <span className="relative">
                {loading ? "Mengarahkan ke Google..." : "Lanjutkan dengan Google"}
              </span>
              
              {/* Arrow indicator */}
              {!loading && (
                <svg className="relative h-4 w-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>

          {/* Switch mode */}
          <p className="mt-5 text-center text-xs text-gray-500 dark:text-zinc-400">
            {mode === "login" ? (
              <>Belum punya akun?{" "}
                <button onClick={() => switchMode("register")} className="link-hover font-bold text-teal-600 dark:text-teal-400 cursor-pointer">
                  Daftar gratis
                </button>
              </>
            ) : (
              <>Sudah punya akun?{" "}
                <button onClick={() => switchMode("login")} className="link-hover font-bold text-teal-600 dark:text-teal-400 cursor-pointer">
                  Masuk sekarang
                </button>
              </>
            )}
          </p>

          {/* Info note */}
          <p className="mt-6 text-center text-[10px] text-gray-400 dark:text-zinc-600 leading-relaxed">
            Masih punya pertanyaan seputar simulasi atau tryout? Tim kami siap membantu kamu mendapatkan jawaban terbaik.
          </p>
        </div>
      </div>
    </div>
  );
}

function FieldError({ msg }) {
  return (
    <p className="flex items-center gap-1.5 text-[11px] font-medium text-red-600 dark:text-red-400 mt-1">
      <AlertCircle className="h-3 w-3 shrink-0" /> {msg}
    </p>
  );
}
