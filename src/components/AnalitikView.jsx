import React from "react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { 
  TrendingUp, 
  CheckCircle, 
  BookOpen, 
  AlertTriangle, 
  Sparkles 
} from "lucide-react";

export default function AnalitikView({ history, onNavigate }) {
  // Map tryout history for the charts
  const lineData = history.map((session, index) => ({
    name: `TO #${index + 1}`,
    skor: session.skorTotal,
    tps: session.skorTPS,
    literasi: session.skorLiterasi || 500
  })).reverse();

  // Aggregate subtest performance to show average across sessions
  const subtestScoresList = {};
  
  history.forEach((session) => {
    Object.entries(session.subtestScores).forEach(([name, val]) => {
      if (!subtestScoresList[name]) {
        subtestScoresList[name] = { sum: 0, count: 0 };
      }
      subtestScoresList[name].sum += val;
      subtestScoresList[name].count += 1;
    });
  });

  const barData = Object.entries(subtestScoresList).map(([name, pack]) => ({
    name: name.split(" ").slice(0, 2).join(" "), // trim name for graph readability
    RataRata: Math.round(pack.sum / pack.count)
  }));

  // Identify lowest performing areas for adaptive warning
  const minimumSubtest = barData.length > 0
    ? [...barData].sort((a, b) => a.RataRata - b.RataRata)[0]
    : null;

  return (
    <div className="space-y-6">
      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-xxs font-bold text-gray-500 uppercase">Target Skor Minimal Lulus</span>
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1 block">680</span>
          <p className="text-xxs text-gray-400 dark:text-zinc-500 mt-2">Batas aman pendaftaran PTN Kluster A (UI, UGM, ITB).</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-xxs font-bold text-gray-500 uppercase">Rata-rata Skor Saya Saat Ini</span>
          <span className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 mt-1 block">
            {lineData.length > 0 ? Math.round(lineData.reduce((acc, d) => acc + d.skor, 0) / lineData.length) : "Belum ujian"}
          </span>
          <p className="text-xxs text-gray-400 dark:text-zinc-500 mt-2">Dihitung dari {history.length} sesi simulasi tryout.</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-xxs font-bold text-gray-500 uppercase">Aspirasi Skor Maksimum</span>
          <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 block">
            {history.length > 0 ? Math.max(...history.map(h => h.skorTotal)) : "Belum ujian"}
          </span>
          <p className="text-xxs text-gray-400 dark:text-zinc-500 mt-2">Kemajuan terbaik Anda di platform EduPTN.</p>
        </div>
      </div>

      {/* Recharts progress displays */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Progression Line Graph */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-4">Grafik Kemajuan Skor Tryout</h3>

          <div className="h-64 mt-2">
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} domain={[300, 900]} />
                  <Tooltip wrapperStyle={{ fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Line type="monotone" dataKey="skor" stroke="#14b8a6" strokeWidth={3} name="Skor Total" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="tps" stroke="#6366f1" strokeWidth={2} name="TPS" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-xs text-gray-400">
                Silakan ikuti tryout pertama Anda untuk memunculkan visualisasi kemajuan disini.
              </div>
            )}
          </div>
        </div>

        {/* Subtests Performance Bar chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-4">Rata-rata Nilai per Elemen Subtes</h3>

          <div className="h-64 mt-2">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} domain={[200, 900]} />
                  <Tooltip wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="RataRata" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Skor IRT" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-xs text-gray-400">
                Data subtes akan terisi otomatis setelah Anda menyelesaikan salah satu sesi ujian.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Smart adaptive recommendations & remedial guidance */}
      <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Rencana Tindak Lanjut Akademik Pintar</h3>
        </div>

        <div className="space-y-4">
          {minimumSubtest ? (
            <div className="rounded-xl border border-rose-100 bg-rose-50/20 p-4 dark:border-rose-950/30">
              <div className="flex gap-2.5 items-start">
                <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-1 text-gray-700 dark:text-zinc-300">
                  <span className="font-bold block text-rose-800 dark:text-rose-400">Arus Perbaikan Prioritas Utama: Subtes {minimumSubtest.name} ({minimumSubtest.RataRata} pts)</span>
                  <p>
                    Nilai di subtes ini berada di tingkat rentan kelulusan. Disarankan untuk membaca kembali bab latihan terkait seperti rumus aljabar di Penalaran Matematika, atau merangkum struktur proposisi deduktif di materi bimbingan belajar.
                  </p>
                  <button 
                    onClick={() => onNavigate("materi")}
                    className="mt-2 text-rose-700 hover:underline font-bold text-xxs block dark:text-rose-400"
                  >
                    Buka Panduan Subtes Terkait →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-teal-50/40 text-xs text-teal-800 rounded-xl dark:bg-teal-950/25 dark:text-teal-400 border border-teal-100/55">
              Sistem analitik progres belum mendeteksi kelemahan karena Anda belum melakukan simulasi. Yuk, lakukan tryout sekarang untuk mengetahui kelemahan Anda secara objektif!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 p-4 dark:border-zinc-800">
              <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2 block">💡 Tips Kuantitatif & Penalaran Matematika</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                UTBK tidak menuntut Anda menjadi kalkulator berjalan. Fokuskan pada menyaring premis logika dari studi kasus cerita panjang, lalu terjemahkan ke bentuk model matematika sederhana. Jauhkan keterbiasaan menghafal pola persamaan kompleks.
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 p-4 dark:border-zinc-800">
              <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2 block">📑 Strategi Literasi & Pemahaman Membaca</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                Teks ujian rata-rata terdiri dari 250-400 kata. Lompati membaca teks langsung dan meluncurlah pada pertanyaan kalimat kunci terlebih dahulu. Strategi scanning terbukti ampuh mereduksi denda waktu hingga 42% di UTBK SNBT.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
