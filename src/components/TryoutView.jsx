import React, { useState, useEffect, useRef } from "react";
import {
  Play, Clock, CheckCircle, ChevronRight, ChevronLeft,
  Award, BookOpen, ArrowLeft, Loader2, AlertCircle, RefreshCw,
  ListChecks, Trophy, PlusCircle, FileQuestion
} from "lucide-react";
import { apiService } from "../utils/api";
import { tryoutApi } from "../utils/railwayApi";

/**
 * TryoutView — Fitur tryout CAT UTBK yang terhubung ke Railway backend.
 *
 * Flow Railway:
 *  1. GET /tryout          → daftar tryout PUBLISHED/ONGOING
 *  2. POST /tryout/:id/mulai → mulai sesi, dapat soal subtes pertama (TPS)
 *  3. POST /tryout/sesi/:sesiId/submit-subtes → submit jawaban, lanjut subtes berikutnya
 *  4. POST /tryout/sesi/:sesiId/selesai       → selesaikan, hitung skor final
 *  5. GET  /tryout/sesi/:sesiId/hasil         → ambil hasil lengkap
 *
 * Fallback: jika Railway tidak tersedia, pakai soal dari localStorage/mockData.
 */

const normalizeSoal = (q) => {
  let opsiArr = [];
  if (Array.isArray(q.opsi)) {
    opsiArr = q.opsi;
  } else if (q.opsi && typeof q.opsi === "object" && Object.keys(q.opsi).length > 0) {
    opsiArr = Object.entries(q.opsi).map(([k, v]) => `${k}. ${v}`);
  }
  return {
    ...q,
    opsiArr,
    pertanyaan: q.pertanyaan || q.soal || q.question || "",
    jawaban: q.jawaban || q.answer || q.kunci || null,
    subtest: q.subtest || q.mapel || "",
  };
};

