import React, { useState, useEffect } from "react";
import { GraduationCap, CheckCircle, Search, Sparkles, Loader2, RefreshCw, MapPin, ExternalLink } from "lucide-react";
import { apiService } from "../utils/api";
import { MOCK_KAMPUS_IMPIAN } from "../data/mockData";

/**
 * CampusRecommendationView
 * Menampilkan daftar PTN & Jurusan dari Railway API (/api/v1/ptn/jurusan).
 * Fallback ke MOCK_KAMPUS_IMPIAN jika Railway tidak tersedia.
 */
export default function CampusRecommendationView({ savedTarget, onSetCampusTarget }) {
  const [jurusanList, setJurusanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [kelompok, setKelompok] = useState("ALL");
  const [jenjang, setJenjang] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [passingGradeFilter, setPassingGradeFilter] = useState("ALL");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (kelompok !== "ALL") params.kelompok = kelompok;
      if (jenjang !== "ALL") params.jenjang = jenjang;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await apiService.getAllJurusan(params);
      setJurusanList(data);
    } catch (e) {
      setError("Gagal memuat data jurusan. Menampilkan data lokal.");
      setJurusanList(MOCK_KAMPUS_IMPIAN.map(_legacyToJurusan));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter lokal (untuk search & passing grade yang tidak di-handle server)
  const filtered = jurusanList.filter((j) => {
    const nama = j.nama || j.jurusan || "";
    const ptnNama = j.ptn?.nama || j.namaPTN || "";
    const pg = j.passingGrade || j.pasingGrade || 0;

    const matchSearch =
      !searchQuery.trim() ||
      nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ptnNama.toLowerCase().includes(searchQuery.toLowerCase());

    const matchKelompok =
      kelompok === "ALL" || (j.kelompok || j.kategori) === kelompok;

    const matchJenjang =
      jenjang === "ALL" || j.jenjang === jenjang;

    let matchPG = true;
    if (passingGradeFilter === "HIGH") matchPG = pg >= 680;
    else if (passingGradeFilter === "MID") matchPG = pg >= 650 && pg < 680;
    else if (passingGradeFilter === "LOW") matchPG = pg < 650 && pg > 0;

    return matchSearch && matchKelompok && matchJenjang && matchPG;
  });

  return (
    <div className="space-y-6">
      {/* Target aktif */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-bold font-display text-gray-900 dark:text-white mb-1">Rekomendasi Jurusan PTN</h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400">
          Data PTN & jurusan langsung dari Railway backend. Pilih jurusan sebagai target belajar Anda.
        </p>

        {savedTarget && (
          <div className="mt-4 p-4 rounded-xl bg-teal-50/10 border border-teal-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 dark:bg-teal-950/10 dark:border-teal-900/40">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-teal-650 dark:text-teal-400 bg-teal-500/10 border border-teal-500/10 px-2 py-0.5 rounded">
                Target Kampus Aktif
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-1 font-display">
                {savedTarget.ptn?.nama || savedTarget.namaPTN}
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-450">
                {savedTarget.nama || savedTarget.jurusan}
                {savedTarget.kelompok || savedTarget.kategori ? ` · ${savedTarget.kelompok || savedTarget.kategori}` : ""}
              </p>
            </div>
            <div className="flex gap-4 shrink-0 border-t sm:border-t-0 sm:border-l border-gray-150 pl-0 sm:pl-5 pt-3 sm:pt-0">
              {(savedTarget.passingGrade || savedTarget.pasingGrade) && (
                <div className="text-center">
                  <span className="text-[8px] uppercase tracking-wider text-gray-400 font-mono block">Passing Grade</span>
                  <span className="text-lg font-extrabold text-teal-650 dark:text-teal-400 font-display">
                    {savedTarget.passingGrade || savedTarget.pasingGrade}
                  </span>
                </div>
              )}
              {savedTarget.dayaTampung && (
                <div className="text-center">
                  <span className="text-[8px] uppercase tracking-wider text-gray-400 font-mono block">Daya Tampung</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-zinc-300 font-display">{savedTarget.dayaTampung}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filter & Search */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4 dark:border-zinc-800">
          <h3 className="font-bold text-gray-950 dark:text-white text-sm">
            Direktori Jurusan PTN
            {!loading && <span className="ml-2 text-[10px] font-normal text-gray-400">({filtered.length} jurusan)</span>}
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari jurusan, PTN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-gray-150 py-1.5 pl-8 pr-3 text-[11px] focus:outline-none focus:border-teal-500 dark:bg-zinc-800 dark:border-zinc-800 dark:text-white w-44"
              />
            </div>

            <select value={kelompok} onChange={(e) => setKelompok(e.target.value)}
              className="rounded-lg border border-gray-150 py-1.5 px-2 text-[11px] focus:outline-none dark:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-300 font-bold">
              <option value="ALL">Semua Kelompok</option>
              <option value="SAINTEK">Saintek</option>
              <option value="SOSHUM">Soshum</option>
              <option value="CAMPURAN">Campuran</option>
            </select>

            <select value={jenjang} onChange={(e) => setJenjang(e.target.value)}
              className="rounded-lg border border-gray-150 py-1.5 px-2 text-[11px] focus:outline-none dark:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-300 font-bold">
              <option value="ALL">Semua Jenjang</option>
              <option value="S1">S1</option>
              <option value="D3">D3</option>
              <option value="D4">D4</option>
            </select>

            <select value={passingGradeFilter} onChange={(e) => setPassingGradeFilter(e.target.value)}
              className="rounded-lg border border-gray-150 py-1.5 px-2 text-[11px] focus:outline-none dark:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-300 font-bold">
              <option value="ALL">Semua Skor</option>
              <option value="HIGH">Tinggi (≥680)</option>
              <option value="MID">Sedang (650–679)</option>
              <option value="LOW">Menengah (&lt;650)</option>
            </select>

            <button onClick={loadData} className="rounded-lg border border-gray-150 p-1.5 text-gray-500 hover:text-teal-600 dark:border-zinc-800 dark:text-zinc-400 cursor-pointer">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-gray-400 py-8">
            <Loader2 className="h-4 w-4 animate-spin" /> Memuat data jurusan dari Railway...
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {filtered.map((j) => {
              const id = j.id;
              const namaJurusan = j.nama || j.jurusan || "-";
              const namaPTN = j.ptn?.nama || j.namaPTN || "-";
              const singkatan = j.ptn?.singkatan || "";
              const pg = j.passingGrade || j.pasingGrade;
              const dt = j.dayaTampung;
              const kel = j.kelompok || j.kategori;
              const isTarget = savedTarget?.id === id;

              return (
                <div
                  key={id}
                  className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                    isTarget
                      ? "border-teal-500 bg-teal-50/15 dark:border-teal-500 dark:bg-teal-950/20"
                      : "border-gray-100 hover:border-gray-250 bg-gray-50/10 hover:bg-gray-50/30 dark:border-zinc-800/80 dark:hover:bg-zinc-800/30"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      {kel && (
                        <span className="rounded bg-teal-500/10 text-teal-700 px-1.5 py-0.5 text-[8px] font-extrabold uppercase dark:bg-teal-950 dark:text-teal-400">
                          {kel}
                        </span>
                      )}
                      {j.jenjang && (
                        <span className="text-[8px] font-bold text-gray-400 font-mono">{j.jenjang}</span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-sm text-gray-950 dark:text-white font-display leading-tight">{namaJurusan}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-snug">
                      {namaPTN}{singkatan ? ` (${singkatan})` : ""}
                    </p>
                    {j.fakultas && (
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500">{j.fakultas}</p>
                    )}

                    <div className="mt-3 flex gap-4 border-t border-dashed border-gray-150 pt-2.5 font-mono">
                      {pg && (
                        <div>
                          <span className="text-[8px] text-gray-400 font-medium block">PASSING GRADE</span>
                          <span className="text-sm font-bold text-teal-650 dark:text-teal-400">{pg}</span>
                        </div>
                      )}
                      {dt && (
                        <div>
                          <span className="text-[8px] text-gray-400 font-medium block">DAYA TAMPUNG</span>
                          <span className="text-sm font-bold text-gray-700 dark:text-zinc-350">{dt}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    {isTarget ? (
                      <span className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 py-1.5 text-[11px] font-bold text-white">
                        <CheckCircle className="h-3.5 w-3.5" /> Target Terpasang
                      </span>
                    ) : (
                      <button
                        onClick={() => onSetCampusTarget(j)}
                        className="w-full text-center rounded-lg bg-gray-100 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-teal-600 hover:text-white cursor-pointer transition-colors dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-teal-600"
                      >
                        Jadikan Target
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="col-span-full text-center p-8 text-xs text-gray-400">
                Tidak ada jurusan yang cocok dengan filter saat ini.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">Memahami Passing Grade & Daya Tampung</h3>
        </div>
        <p className="text-xs text-gray-550 dark:text-zinc-400 leading-relaxed">
          <strong>Passing Grade</strong> adalah estimasi nilai ambang batas minimal kelulusan berdasarkan data historis SNBT. Semakin tinggi peminat, semakin tinggi ambang batasnya.<br /><br />
          <strong>Daya Tampung</strong> adalah jumlah kursi yang tersedia. Rasio pendaftar vs daya tampung menentukan tingkat keketatan — semakin kecil rasionya, semakin kompetitif.
        </p>
      </div>
    </div>
  );
}

// Helper: konversi format mock lama ke format jurusan Railway
function _legacyToJurusan(k) {
  return {
    id: k.id,
    nama: k.jurusan,
    kelompok: k.kategori,
    passingGrade: k.pasingGrade,
    dayaTampung: k.dayaTampung,
    ptn: { nama: k.namaPTN, singkatan: k.namaPTN.match(/\(([^)]+)\)/)?.[1] || "" },
    _legacy: k,
  };
}
