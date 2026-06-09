import React, { useState, useEffect } from "react";
import {
  GraduationCap, Menu, X, ArrowRight, CheckCircle, Star,
  TrendingUp, BookOpen, Award, Users, Sparkles, Target,
  BarChart3, Calendar, MessageSquare, Zap, Shield, Clock,
  ChevronDown, Play, ExternalLink, Mail, MapPin, Phone,
  Facebook, Twitter, Instagram, Linkedin, Youtube
} from "lucide-react";
import imageUTBK from "../../public/logo.png"

export default function LandingPage({ user, onNavigateToAuth, onNavigateToDashboard, darkMode, onToggleDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("siswa");
  const [activeFaq, setActiveFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Sticky navbar on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll helper
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setMobileMenuOpen(false);
    }
  };

  // Stats counter animation (simplified)
  const stats = [
    { value: "10,000+", label: "Siswa Aktif", icon: <Users className="h-5 w-5" /> },
    { value: "500+", label: "Soal Tryout", icon: <BookOpen className="h-5 w-5" /> },
    { value: "200+", label: "Tryout Tersedia", icon: <Target className="h-5 w-5" /> },
    { value: "98%", label: "Kepuasan User", icon: <Star className="h-5 w-5" /> },
  ];

  const features = [
    {
      icon: <Play className="h-6 w-6" />,
      title: "Tryout CAT UTBK",
      desc: "Simulasi ujian real-time dengan sistem Computer Assisted Test, timer otomatis, dan ranking nasional.",
      color: "teal",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analitik Skor IRT",
      desc: "Grafik perkembangan nilai, identifikasi kelemahan per subtes, dan prediksi peluang lolos PTN impian.",
      color: "blue",
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Materi Lengkap",
      desc: "Bank soal, ringkasan materi, video pembelajaran, dan pembahasan detail untuk semua mapel UTBK.",
      color: "purple",
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Rekomendasi Jurusan",
      desc: "AI merekomendasikan jurusan PTN berdasarkan skor tryout, minat, dan data passing grade terkini.",
      color: "emerald",
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Gamifikasi Belajar",
      desc: "Sistem XP, level, badge, leaderboard, dan streak harian untuk meningkatkan motivasi belajar.",
      color: "amber",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Forum Komunitas",
      desc: "Diskusi dengan sesama pejuang UTBK, tanya jawab, dan sharing strategi belajar efektif.",
      color: "rose",
    },
  ];

  const testimonials = [
    {
      name: "Ahmad Rivaldi",
      university: "Universitas Indonesia",
      major: "Pendidikan Dokter",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      quote: "Skor saya naik 180 poin setelah rutin tryout di EduPTN. Analitik skornya sangat membantu identifikasi kelemahan!",
      improvement: "+180 poin",
    },
    {
      name: "Sarah Azzahra",
      university: "Institut Teknologi Bandung",
      major: "Teknik Informatika",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      quote: "Fitur rekomendasi jurusan sangat akurat. Saya jadi lebih percaya diri memilih prodi yang sesuai dengan kemampuan.",
      improvement: "+210 poin",
    },
    {
      name: "Budi Santoso",
      university: "Universitas Gadjah Mada",
      major: "Hukum",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      quote: "Materi dan pembahasan soalnya lengkap banget. Forum diskusi juga aktif, jadi bisa tanya-tanya kalau stuck.",
      improvement: "+165 poin",
    },
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "Rp 0",
      period: "Selamanya",
      features: [
        "Akses materi dasar",
        "5 tryout per bulan",
        "Analitik basic",
        "Forum komunitas",
        "Rekomendasi jurusan",
      ],
      cta: "Mulai Gratis",
      popular: false,
    },
    {
      name: "Premium",
      price: "Rp 99.000",
      period: "per bulan",
      features: [
        "Semua fitur Free",
        "Unlimited tryout",
        "Analitik lengkap + AI",
        "Konsultasi mentor",
        "Prioritas support",
        "Akses materi premium",
        "Download pembahasan PDF",
      ],
      cta: "Upgrade Sekarang",
      popular: true,
    },
  ];

  const faqs = [
    { q: "Apakah EduPTN benar-benar gratis?", a: "Ya! Kami menyediakan paket gratis dengan akses materi dasar, 5 tryout per bulan, dan fitur komunitas. Untuk fitur premium seperti unlimited tryout dan konsultasi mentor, tersedia paket berbayar." },
    { q: "Apakah ada pembahasan soal?", a: "Tentu! Setiap soal dilengkapi dengan pembahasan detail, strategi pengerjaan, dan tips dari mentor berpengalaman." },
    { q: "Apakah bisa diakses di mobile?", a: "Sangat bisa! Platform kami fully responsive dan bisa diakses dari smartphone, tablet, atau desktop dengan pengalaman yang optimal." },
    { q: "Bagaimana sistem ranking tryout?", a: "Setiap tryout memiliki ranking nasional real-time. Anda bisa melihat posisi Anda dibanding ribuan peserta lain dan mengukur kemampuan secara objektif." },
    { q: "Apakah skor tryout akurat dengan UTBK asli?", a: "Kami menggunakan sistem penilaian IRT (Item Response Theory) yang sama dengan UTBK resmi, sehingga skor tryout sangat mendekati kondisi ujian sebenarnya." },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="bg-white dark:bg-[#080C14] transition-colors">

        {/* ── NAVBAR ── */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-[#080C14]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-zinc-800/50 shadow-sm"
            : "bg-transparent"
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <img
          src={imageUTBK}
          alt="EduPTN"
          className="h-20 w-auto"
          />

              {/* Desktop menu */}
              <div className="hidden md:flex items-center gap-8">
                {["Home", "Fitur", "Tryout", "Testimoni", "Harga", "FAQ"].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className="text-sm font-semibold text-gray-600 hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-400 transition-colors cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="hidden md:flex items-center gap-3">
                {user ? (
                  // Jika sudah login, tampilkan tombol "Buka Dashboard"
                  <button
                    onClick={onNavigateToDashboard}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-500 transition-all cursor-pointer"
                  >
                    Buka Dashboard <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  // Jika belum login, tampilkan tombol "Login" dan "Daftar Gratis"
                  <>
                    <button
                      onClick={() => onNavigateToAuth("login")}
                      className="text-sm font-semibold text-gray-700 hover:text-teal-600 dark:text-zinc-300 dark:hover:text-teal-400 transition-colors cursor-pointer"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => onNavigateToAuth("register")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-500 transition-all cursor-pointer"
                    >
                      Daftar Gratis <ArrowRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#080C14] animate-fade-in">
              <div className="px-4 py-4 space-y-2">
                {["Home", "Fitur", "Tryout", "Testimoni", "Harga", "FAQ"].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className="block w-full text-left px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
                <div className="pt-3 border-t border-gray-200 dark:border-zinc-800 space-y-2">
                  {user ? (
                    // Jika sudah login, tampilkan tombol "Buka Dashboard"
                    <button
                      onClick={onNavigateToDashboard}
                      className="block w-full text-center px-4 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg cursor-pointer"
                    >
                      Buka Dashboard
                    </button>
                  ) : (
                    // Jika belum login, tampilkan tombol "Login" dan "Daftar Gratis"
                    <>
                      <button
                        onClick={() => onNavigateToAuth("login")}
                        className="block w-full text-center px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => onNavigateToAuth("register")}
                        className="block w-full text-center px-4 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg cursor-pointer"
                      >
                        Daftar Gratis
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* ── HERO SECTION ── */}
        <section id="hero" className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/5 blur-3xl rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 blur-3xl rounded-full" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Text */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-100 px-4 py-1.5 dark:bg-teal-950/30 dark:border-teal-900/40">
                  <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-400">Platform Persiapan UTBK Terlengkap</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                  Raih PTN Impian dengan
                  <span className="block text-transparent bg-clip-text bg-linear-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400">
                    Persiapan Terarah
                  </span>
                </h1>

                <p className="text-lg text-gray-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                  Latihan soal, analisis nilai IRT, rekomendasi jurusan berbasis AI, dan komunitas belajar dalam satu platform modern.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => onNavigateToAuth("register")}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-base font-bold text-white hover:bg-teal-500 shadow-lg shadow-teal-600/20 transition-all cursor-pointer"
                  >
                    Mulai Belajar Gratis <ArrowRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => scrollToSection("tryout")}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3.5 text-base font-bold text-gray-700 hover:border-teal-500 hover:text-teal-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-teal-500 dark:hover:text-teal-400 transition-all cursor-pointer"
                  >
                    <Play className="h-5 w-5" /> Coba Tryout
                  </button>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-semibold text-gray-600 dark:text-zinc-400">Gratis Selamanya</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-semibold text-gray-600 dark:text-zinc-400">Tanpa Kartu Kredit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-semibold text-gray-600 dark:text-zinc-400">10K+ Siswa Aktif</span>
                  </div>
                </div>
              </div>

              {/* Right: Visual */}
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-800">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
                    alt="Dashboard Preview"
                    className="w-full h-auto"
                  />
                  {/* Floating cards */}
                  <div className="absolute top-4 right-4 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-zinc-700/50 p-3 shadow-lg animate-float">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950/50">
                        <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">Skor Meningkat</p>
                        <p className="text-[10px] text-gray-500 dark:text-zinc-400">+180 poin</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-zinc-700/50 p-3 shadow-lg animate-float" style={{ animationDelay: "0.5s" }}>
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-teal-100 p-2 dark:bg-teal-950/50">
                        <Award className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">Ranking #12</p>
                        <p className="text-[10px] text-gray-500 dark:text-zinc-400">dari 10.000 siswa</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS SECTION ── */}
        <section className="py-12 bg-gray-50 dark:bg-zinc-900/50 border-y border-gray-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-zinc-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES SECTION ── */}
        <section id="fitur" className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block rounded-full bg-teal-50 border border-teal-100 px-4 py-1.5 text-xs font-bold text-teal-700 dark:bg-teal-950/30 dark:border-teal-900/40 dark:text-teal-400 mb-4">
                Fitur Unggulan
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Semua yang Kamu Butuhkan<br />untuk Lolos UTBK
              </h2>
              <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Platform lengkap dengan teknologi modern untuk persiapan UTBK yang terarah dan efektif.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 hover:border-teal-500 hover:shadow-xl transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-teal-500"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-${feature.color}-100 dark:bg-${feature.color}-950/50 text-${feature.color}-600 dark:text-${feature.color}-400 mb-4 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY EDUPTN SECTION ── */}
        <section className="py-20 bg-gray-50 dark:bg-zinc-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Kenapa Harus EduPTN?
              </h2>
              <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Kami berbeda dari platform belajar lainnya. Lihat perbandingannya.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Platform Biasa */}
                <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">Platform Biasa</h3>
                  <ul className="space-y-4">
                    {[
                      "Hanya video pembelajaran",
                      "Tidak ada tracking progress",
                      "Belajar sendiri tanpa komunitas",
                      "Tidak ada personalisasi",
                      "Analitik terbatas",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600 dark:text-zinc-400">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* EduPTN */}
                <div className="rounded-2xl border-2 border-teal-500 bg-teal-50/50 p-8 dark:border-teal-500 dark:bg-teal-950/20 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-600 px-4 py-1 text-xs font-bold text-white">
                    Pilihan Terbaik
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">EduPTN</h3>
                  <ul className="space-y-4">
                    {[
                      "Analitik lengkap + AI recommendation",
                      "Progress realtime & tracking detail",
                      "Komunitas aktif & forum diskusi",
                      "Personalisasi berbasis AI",
                      "Dashboard lengkap & modern",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PREVIEW DASHBOARD ── */}
        <section id="tryout" className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Preview Dashboard Siswa
              </h2>
              <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Lihat tampilan dashboard lengkap dengan grafik skor, jadwal belajar, dan ranking nasional.
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-xl bg-gray-100 p-1 dark:bg-zinc-800">
                {["siswa", "analitik", "tryout"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                      activeTab === tab
                        ? "bg-white text-teal-600 shadow-sm dark:bg-zinc-900 dark:text-teal-400"
                        : "text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"
                    }`}
                  >
                    {tab === "siswa" ? "Dashboard" : tab === "analitik" ? "Analitik" : "Tryout"}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-800">
              <img
                src={
                  activeTab === "siswa"
                    ? "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop"
                    : activeTab === "analitik"
                    ? "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=700&fit=crop"
                    : "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=700&fit=crop"
                }
                alt="Dashboard Preview"
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-20 bg-gray-50 dark:bg-zinc-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Cara Kerja EduPTN
              </h2>
              <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Mulai persiapan UTBK hanya dalam 5 langkah mudah.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-teal-200 dark:bg-teal-900/50 hidden md:block" />

                <div className="space-y-8">
                  {[
                    { step: 1, title: "Daftar Akun", desc: "Buat akun gratis dalam 30 detik. Tidak perlu kartu kredit.", icon: <Users className="h-5 w-5" /> },
                    { step: 2, title: "Pilih Target PTN", desc: "Tentukan universitas dan jurusan impian sebagai target belajar.", icon: <Target className="h-5 w-5" /> },
                    { step: 3, title: "Kerjakan Tryout", desc: "Ikuti tryout CAT dengan sistem penilaian IRT seperti UTBK asli.", icon: <Play className="h-5 w-5" /> },
                    { step: 4, title: "Lihat Analitik", desc: "Analisis skor, identifikasi kelemahan, dan dapatkan rekomendasi AI.", icon: <BarChart3 className="h-5 w-5" /> },
                    { step: 5, title: "Tingkatkan Skor", desc: "Latihan terarah berdasarkan analitik untuk capai target PTN impian.", icon: <TrendingUp className="h-5 w-5" /> },
                  ].map((item, idx) => (
                    <div key={idx} className="relative flex items-start gap-6">
                      <div className="shrink-0 flex items-center justify-center w-16 h-16 rounded-xl bg-teal-600 text-white font-bold text-xl shadow-lg z-10">
                        {item.step}
                      </div>
                      <div className="flex-1 pt-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-zinc-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section id="testimoni" className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block rounded-full bg-teal-50 border border-teal-100 px-4 py-1.5 text-xs font-bold text-teal-700 dark:bg-teal-950/30 dark:border-teal-900/40 dark:text-teal-400 mb-4">
                Testimoni
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Mereka Berhasil Lolos PTN<br />dengan EduPTN
              </h2>
              <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Ribuan siswa telah merasakan manfaat belajar di EduPTN dan berhasil masuk PTN impian.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testi, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-xl transition-all dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={testi.photo}
                      alt={testi.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-teal-500"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white">{testi.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">{testi.university}</p>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{testi.major}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-100 px-2 py-1 dark:bg-emerald-950/50">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{testi.improvement}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed italic">
                    "{testi.quote}"
                  </p>
                  <div className="flex gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="harga" className="py-20 bg-gray-50 dark:bg-zinc-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Pilih Paket yang Sesuai
              </h2>
              <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Mulai gratis, upgrade kapan saja untuk fitur premium.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {pricingPlans.map((plan, idx) => (
                <div
                  key={idx}
                  className={`relative rounded-2xl border-2 p-8 ${
                    plan.popular
                      ? "border-teal-500 bg-white dark:bg-zinc-900 shadow-xl scale-105"
                      : "border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-teal-600 px-4 py-1 text-xs font-bold text-white">
                      Paling Populer
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                      <span className="text-sm text-gray-500 dark:text-zinc-400">/ {plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600 dark:text-zinc-400">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => onNavigateToAuth("register")}
                    className={`w-full rounded-xl py-3 text-sm font-bold transition-all cursor-pointer ${
                      plan.popular
                        ? "bg-teal-600 text-white hover:bg-teal-500 shadow-lg"
                        : "border-2 border-gray-200 bg-white text-gray-700 hover:border-teal-500 hover:text-teal-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Pertanyaan yang Sering Ditanyakan
              </h2>
              <p className="text-lg text-gray-600 dark:text-zinc-400">
                Temukan jawaban untuk pertanyaan umum tentang EduPTN.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 shrink-0 transition-transform ${
                        activeFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-5 pb-5 text-sm text-gray-600 dark:text-zinc-400 leading-relaxed border-t border-gray-100 dark:border-zinc-800 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA PENUTUP ── */}
        <section className="py-20 bg-linear-to-br from-teal-600 via-teal-700 to-emerald-800 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 blur-3xl rounded-full" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/10 blur-3xl rounded-full" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Siap Raih PTN Impian?
            </h2>
            <p className="text-lg text-teal-100 mb-8 max-w-2xl mx-auto">
              Bergabung dengan 10.000+ siswa yang sudah memulai persiapan UTBK bersama EduPTN. Gratis selamanya, tanpa kartu kredit.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => onNavigateToAuth("register")}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-teal-600 hover:bg-gray-50 shadow-xl transition-all cursor-pointer"
              >
                Daftar Gratis Sekarang <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollToSection("fitur")}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-8 py-4 text-base font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
              >
                Pelajari Lebih Lanjut
              </button>
            </div>

            <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-teal-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-semibold">Gratis Selamanya</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-semibold">Tanpa Kartu Kredit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-semibold">Akses Instan</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="bg-gray-900 dark:bg-black text-gray-300 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {/* Logo & desc */}
              <div className="md:col-span-1">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="rounded-xl bg-teal-600 p-2 text-white">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-base">EduPTN</span>
                    <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest font-mono">UTBK-SNBT 2026</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  Platform persiapan UTBK terlengkap dengan tryout CAT, analitik IRT, dan rekomendasi AI.
                </p>
                <div className="flex gap-3">
                  {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, idx) => (
                    <a
                      key={idx}
                      href="#"
                      className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-800 hover:bg-teal-600 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div>
                <h3 className="font-bold text-white mb-4">Navigasi</h3>
                <ul className="space-y-2">
                  {["Home", "Fitur", "Tryout", "Testimoni", "Harga", "FAQ"].map((item) => (
                    <li key={item}>
                      <button
                        onClick={() => scrollToSection(item.toLowerCase())}
                        className="text-sm text-gray-400 hover:text-teal-400 transition-colors cursor-pointer"
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Fitur */}
              <div>
                <h3 className="font-bold text-white mb-4">Fitur</h3>
                <ul className="space-y-2">
                  {["Tryout CAT", "Analitik Skor", "Materi Belajar", "Rekomendasi Jurusan", "Gamifikasi", "Forum Komunitas"].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Kontak */}
              <div>
                <h3 className="font-bold text-white mb-4">Kontak</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <a href="mailto:support@eduptn.com" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">
                      support@eduptn.com
                    </a>
                  </li>
                  <li className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <a href="tel:+6281234567890" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">
                      +62 812-3456-7890
                    </a>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-400">
                      Jakarta, Indonesia
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">
                © 2026 EduPTN. All rights reserved. Powered by Railway & Supabase.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </footer>

      </div>

      {/* Floating animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