export default function TryoutView({ user, onAddPoint, onSaveTryoutRun, onNavigate }) {

  const [activeTab, setActiveTab] = useState("lobby"); // lobby | exam | result | riwayat
  const [tryouts, setTryouts] = useState([]);
  const [loadingTryouts, setLoadingTryouts] = useState(true);
  const [riwayat, setRiwayat] = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);

  // Sesi aktif
  const [selectedTO, setSelectedTO] = useState(null);
  const [sesiId, setSesiId] = useState(null);           // Railway sesi ID
  const [useRailway, setUseRailway] = useState(false);  // apakah sesi ini pakai Railway

  // Subtes state (Railway flow)
  const [currentSubtes, setCurrentSubtes] = useState(null); // nama subtes aktif
  const [subtesQueue, setSubtesQueue] = useState([]);        // antrian subtes berikutnya
  const [subtesIndex, setSubtesIndex] = useState(0);

  // Soal & jawaban
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  // Hasil
  const [recentResult, setRecentResult] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState(null);

  // ── Load daftar tryout saat mount ──────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingTryouts(true);
      const list = await apiService.getTryouts();
      setTryouts(list);
      setLoadingTryouts(false);
    };
    load();
  }, []);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "exam" || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitSubtes(true); // auto-submit saat waktu habis
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [activeTab, timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ── Mulai tryout ───────────────────────────────────────────────────────────
  const handleStartExam = async (to) => {
    setSelectedTO(to);
    setError(null);
    setSelectedAnswers({});
    setCurrentIndex(0);

    try {
      // Coba Railway
      const res = await tryoutApi.mulai(to.id);
      // res: { sesiId, subtes, soal[], subtesBerikutnya[] } (struktur tergantung backend)
      const sesi = res.sesiId || res.id || res.sessionId;
      const soal = (res.soal || res.questions || []).map(normalizeSoal);
      const subtes = res.subtes || res.subtesAktif || "TPS";
      const queue = res.subtesBerikutnya || [];

      setSesiId(sesi);
      setCurrentSubtes(subtes);
      setSubtesQueue(queue);
      setSubtesIndex(0);
      setCurrentQuestions(soal);
      setTimeLeft((to.durasiMenit || 195) * 60);
      setUseRailway(true);
      setActiveTab("exam");
    } catch (e) {
      console.warn("[Railway] mulai tryout gagal, fallback lokal:", e.message);
      // Fallback: ambil soal dari cache/mock
      await _startLocalFallback(to);
    }
  };

  const _startLocalFallback = async (to) => {
    const allQ = await apiService.getQuestions();
    let qs = allQ;
    if (to.kategori === "Kuantitatif") {
      qs = allQ.filter(
        (q) => q.subtest === "Pengetahuan Kuantitatif" || q.subtest === "Penalaran Matematika"
      );
    }
    const normalized = (qs.length > 0 ? qs : allQ).map(normalizeSoal);
    setSesiId(null);
    setCurrentSubtes("TPS");
    setSubtesQueue([]);
    setCurrentQuestions(normalized);
    setTimeLeft((to.durasiMenit || 15) * 60);
    setUseRailway(false);
    setActiveTab("exam");
  };

  // ── Pilih jawaban ──────────────────────────────────────────────────────────
  const handleSelectOption = (soalId, answer) => {
    setSelectedAnswers((prev) => ({ ...prev, [soalId]: answer }));
  };

  // ── Submit subtes / selesai ────────────────────────────────────────────────
  const handleSubmitSubtes = async (autoSubmit = false) => {
    if (loadingSubmit) return;
    clearInterval(timerRef.current);
    setLoadingSubmit(true);
    setError(null);

    // Bangun array jawaban
    const jawabanArr = currentQuestions.map((q) => ({
      soalId: q.id,
      jawaban: selectedAnswers[q.id] || null,
    }));

    if (useRailway && sesiId) {
      try {
        // Cek apakah masih ada subtes berikutnya
        const submitRes = await tryoutApi.submitSubtes(sesiId, jawabanArr);
        const nextSoal = (submitRes.soal || submitRes.questions || []).map(normalizeSoal);
        const nextSubtes = submitRes.subtes || submitRes.subtesAktif;
        const isDone = submitRes.selesai || submitRes.done || nextSoal.length === 0;

        if (!isDone && nextSoal.length > 0) {
          // Lanjut ke subtes berikutnya
          setCurrentSubtes(nextSubtes);
          setCurrentQuestions(nextSoal);
          setSelectedAnswers({});
          setCurrentIndex(0);
          setSubtesIndex((i) => i + 1);
          setTimeLeft(45 * 60); // reset timer per subtes
          setLoadingSubmit(false);
          return;
        }

        // Semua subtes selesai — panggil endpoint selesai
        const selesaiRes = await tryoutApi.selesai(sesiId);
        const hasilRes = await tryoutApi.hasil(sesiId);
        _processResult(hasilRes || selesaiRes);
      } catch (e) {
        console.warn("[Railway] submit subtes gagal, hitung lokal:", e.message);
        _calculateLocalResult();
      }
    } else {
      // Mode lokal
      _calculateLocalResult();
    }
    setLoadingSubmit(false);
  };

  // ── Hitung hasil lokal (fallback) ──────────────────────────────────────────
  const _calculateLocalResult = () => {
    let calculatedSkor = 400;
    const finalSubtestScores = {};

    currentQuestions.forEach((q) => {
      const isCorrect = selectedAnswers[q.id] === q.jawaban;
      const bonus = q.tingkat === "sulit" ? 140 : q.tingkat === "sedang" ? 100 : 70;
      const base = finalSubtestScores[q.subtest] || 450;
      finalSubtestScores[q.subtest] = isCorrect
        ? Math.min(900, base + bonus)
        : Math.max(300, base - 20);
      if (isCorrect) calculatedSkor += bonus;
    });

    calculatedSkor = Math.min(880, Math.max(380, calculatedSkor));

    const result = {
      id: "tr-" + Math.random().toString(36).substring(2, 11),
      tryoutId: selectedTO?.id,
      tryoutJudul: selectedTO?.judul || "Simulasi Tryout",
      selesai: true,
      skorTPS: calculatedSkor,
      skorLiterasi: Math.round(calculatedSkor * 0.95),
      skorTotal: calculatedSkor,
      tanggalAmbil: new Date().toISOString(),
      subtestScores: {
        "Penalaran Umum": finalSubtestScores["Penalaran Umum"] || 520,
        "Pengetahuan Kuantitatif": finalSubtestScores["Pengetahuan Kuantitatif"] || 480,
        "Pemahaman Bacaan": finalSubtestScores["Pemahaman Bacaan"] || 510,
        "Penalaran Matematika": finalSubtestScores["Penalaran Matematika"] || 500,
        "Literasi B. Indonesia": finalSubtestScores["Literasi B. Indonesia"] || 540,
        "Literasi B. Inggris": finalSubtestScores["Literasi B. Inggris"] || 530,
      },
    };
    _processResult(result);
  };

  // ── Proses & simpan hasil ──────────────────────────────────────────────────
  const _processResult = (raw) => {
    // Normalisasi field dari Railway atau lokal
    const result = {
      id: raw.id || "tr-" + Math.random().toString(36).substring(2, 11),
      tryoutId: raw.tryoutId || selectedTO?.id,
      tryoutJudul: raw.tryoutJudul || raw.judul || selectedTO?.judul || "Simulasi Tryout",
      selesai: true,
      skorTPS: raw.skorTPS || raw.skorTotal || raw.skor || 0,
      skorLiterasi: raw.skorLiterasi || 0,
      skorTotal: raw.skorTotal || raw.skor || raw.skorTPS || 0,
      tanggalAmbil: raw.tanggalAmbil || raw.createdAt || new Date().toISOString(),
      subtestScores: raw.subtestScores || raw.skorSubtes || {},
    };

    setRecentResult(result);
    onSaveTryoutRun(result);
    onAddPoint(150, `Menyelesaikan Tryout: ${result.tryoutJudul}`);
    setActiveTab("result");
  };

  // ── Load riwayat ───────────────────────────────────────────────────────────
  const handleLoadRiwayat = async () => {
    setLoadingRiwayat(true);
    try {
      const data = await apiService.getTryoutRiwayat();
      // Gabungkan dengan riwayat lokal
      const local = apiService.getSavedTryoutHistory();
      const merged = [...data, ...local].filter(
        (v, i, arr) => arr.findIndex((x) => x.id === v.id) === i
      );
      setRiwayat(merged);
    } catch (_) {
      setRiwayat(apiService.getSavedTryoutHistory());
    }
    setLoadingRiwayat(false);
    setActiveTab("riwayat");
  };


  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 font-sans">

      {/* ── LOBBY ── */}
      {activeTab === "lobby" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100/80 bg-gradient-to-br from-white to-gray-50/30 p-6 subtle-shadow dark:border-zinc-800/55 dark:from-zinc-900 dark:to-zinc-900/50 card-hover-subtle">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-teal-600" />
                Pusat Tryout CAT UTBK
              </h2>
              <button
                onClick={handleLoadRiwayat}
                className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 cursor-pointer button-hover-subtle group"
              >
                <ListChecks className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                <span>Riwayat Saya</span>
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
              Simulasi Computer Assisted Test (CAT) dengan penilaian IRT modern. Soal dan sesi dikelola langsung dari Railway backend.
            </p>

            {loadingTryouts ? (
              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Memuat daftar tryout...
              </div>
            ) : tryouts.length === 0 ? (
              <div className="mt-8 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-300 dark:text-zinc-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Belum Ada Tryout Tersedia</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4 max-w-md mx-auto">
                  Saat ini belum ada tryout yang dipublikasikan. {user?.role === "ADMIN" ? "Silakan buat tryout baru dari Admin Dashboard." : "Hubungi admin untuk menambahkan tryout."}
                </p>
                {user?.role === "ADMIN" && (
                  <button
                    onClick={() => onNavigate("admin")}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-500 cursor-pointer"
                  >
                    <PlusCircle className="h-4 w-4" /> Buat Tryout Baru
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {tryouts.map((to, idx) => (
                  <div
                    key={to.id}
                    data-aos="fade-up"
                    data-aos-delay={idx * 100}
                    className="group relative rounded-2xl border border-gray-100/80 bg-gradient-to-br from-white to-gray-50/50 p-6 flex flex-col justify-between dark:border-zinc-800/60 dark:from-zinc-900/80 dark:to-zinc-900/40 card-hover overflow-hidden"
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-emerald-500/0 group-hover:from-teal-500/5 group-hover:to-emerald-500/5 transition-all duration-500 rounded-2xl pointer-events-none" />

                    {/* Shimmer effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>

                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-500/20 smooth-hover group-hover:bg-teal-500/20 group-hover:border-teal-500/40">
                          {to.kategori || to.tipe || "UTBK"}
                        </span>
                        <span className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full smooth-hover ${to.status === "ONGOING"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/20"
                          : to.status === "PUBLISHED"
                            ? "bg-blue-50 text-blue-700 border border-blue-200/50 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/20"
                            : "bg-gray-100 text-gray-500 border border-gray-200/50 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                          }`}>
                          {to.status}
                        </span>
                      </div>
                      <h3 className="font-bold font-display text-gray-900 dark:text-white text-base leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300">
                        {to.judul || to.nama}
                      </h3>
                      <div className="flex gap-4 text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
                        {to.durasiMenit && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-teal-500" />
                            <span>{to.durasiMenit} Menit</span>
                          </div>
                        )}
                        {to.totalSoal && (
                          <div className="flex items-center gap-1.5">
                            <FileQuestion className="h-3.5 w-3.5 text-teal-500" />
                            <span>{to.totalSoal} Soal</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartExam(to)}
                      disabled={to.status === "DRAFT" || to.status === "ENDED"}
                      className="relative z-10 mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/25 button-hover disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none overflow-hidden group/btn"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                      <Play className="h-4 w-4 fill-white relative z-10 group-hover/btn:scale-110 transition-transform duration-300" />
                      <span className="relative z-10">Mulai Simulasi</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 p-8 text-center card-hover-subtle bg-gradient-to-br from-gray-50/50 to-transparent dark:from-zinc-900/30">
            <BookOpen className="h-12 w-12 text-gray-300 dark:text-zinc-600 mx-auto mb-3" />
            <h4 className="font-bold text-gray-900 dark:text-white font-display text-base mb-2">Butuh Latihan Mandiri Tanpa Durasi?</h4>
            <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-sm mx-auto mb-4 leading-relaxed">
              Kuasai materi dan trik pengerjaan di Bab Pembahasan terlebih dahulu.
            </p>
            <button
              onClick={() => onNavigate("materi")}
              className="inline-flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 cursor-pointer button-hover group"
            >
              <span>Buka Materi Belajar</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        </div>
      )}

      {/* ── EXAM ── */}
      {activeTab === "exam" && currentQuestions.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-gray-100/80 bg-white p-6 subtle-shadow dark:border-zinc-800/55 dark:bg-zinc-900">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100/80 pb-3 mb-4 dark:border-zinc-800">
                <div>
                  <span className="text-[10px] font-bold text-teal-655 tracking-wider block">
                    SOAL {currentIndex + 1} / {currentQuestions.length}
                  </span>
                  {currentSubtes && (
                    <span className="text-[9px] text-gray-400 font-mono uppercase">{currentSubtes}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/10 text-red-650 px-3 py-1 text-xs font-mono font-bold dark:bg-red-950/20 dark:text-red-400 animate-pulse">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>

              {/* Tingkat badge */}
              <div className="mb-4 flex gap-2">
                {(currentQuestions[currentIndex].subtest || currentQuestions[currentIndex].mapel) && (
                  <span className="text-[9px] font-bold uppercase rounded-md bg-gray-50 dark:bg-zinc-800 px-2.5 py-1 text-gray-500 dark:text-zinc-400 tracking-wider">
                    {currentQuestions[currentIndex].subtest || currentQuestions[currentIndex].mapel}
                  </span>
                )}
                {currentQuestions[currentIndex].tingkat && (
                  <span className={`text-[9px] font-bold uppercase py-1 px-2.5 rounded-md tracking-wider border ${currentQuestions[currentIndex].tingkat === "sulit" ? "bg-red-50 text-red-700 border-red-100/55" :
                    currentQuestions[currentIndex].tingkat === "sedang" ? "bg-amber-50 text-amber-700 border-amber-100/55" :
                      "bg-emerald-50 text-emerald-700 border-emerald-100/55"
                    }`}>
                    {currentQuestions[currentIndex].tingkat}
                  </span>
                )}
              </div>

              {/* Pertanyaan */}
              <p className="text-sm md:text-base text-gray-800 dark:text-zinc-200 mt-2 font-medium leading-relaxed whitespace-pre-wrap font-display">
                {currentQuestions[currentIndex].pertanyaan}
              </p>

              {/* Opsi */}
              <div className="mt-6 space-y-3">
                {currentQuestions[currentIndex].tipe === "SHORT_ANSWER" ? (
                  // Input teks untuk SHORT_ANSWER
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">Ketik jawaban Anda:</p>
                    <input
                      type="text"
                      value={selectedAnswers[currentQuestions[currentIndex].id] || ""}
                      onChange={(e) => handleSelectOption(currentQuestions[currentIndex].id, e.target.value)}
                      className="w-full rounded-xl border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 dark:text-white transition-all duration-200 smooth-hover"
                      placeholder="Tulis jawaban di sini..."
                    />
                  </div>
                ) : (
                  (currentQuestions[currentIndex].opsiArr || []).map((opsiStr, oIdx) => {
                    const isSelected = selectedAnswers[currentQuestions[currentIndex].id] === opsiStr;
                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleSelectOption(currentQuestions[currentIndex].id, opsiStr)}
                        className={`group/option relative flex items-center gap-4 cursor-pointer rounded-xl border-2 p-4 text-sm transition-all duration-200 overflow-hidden ${isSelected
                          ? "border-teal-500 bg-gradient-to-r from-teal-50 to-emerald-50/50 dark:border-teal-500 dark:from-teal-950/40 dark:to-emerald-950/20 text-teal-900 dark:text-white font-semibold shadow-lg shadow-teal-500/10"
                          : "border-gray-200 text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-900/50 hover:border-teal-400 hover:bg-teal-50/30 dark:border-zinc-800 dark:hover:border-teal-500/50 dark:hover:bg-teal-950/20 hover:shadow-md"
                          }`}
                      >
                        {/* Shimmer effect on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover/option:opacity-100 transition-opacity duration-300 pointer-events-none">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-500/5 to-transparent -translate-x-full group-hover/option:translate-x-full transition-transform duration-700" />
                        </div>

                        <span className={`relative z-10 shrink-0 flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs transition-all duration-200 ${isSelected
                          ? "bg-teal-600 border-2 border-teal-600 text-white shadow-lg shadow-teal-600/30 scale-110"
                          : "border-2 border-gray-300 text-gray-500 dark:border-zinc-700 dark:text-zinc-400 group-hover/option:border-teal-400 group-hover/option:text-teal-600 group-hover/option:scale-105"
                          }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="relative z-10 flex-1">{opsiStr}</span>

                        {/* Checkmark for selected */}
                        {isSelected && (
                          <CheckCircle className="relative z-10 h-5 w-5 text-teal-600 dark:text-teal-400 animate-scale-in" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Navigasi */}
              <div className="mt-8 flex justify-between border-t border-gray-100/80 pt-5 dark:border-zinc-800">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(currentIndex - 1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 button-hover-subtle group"
                >
                  <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
                  <span>Sebelumnya</span>
                </button>
                {currentIndex < currentQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 button-hover-subtle group"
                  >
                    <span>Selanjutnya</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubmitSubtes(false)}
                    disabled={loadingSubmit}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-600/30 button-hover disabled:opacity-60 disabled:cursor-not-allowed group overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {loadingSubmit ? (
                      <Loader2 className="h-4 w-4 animate-spin relative z-10" />
                    ) : (
                      <CheckCircle className="h-4 w-4 relative z-10 group-hover:scale-110 transition-transform duration-200" />
                    )}
                    <span className="relative z-10">
                      {useRailway && subtesQueue.length > subtesIndex ? "Lanjut Subtes" : "Kumpulkan Ujian"}
                    </span>
                  </button>
                )}
              </div>

              {error && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}
            </div>
          </div>

          {/* Panel navigasi soal */}
          <div className="rounded-2xl border border-gray-100/80 bg-white p-6 subtle-shadow dark:border-zinc-800/55 dark:bg-zinc-900 h-fit card-hover-subtle">
            <h3 className="font-bold font-display text-sm text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-teal-600" />
              Navigasi Jawaban
            </h3>
            <div className="grid grid-cols-5 gap-2.5">
              {currentQuestions.map((q, idx) => {
                const isActive = currentIndex === idx;
                const isAnswered = !!selectedAnswers[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative h-10 rounded-lg text-xs font-bold border-2 transition-all duration-200 cursor-pointer overflow-hidden group/nav ${isActive
                      ? "border-teal-500 bg-gradient-to-br from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-600/30 scale-105"
                      : isAnswered
                        ? "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-900/50 dark:bg-teal-950/30 dark:text-teal-400 hover:border-teal-400 hover:bg-teal-100 hover:scale-105"
                        : "border-gray-200 text-gray-500 dark:border-zinc-800 dark:text-zinc-500 bg-gray-50/50 dark:bg-zinc-900/50 hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-600 hover:scale-105"
                      }`}
                  >
                    {/* Shimmer on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/nav:translate-x-full transition-transform duration-500" />
                    </div>
                    <span className="relative z-10">{idx + 1}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 border-t border-gray-100/80 pt-4 space-y-3 text-[11px] text-gray-500 dark:border-zinc-800 dark:text-zinc-400 font-medium">
              <div className="flex items-center gap-2.5">
                <span className="h-3 w-3 rounded-md bg-gradient-to-br from-teal-600 to-teal-500 shadow-sm"></span>
                <span>Soal Aktif</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="h-3 w-3 rounded-md bg-teal-50 border-2 border-teal-300 dark:bg-teal-950/30 dark:border-teal-900/50"></span>
                <span>Sudah Dijawab</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="h-3 w-3 rounded-md bg-gray-50 border-2 border-gray-200 dark:bg-zinc-900/50 dark:border-zinc-800"></span>
                <span>Belum Dijawab</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT ── */}
      {activeTab === "result" && recentResult && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-zinc-950 border border-zinc-800/80 p-6 text-white text-center space-y-4 relative overflow-hidden">
            <Award className="h-16 w-16 mx-auto bg-teal-500/10 p-3.5 rounded-full border border-teal-500/20 text-teal-400" />
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-teal-400 font-bold font-mono">Hasil Penilaian IRT UTBK</span>
              <h2 className="text-2xl font-bold font-display">{recentResult.tryoutJudul}</h2>
            </div>
            <div className="grid grid-cols-2 max-w-sm mx-auto gap-4 bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4">
              <div>
                <span className="block text-[9px] tracking-wider uppercase text-zinc-400">Skor Total</span>
                <span className="text-3xl font-extrabold font-display">{recentResult.skorTotal}</span>
              </div>
              <div>
                <span className="block text-[9px] tracking-wider uppercase text-zinc-400">Status</span>
                <span className={`text-lg font-bold block mt-2 font-display ${recentResult.skorTotal >= 680 ? "text-emerald-400" : recentResult.skorTotal >= 600 ? "text-amber-400" : "text-rose-400"}`}>
                  {recentResult.skorTotal >= 680 ? "AMAN" : recentResult.skorTotal >= 600 ? "PERLU LATIHAN" : "TINGKATKAN"}
                </span>
              </div>
            </div>
            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-teal-500/5 blur-3xl"></div>
          </div>

          {/* Subtest scores */}
          {Object.keys(recentResult.subtestScores || {}).length > 0 && (
            <div className="rounded-2xl border border-gray-100/80 bg-white p-6 subtle-shadow dark:border-zinc-800/55 dark:bg-zinc-900">
              <h3 className="font-bold font-display text-gray-900 dark:text-white mb-4 text-base">Nilai per Subtes</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {Object.entries(recentResult.subtestScores).map(([name, score]) => (
                  <div key={name} className="p-4 border border-gray-100/80 rounded-xl bg-gray-50/30 dark:border-zinc-800/60 dark:bg-zinc-800/20">
                    <span className="text-[10px] font-bold text-teal-650 uppercase block tracking-wider font-mono">{name}</span>
                    <span className="text-xl font-extrabold text-gray-950 dark:text-white mt-1 block font-display">{score}</span>
                    <div className="mt-2 h-1.5 w-full bg-gray-100/60 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.round((score / 900) * 100))}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pembahasan (hanya mode lokal) */}
          {!useRailway && currentQuestions.length > 0 && (
            <div className="rounded-2xl border border-gray-100/80 bg-white p-6 subtle-shadow dark:border-zinc-800/55 dark:bg-zinc-900">
              <h3 className="font-bold font-display text-gray-900 dark:text-white mb-4 text-base">Pembahasan Kunci Jawaban</h3>
              <div className="space-y-5">
                {currentQuestions.map((q, idx) => {
                  const studentAns = selectedAnswers[q.id];
                  const isCorrect = studentAns === q.jawaban;
                  return (
                    <div key={q.id} className="border-b border-gray-100/85 pb-5 dark:border-zinc-800 last:border-b-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 mt-0.5 ${isCorrect ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20" : "bg-rose-500/10 text-rose-700 border border-rose-500/20"}`}>
                          {idx + 1}
                        </span>
                        <div className="space-y-2 flex-1">
                          <p className="text-xs font-semibold text-gray-900 dark:text-zinc-200 leading-relaxed">{q.pertanyaan}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 dark:bg-zinc-800/30 dark:border-zinc-800/50">
                              <span className="text-gray-400 block font-semibold mb-0.5 uppercase tracking-wide text-[9px]">Pilihan Anda:</span>
                              <span className={`font-bold ${isCorrect ? "text-emerald-600" : "text-rose-600"}`}>{studentAns || "(Tidak dijawab)"}</span>
                            </div>
                            <div className="p-3 rounded-lg bg-teal-50/20 border border-teal-100/40 dark:bg-teal-950/20">
                              <span className="text-teal-600 dark:text-teal-400 block font-semibold mb-0.5 uppercase tracking-wide text-[9px]">Kunci Jawaban:</span>
                              <span className="font-bold text-teal-800 dark:text-teal-300">{q.jawaban}</span>
                            </div>
                          </div>
                          {q.pembahasan && (
                            <div className="mt-2 rounded-lg border border-dashed border-gray-150 p-4 text-[10px] leading-relaxed whitespace-pre-line dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                              <strong className="text-teal-700 dark:text-teal-400 block mb-1 text-xs">Pembahasan:</strong>
                              {q.pembahasan}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button onClick={() => setActiveTab("lobby")} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-350 cursor-pointer shadow-xs">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Lobi
            </button>
          </div>
        </div>
      )}

      {/* ── RIWAYAT ── */}
      {activeTab === "riwayat" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-display text-gray-900 dark:text-white">Riwayat Tryout Saya</h2>
            <button onClick={() => setActiveTab("lobby")} className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-teal-600 dark:text-zinc-400 cursor-pointer">
              <ArrowLeft className="h-3.5 w-3.5" /> Kembali
            </button>
          </div>

          {loadingRiwayat ? (
            <div className="flex items-center justify-center gap-2 py-12 text-xs text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat riwayat...
            </div>
          ) : riwayat.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-150 p-10 text-center dark:border-zinc-800">
              <Trophy className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Belum ada riwayat tryout. Mulai tryout pertama Anda!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {riwayat.map((r) => (
                <div key={r.id} className="rounded-xl border border-gray-100/80 bg-white p-4 dark:border-zinc-800/55 dark:bg-zinc-900 flex items-center justify-between gap-4">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{r.tryoutJudul || r.judul}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{new Date(r.tanggalAmbil || r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xl font-extrabold text-teal-600 dark:text-teal-400 font-display">{r.skorTotal || r.skor || "-"}</span>
                    <span className="text-[9px] text-gray-400 block font-mono">SKOR IRT</span>
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
