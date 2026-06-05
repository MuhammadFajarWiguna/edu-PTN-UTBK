import React, { useState, useEffect } from "react";
import { BookOpen, CheckCircle, Search, HelpCircle, GraduationCap, Flame, Sparkles } from "lucide-react";
import { apiService } from "../utils/api";

export default function MateriView({ onAddPoint, onNavigate }) {
  const [materiList, setMateriList] = useState([]);
  const [selectedMateri, setSelectedMateri] = useState(null);
  const [readModules, setReadModules] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    const list = apiService.getMaterials();
    setMateriList(list);
    if (list && list.length > 0) {
      setSelectedMateri(list[0]);
    }
  }, []);

  const handleMarkAsRead = (materi) => {
    if (readModules.includes(materi.id)) return;
    setReadModules([...readModules, materi.id]);
    onAddPoint(materi.poinReward, `Membaca Materi: ${materi.judul}`);
  };

  const filteredMateri = materiList.filter((m) => {
    const matchesSearch = m.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.subtest.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || m.kategori === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Sidebar - Materials List */}
      <div className="space-y-4 lg:col-span-1">
        <div className="rounded-2xl border border-gray-100/80 bg-white p-5 shadow-xs dark:border-zinc-850 dark:bg-[#0E1320]/60">
          <h2 className="text-sm font-extrabold font-display text-gray-950 dark:text-white mb-4 tracking-tight">Materi Belajar UTBK</h2>
          
          {/* Search */}
          <div className="relative mb-3.2">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400 dark:text-zinc-500" />
            <input 
              type="text" 
              placeholder="Cari silogisme, aljabar, dll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200/80 bg-white py-2.5 pl-10 pr-4 text-xs transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-white dark:placeholder-zinc-500"
            />
          </div>

          {/* Categories Tab */}
          <div className="flex gap-1.5 border-b border-slate-100 pb-3.5 dark:border-zinc-800/80">
            {["ALL", "TPS", "LITERASI"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-wider transition-all cursor-pointer font-mono ${
                  categoryFilter === cat ? 
                  "bg-teal-600 text-white shadow-xs shadow-teal-500/10" : 
                  "bg-slate-50 text-slate-450 border border-slate-100 hover:bg-slate-100 dark:bg-zinc-800/40 dark:border-zinc-800/60 dark:text-zinc-400 dark:hover:bg-zinc-800/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Module list */}
          <div className="mt-4 space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {filteredMateri.map((m) => {
              const isSelected = selectedMateri?.id === m.id;
              const isRead = readModules.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMateri(m)}
                  className={`group cursor-pointer rounded-xl border p-4 transition-all duration-200 transform-gpu active:scale-[0.99] ${
                    isSelected ? 
                    "border-teal-500 bg-teal-50/20 dark:border-teal-500 dark:bg-teal-950/20 shadow-xxs" : 
                    "border-gray-100 bg-gray-50/20 hover:bg-white hover:border-teal-500/30 hover:shadow-xxs dark:border-zinc-805 dark:bg-zinc-900/30 dark:hover:bg-[#111622] dark:hover:border-teal-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[9px] uppercase font-bold text-teal-650 dark:text-teal-400 tracking-wider font-mono">
                      {m.subtest}
                    </span>
                    {isRead && (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                  <h4 className="font-extrabold text-xs text-gray-900 dark:text-white mt-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 line-clamp-1 font-display tracking-tight">
                    {m.judul}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-zinc-500 mt-2.5 font-mono font-semibold">
                    <span>⏱ {m.estimasiMembaca} mnt baca</span>
                    <span className="text-teal-600/90 dark:text-teal-400/90 font-bold">💎 +{m.poinReward} Pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Study Companion Widget */}
        <div className="rounded-2xl border border-teal-100 bg-teal-50/10 p-5 dark:border-teal-900/30">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 mb-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Bimbingan Pintar</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed font-medium">
            Butuh penjelasan soal rumit atau ingin ringkasan subtest lainnya? Tanya Konsultan AI sekarang juga untuk bimbingan instan.
          </p>
          <button 
            onClick={() => onNavigate("ai")}
            className="mt-4 text-xs font-extrabold text-teal-650 hover:text-teal-700 hover:underline dark:text-teal-400 block cursor-pointer transition-colors"
          >
            Mulai Konsultasi AI →
          </button>
        </div>
      </div>

      {/* Editor Content Box */}
      <div className="lg:col-span-2">
        {selectedMateri ? (
          <div className="rounded-2xl border border-gray-100/80 bg-white p-7 shadow-xs dark:border-zinc-850 dark:bg-[#0E1320]/60">
            {/* Subject details header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-5 dark:border-zinc-850">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-3 py-1 text-[10px] font-bold text-teal-700 uppercase tracking-widest dark:bg-teal-950/40 dark:text-teal-400 border border-teal-500/10 font-mono">
                  {selectedMateri.kategori} - {selectedMateri.subtest}
                </span>
                <h1 className="text-xl font-extrabold font-display text-gray-950 dark:text-white md:text-2xl mt-2 select-text tracking-tight">
                  {selectedMateri.judul}
                </h1>
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-1.5 text-[10px] font-mono font-bold text-slate-400 dark:bg-zinc-800/30 dark:border-zinc-800/50">
                ⏱ ESTIMASI: {selectedMateri.estimasiMembaca} MENIT BACA
              </div>
            </div>

            {/* Content text in clean markdown presentation */}
            <div className="py-7 text-sm text-gray-700 dark:text-slate-350 leading-relaxed whitespace-pre-wrap font-medium">
              {selectedMateri.konten}
            </div>

            {/* Read completion footer actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-150 pt-6 dark:border-zinc-850 mt-6">
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-bold font-mono">
                <Flame className="h-4 w-4 text-amber-500 animate-pulse" />
                <span>+{selectedMateri.poinReward} REDEEM EDU POINTS</span>
              </div>

              {readModules.includes(selectedMateri.id) ? (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-5 py-2.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-500/15">
                  <CheckCircle className="h-4 w-4 text-emerald-500" /> Bab Berhasil Diselesaikan!
                </span>
              ) : (
                <button
                  onClick={() => handleMarkAsRead(selectedMateri)}
                  className="rounded-xl bg-teal-600 px-5.5 py-3 text-xs font-bold text-white shadow-md shadow-teal-500/10 hover:bg-teal-555 active:scale-[0.98] transition-all duration-200 transform-gpu cursor-pointer"
                >
                  Tandai Selesai & Klaim Poin
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 p-12 text-center bg-[#FAFCFF] dark:bg-[#111622]/20 dark:border-zinc-850 h-full">
            <BookOpen className="h-10 w-10 text-slate-300 dark:text-zinc-650 mb-3 animate-bounce" />
            <h3 className="font-bold text-xs text-gray-950 dark:text-white font-display">Pilih Modul Materi Belajar</h3>
            <p className="text-xxs text-gray-400 dark:text-zinc-500 max-w-xs mt-1.5 leading-relaxed font-medium">
              Silakan pilih modul di panel kiri untuk memulai proses bimbingan belajar komprehensif.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
