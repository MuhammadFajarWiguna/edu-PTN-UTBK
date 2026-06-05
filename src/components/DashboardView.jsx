import React, { useState, useEffect } from "react";
import {
  Award,
  BookOpen,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  Compass,
  Flame,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Tv,
  Bell,
  PlusCircle,
  AlertTriangle,
  ChevronRight
} from "lucide-react";

export default function DashboardView({
  user,
  kampusImpian,
  history,
  schedules,
  gamifikasi,
  onNavigate,
  onAddPoint,
  onSetKampus,
  onCampusRecommendClick
}) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [ticker, setTicker] = useState(0);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Pendaftaran UTBK SNBT Gelombang 1 akan segera ditutup!", type: "warning", time: "Baru saja" },
    { id: 2, message: "Sarah memberi komentar di postingan diskusi Anda.", type: "comment", time: "1 jam yang lalu" },
    { id: 3, message: "Nilai Tryout Akbar Nasional ke-2 Anda sudah dihitung.", type: "success", time: "3 jam yang lalu" },
  ]);

  // UTBK Exam date: June 20, 2026
  useEffect(() => {
    const targetDate = new Date("2026-06-20T07:30:00Z");

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setCountdown({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Compute stats
  const averageScore = history.length > 0
    ? Math.round(history.reduce((acc, h) => acc + h.skorTotal, 0) / history.length)
    : 0;

  const highestScore = history.length > 0
    ? Math.max(...history.map(h => h.skorTotal))
    : 0;

  const handleClearNotif = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-slate-800 p-6 text-white shadow-md md:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-3.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-400 tracking-wider font-mono uppercase">
              <Sparkles className="h-3 w-3 text-emerald-400" /> EDISI UTBK SNBT 2026
            </span>
            <h1 className="text-2xl font-bold tracking-tight md:text-3.5xl font-display text-white">
              Selamat Datang, {user.name}!
            </h1>
            <h1
              className={`
    inline-flex items-center
    rounded-2xl
    px-5 py-2
    text-sm font-extrabold
    tracking-[0.25em]
    shadow-lg
    transition-all duration-300

    ${user.role === "ADMIN"
                  ? "bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 text-slate-900 animate-pulse shadow-yellow-400/40"

                  : user.role === "PREMIUM"
                    ? "bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white shadow-purple-500/40"

                    : "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-cyan-500/40"
                }
  `}
            >
              {user.role}
            </h1>
            <p className="max-w-xl text-slate-300 text-xs sm:text-sm leading-relaxed font-sans font-medium">
              Siap berjuang hari ini? Yuk kejar target belajarmu. Rata-rata tryout kamu saat ini adalah <strong className="text-emerald-400 font-extrabold underline decoration-emerald-400/40 decoration-2 underline-offset-4">{averageScore || "Belum ada"}</strong>. Tetap semangat mengasah penalaran!
            </p>
          </div>

          <div className="flex-shrink-0 flex items-start md:items-center md:flex-col gap-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Sisa Waktu UTBK
            </span>
            <div className="flex items-center gap-1.5 text-center font-display">
              <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-2.5 min-w-[54px] shadow-xxs">
                <span className="block text-xl font-bold text-teal-400 leading-none">{countdown.days}</span>
                <span className="text-[8px] uppercase tracking-widest text-[#B4C6EF]/60 font-semibold font-mono mt-1 block">Hari</span>
              </div>
              <span className="text-slate-500 font-bold">:</span>
              <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-2.5 min-w-[54px] shadow-xxs">
                <span className="block text-xl font-bold text-teal-400 leading-none">{countdown.hours}</span>
                <span className="text-[8px] uppercase tracking-widest text-[#B4C6EF]/60 font-semibold font-mono mt-1 block">Jam</span>
              </div>
              <span className="text-slate-500 font-bold">:</span>
              <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-2.5 min-w-[54px] shadow-xxs">
                <span className="block text-xl font-bold text-teal-400 leading-none">{countdown.minutes}</span>
                <span className="text-[8px] uppercase tracking-widest text-[#B4C6EF]/60 font-semibold font-mono mt-1 block">Mnt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Backdrop vectors */}
        <div className="absolute right-0 top-0 h-44 w-44 bg-teal-500/10 blur-3xl rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Core Study Tracker - 2 cols on wide, left side */}
        <div className="md:col-span-2 space-y-6">

          {/* Main Dashboard Actions card */}
          <div className="rounded-2xl border border-gray-100/80 bg-white p-6 shadow-xs dark:border-zinc-850 dark:bg-[#0E1320]/60">
            <h3 className="font-extrabold font-display text-sm text-gray-950 dark:text-white mb-5 tracking-tight">Aktivitas Prioritas Belajar</h3>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div
                onClick={() => onNavigate("materi")}
                className="rounded-xl border border-gray-100 bg-gray-50/20 p-5 relative overflow-hidden flex flex-col justify-between dark:border-zinc-800/60 dark:bg-[#111622]/40 group transition-all duration-300 hover:shadow-xs hover:-translate-y-1 hover:border-teal-500/40 hover:bg-white dark:hover:bg-[#111622] cursor-pointer"
              >
                <div className="space-y-2">
                  <span className="text-[9px] text-teal-600 font-bold uppercase tracking-widest font-mono select-none">Bimbel Mandiri</span>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white font-display leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Rangkuman Kisi-Kisi & Bank Pembahasan Soal</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed dark:text-zinc-400 font-medium">Silogisme deduktif, persamaan kuadrat parabola, skema logika kuantitatif.</p>
                </div>
                <button
                  className="mt-5 text-xs font-bold text-teal-700 hover:underline inline-flex items-center gap-1 dark:text-teal-400 cursor-pointer"
                >
                  Buka Modul Materi <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              <div
                onClick={() => onNavigate("tryout")}
                className="rounded-xl border border-gray-100 bg-gray-50/20 p-5 relative overflow-hidden flex flex-col justify-between dark:border-zinc-800/60 dark:bg-[#111622]/40 group transition-all duration-300 hover:shadow-xs hover:-translate-y-1 hover:border-indigo-500/40 hover:bg-white dark:hover:bg-[#111622] cursor-pointer"
              >
                <div className="space-y-2">
                  <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest font-mono select-none">Simulasi CAT</span>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white font-display leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Tryout Standarisasi Penilaian IRT 2026</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed dark:text-zinc-400 font-medium">Emulasi ujian penuh real-time, lobi simulasi tak terbatas, serta kunci jawaban instant.</p>
                </div>
                <button
                  className="mt-5 text-xs font-bold text-indigo-700 hover:underline inline-flex items-center gap-1 dark:text-indigo-400 cursor-pointer"
                >
                  Mulai Simulasi CAT <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Study Goals Target Tracks */}
          <div className="rounded-2xl border border-gray-100/80 bg-white p-6 shadow-xs dark:border-zinc-850 dark:bg-[#0E1320]/60">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4.5 mb-5 dark:border-zinc-850/60">
              <h3 className="font-extrabold font-display text-sm text-gray-950 dark:text-white tracking-tight">Pelacakan Sasaran Belajar</h3>
              {gamifikasi && (
                <span className="rounded-full bg-amber-500/15 border border-amber-500/10 px-2.5 py-0.5 text-[10px] font-mono text-amber-600 font-bold uppercase tracking-wider dark:text-amber-400 flex items-center gap-1">
                  Streak Harian: {gamifikasi.streakDays} 🔥
                </span>
              )}
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div>
                <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1.5 font-mono uppercase font-bold tracking-wider">
                  <span>Modul Teori Selesai Dibaca</span>
                  <span>1 / 4 Kategori</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-zinc-800">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: "25%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1.5 font-mono uppercase font-bold tracking-wider">
                  <span>Latihan Soal Tryout Terlampaui</span>
                  <span>{history.length} Sesi Terbimbing</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-zinc-800">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, history.length * 25)}%` }}></div>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 dark:text-zinc-500 pt-1 leading-relaxed font-sans font-medium">
                *Progres dihitung otomatis dari riwayat database simulasi platform. Naikkan level belajar untuk memperbesar bonus persentase kelulusan rekomendasi Anda.
              </p>
            </div>
          </div>

          {/* Target Campus Card */}
          <div className="rounded-2xl border border-gray-100/80 bg-white p-6 shadow-xs dark:border-zinc-850 dark:bg-[#0E1320]/60">
            <h3 className="font-extrabold font-display text-sm text-gray-950 dark:text-white mb-5 tracking-tight">Aspirasi Kampus & Jurusan Impian</h3>

            {kampusImpian ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between p-5 bg-teal-50/10 border border-teal-150/40 rounded-xl dark:bg-teal-950/10 dark:border-teal-900/40">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-teal-500/10 text-teal-700 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest dark:bg-teal-950/40 dark:text-teal-400 font-mono">
                      {kampusImpian.kategori}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium font-mono">Daya Tampung: {kampusImpian.dayaTampung}</span>
                  </div>
                  <h4 className="font-extrabold text-gray-950 dark:text-white font-display text-base tracking-tight leading-tight">{kampusImpian.namaPTN}</h4>
                  <p className="text-xs text-gray-400 dark:text-zinc-400 font-medium leading-snug">{kampusImpian.jurusan}</p>
                </div>

                <div className="border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-zinc-800/80 pt-3 sm:pt-0 sm:pl-6 text-center shrink-0 flex gap-5">
                  <div>
                    <span className="block text-[8px] text-gray-400 uppercase tracking-widest font-mono font-bold">Passing Grade</span>
                    <span className="text-lg font-extrabold text-teal-600 dark:text-teal-400 font-display">{kampusImpian.pasingGrade}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-gray-400 uppercase tracking-widest font-mono font-bold">Keketatan</span>
                    <span className="text-lg font-bold text-gray-800 dark:text-zinc-200 font-display">{kampusImpian.keketatan}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 border border-dashed border-gray-200 rounded-xl dark:border-zinc-800 bg-[#FAFCFF] dark:bg-[#111622]/20">
                <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-2.5 animate-pulse" />
                <h4 className="font-bold text-xs text-gray-950 dark:text-white font-display tracking-tight">Belum ada Universitas Impian yang Terpilih</h4>
                <p className="text-[11px] text-gray-400 dark:text-zinc-500 max-w-sm mx-auto mt-1.5 mb-4 leading-relaxed font-medium">
                  Pilih prodi PTN impian Anda agar robot pintar kami dapat membandingkan progres tryout harian Anda dengan passing grade resmi PTN.
                </p>
                <button
                  onClick={onCampusRecommendClick}
                  className="rounded-xl bg-teal-600 px-4 py-2 text-xxs font-bold text-white hover:bg-teal-555 transition-all shadow-md shadow-teal-500/5 cursor-pointer active:scale-95 duration-200 transform-gpu"
                >
                  Atur Target Kampus Impian
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar - Widgets & real-time notification alerts */}
        <div className="space-y-6 lg:col-span-1">

          {/* Gamifikasi Card mini widget */}
          {gamifikasi && (
            <div className="rounded-2xl border border-gray-100/80 bg-white p-6 shadow-xs dark:border-zinc-850 dark:bg-[#0E1320]/60">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-400/10 p-2.5 text-amber-500 border border-amber-500/15">
                  <Award className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-gray-950 dark:text-white text-xs tracking-tight">Level {gamifikasi.level}: Pejuang Berbakat</h4>
                  <span className="block text-[10px] text-gray-400 dark:text-zinc-500 font-semibold font-mono">{gamifikasi.points} Edu Poin Terkumpul</span>
                </div>
              </div>

              <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-zinc-800 animate-pulse">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${Math.min(100, Math.round((gamifikasi.points / gamifikasi.nextLevelPoints) * 100))}%` }}
                ></div>
              </div>
              <button
                onClick={() => onNavigate("gamified")}
                className="mt-4 text-[10px] font-bold text-teal-600 hover:text-teal-700 hover:underline block dark:text-teal-400"
              >
                Lihat Lencana & Klasemen Lain →
              </button>
            </div>
          )}

          {/* Real-time scheduling announcements notifications feed card */}
          {notifications.length > 0 && (
            <div className="rounded-2xl border border-gray-100/80 bg-white p-6 shadow-xs dark:border-zinc-850 dark:bg-[#0E1320]/60 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100/80 pb-2.5 dark:border-zinc-850/60">
                <h3 className="font-extrabold font-display text-xs text-gray-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Bell className="h-4 w-4 text-rose-500" /> Notifikasi Jadwal
                </h3>
                <span className="rounded-full bg-teal-500/10 text-teal-700 px-2 py-0.5 text-[8px] font-extrabold font-mono dark:bg-teal-950/40 dark:text-teal-400">
                  {notifications.length} BARU
                </span>
              </div>

              <div className="space-y-3.5">
                {notifications.map((n) => (
                  <div key={n.id} className="text-[11px] flex items-start gap-2 border-b border-slate-50 pb-3 last:border-0 last:pb-0 dark:border-zinc-850/40 justify-between">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-gray-800 dark:text-zinc-300 leading-relaxed">{n.message}</p>
                      <span className="block text-[9px] text-gray-400 font-mono font-medium">{n.time}</span>
                    </div>
                    <button
                      onClick={() => handleClearNotif(n.id)}
                      className="text-gray-300 hover:text-gray-600 dark:hover:text-zinc-400 cursor-pointer font-bold text-xs shrink-0 select-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mini Calendar agenda countdown list */}
          <div className="rounded-2xl border border-gray-100/80 bg-white p-6 shadow-xs dark:border-zinc-850 dark:bg-[#0E1320]/60 space-y-4">
            <h3 className="font-extrabold font-display text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-widest font-mono">
              Agenda Penting Terdekat
            </h3>

            <div className="space-y-3 text-[11px] font-semibold">
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl dark:bg-red-950/10 flex items-start gap-2 justify-between">
                <div>
                  <h4 className="text-red-900 dark:text-red-400 font-bold">UTBK SNBT Hari-H</h4>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5 font-medium">Sabtu, 20 Juni 2026</p>
                </div>
                <span className="text-[8px] uppercase font-bold text-red-650 shrink-0 bg-red-100/60 dark:bg-red-950 px-2 py-0.5 rounded font-mono tracking-wider">
                  PENTING
                </span>
              </div>

              <div className="p-3 bg-teal-500/5 border border-teal-500/10 rounded-xl dark:bg-teal-950/10 flex items-start gap-2 justify-between">
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-zinc-300">Simulasi UTBK Jilid I</h4>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5 font-medium">Kamis, 28 Mei 2026</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate("calendar")}
              className="text-[10px] font-bold text-teal-650 hover:text-teal-700 hover:underline block dark:text-teal-400"
            >
              Buka Kalender Pengingat →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
