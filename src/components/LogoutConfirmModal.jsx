import React, { useEffect, useRef } from "react";
import { LogOut, ShieldCheck, AlertTriangle, X, User } from "lucide-react";

/**
 * LogoutConfirmModal
 * Props:
 *   isOpen    — boolean
 *   user      — { name, email, role }
 *   isAdmin   — boolean (admin melihat user yang akan di-logout)
 *   targetUser — object | null (jika admin force-logout user tertentu; null = logout diri sendiri)
 *   onConfirm — () => void
 *   onCancel  — () => void
 */
export default function LogoutConfirmModal({
  isOpen,
  user,
  isAdmin = false,
  targetUser = null,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  // Tutup modal saat tekan Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    // Trap scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onCancel]);

  // Focus tombol konfirmasi saat modal terbuka
  useEffect(() => {
    if (isOpen && confirmRef.current) {
      setTimeout(() => confirmRef.current?.focus(), 80);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Tentukan konteks: apakah ini admin logout user lain, atau logout diri sendiri
  const isAdminForcingOther = isAdmin && targetUser && targetUser.id !== user?.id;
  const subjectName = isAdminForcingOther ? targetUser.name : user?.name;
  const subjectEmail = isAdminForcingOther ? targetUser.email : user?.email;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      onClick={onCancel}
    >
      {/* Blurred overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md rounded-3xl border border-gray-200/60 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#0E1320] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-zinc-800 dark:hover:text-white transition-all cursor-pointer"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header with icon */}
        <div className="flex flex-col items-center px-6 pt-8 pb-5 text-center">
          {/* Icon ring */}
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-red-500/10 blur-xl scale-150" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-200/60 dark:bg-red-500/10 dark:border-red-500/20 shadow-lg shadow-red-500/10">
              {isAdminForcingOther ? (
                <ShieldCheck className="h-8 w-8 text-red-500" />
              ) : (
                <LogOut className="h-8 w-8 text-red-500" />
              )}
            </div>
            {isAdmin && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 shadow">
                <ShieldCheck className="h-3 w-3 text-white" />
              </span>
            )}
          </div>

          {/* Title */}
          <h2
            id="logout-modal-title"
            className="text-lg font-black text-gray-900 dark:text-white font-display"
          >
            {isAdminForcingOther
              ? "Paksa Logout Pengguna?"
              : "Konfirmasi Keluar Akun"}
          </h2>

          {/* Subtitle */}
          <p className="mt-1.5 text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
            {isAdminForcingOther ? (
              <>
                Anda akan memaksa sesi aktif pengguna berikut untuk berakhir
                secara permanen.
              </>
            ) : isAdmin ? (
              <>
                Anda sedang logout dari akun{" "}
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  Super Admin
                </span>
                . Semua sesi aktif akan diakhiri.
              </>
            ) : (
              <>
                Semua progres sesi belajar aktif Anda akan disimpan. Anda dapat
                login kembali kapan saja.
              </>
            )}
          </p>
        </div>

        {/* User Info Card */}
        <div className="mx-6 mb-5 flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-zinc-700/60 dark:bg-zinc-800/60">
          {/* Avatar - show photo if available, otherwise initial */}
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={subjectName || "User"}
              className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-sm"
              onError={(e) => {
                // Fallback ke initials jika gambar error
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white shadow ${
              isAdminForcingOther
                ? "bg-blue-500"
                : isAdmin
                ? "bg-amber-500"
                : "bg-teal-600"
            }`}
            style={{ display: user?.avatar ? 'none' : 'flex' }}
          >
            {subjectName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                {subjectName || "Pengguna"}
              </p>
              {/* Role badge */}
              {isAdminForcingOther ? (
                <span className="shrink-0 rounded bg-blue-50 border border-blue-200/60 px-1.5 py-px text-[9px] font-bold text-blue-600 uppercase tracking-wide dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
                  {targetUser?.role || "Siswa"}
                </span>
              ) : isAdmin ? (
                <span className="shrink-0 rounded bg-amber-50 border border-amber-200/60 px-1.5 py-px text-[9px] font-bold text-amber-600 uppercase tracking-wide dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400">
                  Admin
                </span>
              ) : (
                <span className="shrink-0 rounded bg-teal-50 border border-teal-200/60 px-1.5 py-px text-[9px] font-bold text-teal-600 uppercase tracking-wide dark:bg-teal-500/10 dark:border-teal-500/20 dark:text-teal-400">
                  Siswa
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-zinc-500">
              {subjectEmail || "—"}
            </p>
          </div>
          <User className="h-4 w-4 shrink-0 text-gray-300 dark:text-zinc-600" />
        </div>

        {/* Warning notice for admin force-logout */}
        {isAdminForcingOther && (
          <div className="mx-6 mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50/80 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 leading-relaxed">
              Tindakan ini akan mengakhiri semua sesi aktif pengguna tersebut di
              seluruh perangkat. Data yang belum tersimpan akan hilang.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 border-t border-gray-100 dark:border-zinc-800 px-6 py-4">
          {/* Cancel */}
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 cursor-pointer active:scale-[0.98]"
          >
            Batalkan
          </button>

          {/* Confirm */}
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isAdminForcingOther
                ? "bg-red-600 hover:bg-red-500 shadow-red-600/25 focus:ring-red-500"
                : "bg-red-500 hover:bg-red-400 shadow-red-500/25 focus:ring-red-400"
            }`}
          >
            {isAdminForcingOther ? (
              <>
                <ShieldCheck className="h-4 w-4" />
                Paksa Logout
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Ya, Keluar Sekarang
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
