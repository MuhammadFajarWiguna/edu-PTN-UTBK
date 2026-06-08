import React, { useState, useEffect } from "react";
import {
  Play, Clock, CheckCircle, XCircle, Award, TrendingUp,
  BookOpen, Target, Zap, RotateCcw, ArrowRight, ChevronRight,
  ChevronLeft, AlertCircle, Trophy, Flame, History
} from "lucide-react";
import { apiService } from "../utils/api";

const normalizeOpsi = (opsi) => {
  if (Array.isArray(opsi)) return opsi;
  if (opsi && typeof opsi === "object" && Object.keys(opsi).length > 0) {
    return Object.values(opsi);
  }
  return [];
};

export default function LatihanView({ user, onAddPoint }) {
  const [activeTab, setActiveTab] = useState("pilih");
  const [selectedMapel, setSelectedMapel] = useState(null);
  const [session, setSession] = useState(null);
  const [soalList, setSoalList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jawaban, setJawaban] = useState({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [hasil, setHasil] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasilDetail, setHasilDetail] = useState([]);

  const mapelOptions = [
    {
      id: "TPS",
      name: "TPS - Tes Potensi Skolastik",
      icon: <Zap className="h-8 w-8" />,
      color: "teal",
      desc: "Penalaran Umum, Kuantitatif, Pemahaman Bacaan",
      soalCount: 20
    },
    {
      id: "TKA_SAINTEK",
      name: "TKA Saintek",
      icon: <Target className="h-8 w-8" />,
      color: "blue",
      desc: "Matematika, Fisika, Kimia, Biologi",
      soalCount: 15
    },
    {
      id: "TKA_SOSHUM",
      name: "TKA Soshum",
      icon: <BookOpen className="h-8 w-8" />,
      color: "purple",
      desc: "Geografi, Sejarah, Sosiologi, Ekonomi",
      soalCount: 15
    },
  ];

  // Timer
  useEffect(() => {
    if (activeTab === "latihan" && session) {
      const interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTab, session]);

  // Load riwayat when tab changes
  useEffect(() => {
    if (activeTab === "riwayat") {
      loadRiwayat();
    }
  }, [activeTab]);

  const loadRiwayat = async () => {
    setLoading(true);
    try {
      const data = await apiService.getLatihanRiwayat();
      setRiwayat(data || []);
    } catch (err) {
      console.error("Error loading riwayat:", err);
      setRiwayat([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMulaiLatihan = async (mapel) => {
  setLoading(true);
  setError(null);
  try {
    // Dari Fix #3: bersihkan cache supaya dapat soal terbaru
    apiService.invalidateSoalCache();

    const data = await apiService.startSession(mapel.id);
    setSession(data.session);
    setSoalList(data.soal || []);
    setSelectedMapel(mapel);
    setCurrentIndex(0);
    setJawaban({});
    setTimeElapsed(0);

    // Dari Fix #6: tampilkan peringatan kalau session lokal (offline)
    if (data._isLocalSession) {
      setError(
        "⚠️ Mode offline: soal diambil dari cache lokal. " +
        "Hasil latihan tidak akan tersimpan ke server."
      );
    }

    setActiveTab("latihan");
  } catch (err) {
    setError(err.message || "Gagal memulai latihan. Coba lagi.");
    console.error("Error starting session:", err);
  } finally {
    setLoading(false);
  }
};

  
const handleSelectJawaban = (soalId, opsiText, opsiIndex) => {
  const letter = String.fromCharCode(65 + opsiIndex); // "A", "B", "C", ...
  setJawaban(prev => ({ ...prev, [soalId]: letter }));
};

  const handleNext = () => {
    if (currentIndex < soalList.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

const handleSubmit = async () => {
  if (Object.keys(jawaban).length === 0) {
    setError("Harap jawab minimal 1 soal sebelum submit.");
    return;
  }

  setLoading(true);
  setError(null);
  try {
    const jawabanArray = Object.entries(jawaban)
   .filter(([_, val]) => val !== "" && val != null) 
   .map(([soalId, jawabanValue]) => ({
    soalId,
    jawaban: jawabanValue,
  }));

    const result = await apiService.submitSession(session.id, jawabanArray);
    console.log("SUBMIT RESULT:", JSON.stringify(result, null, 2));

    // Ambil detail per soal dari endpoint detail sesi
    try {
  const { latihanApi } = await import("../utils/railwayApi");
  const detailData = await latihanApi.detail(session.id);
  console.log("RAW DETAIL DATA:", JSON.stringify(detailData, null, 2));
  
  // Backend return { data: { jawabans: [...] } } atau { jawabans: [...] }
  const detail = detailData?.data || detailData;
  
  // Coba semua kemungkinan field name
  const jawabanDetail = 
    detail?.jawabans ||        // array of jawaban
    detail?.jawabanSiswa ||
    detail?.hasil ||
    detail?.detail ||
    (Array.isArray(detail) ? detail : []);
    
  console.log("JAWABAN DETAIL:", jawabanDetail);
  setHasilDetail(Array.isArray(jawabanDetail) ? jawabanDetail : []);
} catch (detailErr) {
  console.warn("Gagal fetch detail sesi:", detailErr.message);
}

    // Normalisasi field name (backend pakai jumlahBenar, bukan benar)
    const normalizedResult = {
      ...result,
      benar: result.benar || result.jumlahBenar || 0,
      salah: result.salah || result.jumlahSalah || 0,
      skor: result.skor || result.score || 0,
    };

    setHasil(normalizedResult);
    setActiveTab("hasil");

    if (onAddPoint && normalizedResult.skor) {
      const points = Math.floor(normalizedResult.skor / 10);
      onAddPoint(points, `Menyelesaikan Latihan ${selectedMapel.name}`);
    }
  } catch (err) {
    setError(err.message || "Gagal submit jawaban. Coba lagi.");
    console.error("Error submitting session:", err);
  } finally {
    setLoading(false);
  }
};

  const handleMulaiLagi = () => {
    setActiveTab("pilih");
    setSession(null);
    setSoalList([]);
    setCurrentIndex(0);
    setJawaban({});
    setHasil(null);
    setTimeElapsed(0);
    setError(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSoal = soalList[currentIndex];
  const getOpsiList = (soal) => {
  if (!soal) return [];

  if (soal.tipe === "TRUE_FALSE") {
    return ["Benar", "Salah"];
  }

  if (soal.tipe === "SHORT_ANSWER") {
    return null; 
  }

  const normalized = normalizeOpsi(soal.opsi);

  if (normalized.length === 0) {
    return ["A", "B", "C", "D", "E"]; 
  }

  return normalized;
};
  const progress = soalList.length > 0 ? ((currentIndex + 1) / soalList.length) * 100 : 0;
  const answeredCount = Object.keys(jawaban).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-50 to-cyan-50 p-6 dark:from-teal-950/20 dark:to-cyan-950/10 dark:border-teal-500/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              <h1 className="text-2xl font-extrabold text-gray-950 dark:text-white font-display">
                Latihan Soal
              </h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-zinc-400">
              Latih kemampuan dengan soal-soal pilihan per mapel. Dapatkan pembahasan lengkap setelah selesai.
            </p>
          </div>

          {activeTab !== "pilih" && (
            <button
              onClick={handleMulaiLagi}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Pilih Mapel Lain
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-50 p-4 dark:bg-red-950/20 dark:border-red-500/10 flex items-center gap-3 animate-fade-in">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-zinc-800 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("pilih")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === "pilih" ?
            "border-teal-600 text-teal-700 dark:border-teal-500 dark:text-teal-400" :
            "border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300"
            }`}
        >
          <Target className="h-4 w-4" />
          Pilih Mapel
        </button>

        {session && (
          <>
            <button
              onClick={() => setActiveTab("latihan")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === "latihan" ?
                "border-teal-600 text-teal-700 dark:border-teal-500 dark:text-teal-400" :
                "border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300"
                }`}
            >
              <Play className="h-4 w-4" />
              Latihan
            </button>

            {hasil && (
              <button
                onClick={() => setActiveTab("hasil")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === "hasil" ?
                  "border-teal-600 text-teal-700 dark:border-teal-500 dark:text-teal-400" :
                  "border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300"
                  }`}
              >
                <Trophy className="h-4 w-4" />
                Hasil
              </button>
            )}
          </>
        )}

        <button
          onClick={() => setActiveTab("riwayat")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === "riwayat" ?
            "border-teal-600 text-teal-700 dark:border-teal-500 dark:text-teal-400" :
            "border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300"
            }`}
        >
          <History className="h-4 w-4" />
          Riwayat
        </button>
      </div>

      {/* TAB: PILIH MAPEL */}
      {activeTab === "pilih" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
          {mapelOptions.map((mapel) => (
            <div
              key={mapel.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 hover:border-teal-500 hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-teal-500 group cursor-pointer"
              onClick={() => !loading && handleMulaiLatihan(mapel)}
            >
              <div className={`rounded-xl bg-${mapel.color}-50 dark:bg-${mapel.color}-950/20 p-3 inline-flex mb-4 text-${mapel.color}-600 dark:text-${mapel.color}-400 group-hover:scale-110 transition-transform`}>
                {mapel.icon}
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-display">
                {mapel.name}
              </h3>

              <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">
                {mapel.desc}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-gray-500 dark:text-zinc-500">
                  {mapel.soalCount} Soal
                </span>

                <button
                  disabled={loading}
                  className={`inline-flex items-center gap-1 text-sm font-bold ${mapel.color === 'teal' ? 'text-teal-600 dark:text-teal-400' : mapel.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'} group-hover:gap-2 transition-all`}
                >
                  {loading ? "Loading..." : "Mulai"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: LATIHAN */}
      {activeTab === "latihan" && currentSoal && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in-up">
          {/* Main Question Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Progress & Timer */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    Soal {currentIndex + 1} dari {soalList.length}
                  </span>
                  <span className="text-xs font-mono text-gray-500 dark:text-zinc-500">
                    {answeredCount}/{soalList.length} dijawab
                  </span>
                </div>

                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-mono font-bold">{formatTime(timeElapsed)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-2 dark:bg-zinc-800">
                <div
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start gap-3 mb-6">
                <span className="rounded-lg bg-teal-50 dark:bg-teal-950/30 px-3 py-1 text-sm font-bold text-teal-700 dark:text-teal-400 shrink-0">
                  {currentSoal.mapel || selectedMapel.id}
                </span>
                {currentSoal.subtest && (
                  <span className="rounded-lg bg-gray-100 dark:bg-zinc-800 px-3 py-1 text-xs font-semibold text-gray-600 dark:text-zinc-400">
                    {currentSoal.subtest}
                  </span>
                )}
              </div>

              <p className="text-base font-semibold text-gray-900 dark:text-white leading-relaxed mb-6">
                {currentSoal.pertanyaan}
              </p>

              {/* Answer Options */}
              {/* Answer Options — handle semua tipe soal */}
<div className="space-y-3">

  {/* Label tipe soal kalau bukan SINGLE_CHOICE */}
  {currentSoal.tipe && currentSoal.tipe !== "SINGLE_CHOICE" && (
    <div className="flex items-center gap-2 mb-1">
      <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
        currentSoal.tipe === "TRUE_FALSE"
          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400"
          : "bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400"
      }`}>
        {currentSoal.tipe === "TRUE_FALSE" ? "Benar / Salah" : "Jawaban Singkat"}
      </span>
    </div>
  )}

  {/* SHORT_ANSWER: render input teks */}
  {currentSoal.tipe === "SHORT_ANSWER" ? (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
        Ketik jawaban kamu:
      </p>
      <input
        type="text"
        value={
          // jawaban disimpan sebagai string langsung untuk SHORT_ANSWER
          jawaban[currentSoal.id] || ""
        }
        onChange={(e) => {
          // Untuk SHORT_ANSWER, simpan teks langsung bukan huruf
          setJawaban(prev => ({ ...prev, [currentSoal.id]: e.target.value }));
        }}
        placeholder="Tulis jawaban di sini..."
        className="w-full rounded-xl border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 dark:text-white transition-all"
      />
    </div>

  ) : (
    /* SINGLE_CHOICE & TRUE_FALSE: render tombol opsi */
    (getOpsiList(currentSoal) || []).map((opsi, idx) => {
      const letter = String.fromCharCode(65 + idx);
      const isSelected = jawaban[currentSoal.id] === letter;

      return (
        <button
          key={idx}
          onClick={() => handleSelectJawaban(currentSoal.id, opsi, idx)}
          className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
            isSelected
              ? "border-teal-500 bg-teal-50 dark:bg-teal-950/20 dark:border-teal-500"
              : "border-gray-200 hover:border-teal-300 dark:border-zinc-800 dark:hover:border-teal-700"
          }`}
        >
          {/* Label huruf / Benar-Salah */}
          <span className={`rounded-lg px-3 py-1 text-sm font-bold shrink-0 ${
            isSelected
              ? "bg-teal-600 text-white"
              : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}>
            {/* TRUE_FALSE tampilkan teks langsung, SINGLE_CHOICE tampilkan huruf */}
            {currentSoal.tipe === "TRUE_FALSE" ? opsi : letter}
          </span>

          {/* Teks opsi — untuk TRUE_FALSE tidak perlu tampilkan lagi */}
          {currentSoal.tipe !== "TRUE_FALSE" && (
            <span className={`text-sm font-medium ${
              isSelected
                ? "text-teal-900 dark:text-teal-100"
                : "text-gray-700 dark:text-zinc-300"
            }`}>
              {opsi}
            </span>
          )}
        </button>
      );
    })
  )}

</div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === soalList.length - 1}
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Selanjutnya
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Sidebar: Question Navigator */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sticky top-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                Navigasi Soal
              </h3>

              <div className="grid grid-cols-5 gap-2 mb-4">
                {soalList.map((soal, idx) => {
                  const isAnswered = jawaban[soal.id];
                  const isCurrent = idx === currentIndex;

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`aspect-square rounded-lg text-xs font-bold transition-all cursor-pointer ${isCurrent ?
                        "bg-teal-600 text-white ring-2 ring-teal-600 ring-offset-2 dark:ring-offset-zinc-900" :
                        isAnswered ?
                          "bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400" :
                          "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                        }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 text-xs mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-teal-600" />
                  <span className="text-gray-600 dark:text-zinc-400">Soal saat ini</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-teal-100 dark:bg-teal-950/30" />
                  <span className="text-gray-600 dark:text-zinc-400">Sudah dijawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-100 dark:bg-zinc-800" />
                  <span className="text-gray-600 dark:text-zinc-400">Belum dijawab</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || answeredCount === 0}
                className="w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-teal-600/20"
              >
                {loading ? "Submitting..." : `Submit (${answeredCount}/${soalList.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: HASIL */}
      {activeTab === "hasil" && hasil && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Score Summary */}
          <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-50 to-emerald-50 p-8 dark:from-teal-950/20 dark:to-emerald-950/10 dark:border-teal-500/10 text-center">
            <Trophy className="h-16 w-16 text-teal-600 dark:text-teal-400 mx-auto mb-4" />
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 font-display">
              Skor Anda: {hasil.skor || 0}
            </h2>
            <p className="text-lg text-gray-600 dark:text-zinc-400 mb-4">
              {hasil.benar || 0} benar dari {soalList.length} soal
            </p>

            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="text-center">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-2xl font-bold">{hasil.benar || 0}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-zinc-500">Benar</span>
              </div>

              <div className="text-center">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
                  <XCircle className="h-5 w-5" />
                  <span className="text-2xl font-bold">{hasil.salah || 0}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-zinc-500">Salah</span>
              </div>

              <div className="text-center">
                <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-400 mb-1">
                  <Clock className="h-5 w-5" />
                  <span className="text-2xl font-bold">{formatTime(timeElapsed)}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-zinc-500">Waktu</span>
              </div>
            </div>
          </div>

          {/* Pembahasan */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 font-display">
              Pembahasan Soal
            </h3>

            <div className="space-y-6">
             {soalList.map((soal, idx) => {
                const userAnswer = jawaban[soal.id]; 
                const opsiArray = normalizeOpsi(soal.opsi);
                const detailItem = hasilDetail.find(d => d.soalId === soal.id || d.soal?.id === soal.id
          );

  // Jawaban benar: dari detail backend, atau dari field soal.jawaban/soal.kunciJawaban
   const rawJawabanBenar = detailItem?.jawabanBenar
    ?? detailItem?.kunciJawaban
    ?? soal.jawaban
    ?? soal.kunciJawaban;

  let jawabanBenar = "-";
  if (rawJawabanBenar != null) {
    if (typeof rawJawabanBenar === "string") {
      // Sudah huruf: "A", "B", atau teks opsi langsung
      jawabanBenar = rawJawabanBenar;
    } else if (typeof rawJawabanBenar === "number") {
      // Index: 0 → "A", 1 → "B"
      jawabanBenar = String.fromCharCode(65 + rawJawabanBenar);
    } else if (typeof rawJawabanBenar === "object") {
      // Object: ambil key pertama saja → "A"
      jawabanBenar = Object.keys(rawJawabanBenar)[0] || "-";
    }
  }

    const isCorrect = detailItem != null
    ? (detailItem.benar === true || detailItem.isCorrect === true)
    : (userAnswer != null && userAnswer === jawabanBenar);

  const getOpsiText = (letter) => {
  if (!letter || letter === "-") return letter || "";

  if (soal.tipe === "TRUE_FALSE") {
    return letter;
  }

  if (soal.tipe === "SHORT_ANSWER") {
    return letter;
  }

  if (typeof letter !== "string") return "";
  const i = letter.toUpperCase().charCodeAt(0) - 65;
  return (i >= 0 && i < opsiArray.length) ? opsiArray[i] : letter;
};

  const userAnswerText = userAnswer ? getOpsiText(userAnswer) : "Tidak dijawab";
  const jawabanBenarText = jawabanBenar !== "-" ? getOpsiText(jawabanBenar) : "-";

  return (
    <div key={idx} className="border-b border-gray-100 dark:border-zinc-800 pb-6 last:border-0">
      <div className="flex items-start gap-3 mb-3">
        <span className="rounded-lg bg-gray-100 dark:bg-zinc-800 px-3 py-1 text-sm font-bold text-gray-600 dark:text-zinc-400 shrink-0">
          #{idx + 1}
        </span>
        {isCorrect ? (
          <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Benar
          </span>
        ) : (
          <span className="rounded-lg bg-red-50 dark:bg-red-950/20 px-3 py-1 text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Salah
          </span>
        )}
      </div>

      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        {soal.pertanyaan}
      </p>

      <div className="space-y-2 mb-3">
        <div className="text-xs">
          <span className="text-gray-500 dark:text-zinc-500">Jawaban Anda: </span>
          <span className={`font-bold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {userAnswer ? `${userAnswer}. ${userAnswerText}` : "Tidak dijawab"}
          </span>
        </div>
        {!isCorrect && jawabanBenar !== "-" && (
          <div className="text-xs">
            <span className="text-gray-500 dark:text-zinc-500">Jawaban Benar: </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {jawabanBenar}. {jawabanBenarText}
            </span>
          </div>
        )}
      </div>

      {soal.pembahasan && (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 border border-blue-100 dark:border-blue-900/30">
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">💡 Pembahasan:</p>
          <p className="text-xs text-blue-800 dark:text-blue-400 leading-relaxed">{soal.pembahasan}</p>
            </div>
            )}
          </div>
         );
        })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleMulaiLagi}
              className="flex-1 rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white hover:bg-teal-500 transition-all cursor-pointer shadow-lg shadow-teal-600/20"
            >
              Latihan Lagi
            </button>
            <button
              onClick={() => setActiveTab("riwayat")}
              className="flex-1 rounded-xl bg-white border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Lihat Riwayat
            </button>
          </div>
        </div>
      )}

      {/* TAB: RIWAYAT */}
      {activeTab === "riwayat" && (
        <div className="space-y-4 animate-fade-in-up">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-t-transparent" />
              <p className="text-sm text-gray-500 dark:text-zinc-500 mt-3">Memuat riwayat...</p>
            </div>
          ) : riwayat.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 p-12 text-center">
              <History className="h-12 w-12 text-gray-300 dark:text-zinc-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 mb-1">
                Belum Ada Riwayat Latihan
              </p>
              <p className="text-xs text-gray-400 dark:text-zinc-600">
                Mulai latihan pertama Anda untuk melihat riwayat di sini
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {riwayat.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-200 bg-white p-5 hover:border-teal-500 hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-teal-500"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded-lg bg-teal-50 dark:bg-teal-950/30 px-3 py-1 text-xs font-bold text-teal-700 dark:text-teal-400">
                          {item.mapel}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-zinc-500">
                          {new Date(item.createdAt || item.timestamp).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-amber-500" />
                          <span className="font-bold text-gray-900 dark:text-white">
                            Skor: {item.skor || 0}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          <span className="text-gray-600 dark:text-zinc-400">
                            {item.benar || 0} benar
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-gray-600 dark:text-zinc-400">
                            {item.salah || 0} salah
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {item.selesai ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle className="h-3 w-3" />
                          Selesai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/20 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                          <Clock className="h-3 w-3" />
                          Belum Selesai
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
