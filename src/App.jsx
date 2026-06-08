import React, { useState, useEffect } from "react";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { 
  Award, 
  BookOpen, 
  Calendar as CalendarIcon, 
  Compass, 
  GraduationCap, 
  MessageSquare, 
  Play, 
  Sparkles, 
  TrendingUp, 
  LogOut, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Menu,
  X,
  CheckCircle,
  AlertCircle,
  Zap,
  Settings
} from "lucide-react";
import { apiService } from "./utils/api";
import AuthPage from "./components/AuthPage";
import LandingPage from "./components/LandingPage";
import LogoutConfirmModal from "./components/LogoutConfirmModal";

// Import Views
import DashboardView from "./components/DashboardView";
import MateriView from "./components/MateriView";
import TryoutView from "./components/TryoutView";
import LatihanView from "./components/LatihanView";
import AnalitikView from "./components/AnalitikView";
import CampusRecommendationView from "./components/CampusRecommendationView";
import CommunityView from "./components/CommunityView";
import ConsultationView from "./components/ConsultationView";
import GamifikasiView from "./components/GamifikasiView";
import CalendarView from "./components/CalendarView";
import AdminDashboardView from "./components/AdminDashboardView";
import ProfileSettings from "./components/ProfileSettings";

export default function App() {
  const [user, setUser] = useState(null);
  const [showLanding, setShowLanding] = useState(true); // true = landing, false = auth
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Platform State Engine
  const [kampusImpian, setKampusImpian] = useState(null);
  const [history, setHistory] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [gamifikasi, setGamifikasi] = useState(null);
  const [posts, setPosts] = useState([]);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = "toast-" + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Auto detect profile & pull states
  useEffect(() => {
    // Initialize AOS (Animate On Scroll)
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: false, // Animation will trigger every time on scroll
      mirror: true, // Animate elements while scrolling past them
      offset: 50,
      delay: 0,
    });

    // Check for Google OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const googleAuth = urlParams.get('google_auth');
    const linkedinAuth = urlParams.get('linkedin_auth');
    const userData = urlParams.get('user');
    const token = urlParams.get('token');

    // Handle Google OAuth
    if (googleAuth === 'success' && userData && token) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        
        console.log("🔐 Google OAuth Success!");
        console.log("   User:", user.name);
        console.log("   Email:", user.email);
        console.log("   Avatar:", user.avatar);
        
        // Save to localStorage
        localStorage.setItem('utbk_user', JSON.stringify(user));
        localStorage.setItem('utbk_token', token);
        
        // Set user state
        setUser(user);
        setShowLanding(false);
        
        // Show success toast
        showToast(`🎉 Selamat datang, ${user.name}!`, "success");
        
        // Clean URL
        window.history.replaceState({}, document.title, "/");
      } catch (error) {
        console.error("Error parsing Google auth data:", error);
        showToast("❌ Login gagal, silakan coba lagi", "error");
      }
    } else if (googleAuth === 'failed') {
      showToast("❌ Login dengan Google gagal", "error");
      window.history.replaceState({}, document.title, "/");
    }

    // Handle LinkedIn OAuth
    if (linkedinAuth === 'success' && userData && token) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        
        console.log("🔐 LinkedIn OAuth Success!");
        console.log("   User:", user.name);
        console.log("   Email:", user.email);
        console.log("   Avatar:", user.avatar);
        
        // Save to localStorage
        localStorage.setItem('utbk_user', JSON.stringify(user));
        localStorage.setItem('utbk_token', token);
        
        // Set user state
        setUser(user);
        setShowLanding(false);
        
        // Show success toast
        showToast(`🎉 Selamat datang, ${user.name}!`, "success");
        
        // Clean URL
        window.history.replaceState({}, document.title, "/");
      } catch (error) {
        console.error("Error parsing LinkedIn auth data:", error);
        showToast("❌ Login gagal, silakan coba lagi", "error");
      }
    } else if (linkedinAuth === 'failed') {
      showToast("❌ Login dengan LinkedIn gagal", "error");
      window.history.replaceState({}, document.title, "/");
    }

    const initApp = async () => {
      // Sync data dari Railway ke cache lokal
      await apiService.syncWithSupabase();
      
      const u = await apiService.getCurrentUser();
      if (u) {
        setUser(u);
        // TIDAK langsung skip landing page - biarkan user lihat landing dulu
        // setShowLanding(false); 
        setSchedules(apiService.getSavedSchedules());
        setGamifikasi(apiService.getSavedGamifikasi());
        setPosts(apiService.getSavedPosts());
        setHistory(apiService.getSavedTryoutHistory());
        
        const savedCamp = localStorage.getItem("utbk_target_campus");
        if (savedCamp) {
          setKampusImpian(JSON.parse(savedCamp));
        }
      }
    };
    initApp();

    // System dark mode check - FIX: Default to light mode if no preference
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark"; // Only dark if explicitly set to "dark"
    setDarkMode(isDark);
    
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      // Ensure light mode is active
      if (!savedTheme) {
        localStorage.setItem("theme", "light");
      }
    }

    // Refresh user data when window regains focus
    // This ensures avatar is always up-to-date
    const handleFocus = () => {
      try {
        const storedUser = localStorage.getItem("utbk_user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser((prevUser) => {
            // Only update if there's a change to avoid unnecessary re-renders
            if (JSON.stringify(prevUser) !== JSON.stringify(parsedUser)) {
              console.log("🔄 User data refreshed from localStorage");
              return parsedUser;
            }
            return prevUser;
          });
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const toggleDarkMode = () => {
    const target = !darkMode;
    setDarkMode(target);
    
    if (target) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      showToast("🌙 Mode Gelap diaktifkan", "success");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      showToast("☀️ Mode Terang diaktifkan", "success");
    }
    
    // Force reload styles
    setTimeout(() => {
      document.body.style.backgroundColor = target ? "#090D16" : "#F8FAFC";
    }, 0);
  };

  const handleAuthSuccess = async (loggedInUser) => {
    setUser(loggedInUser);
    setShowLanding(false); // Pindah ke dashboard setelah login

    // Auto-redirect: Admin langsung ke dashboard admin, siswa ke dashboard biasa
    const isAdminUser = 
      loggedInUser?.role === "ADMIN" || 
      loggedInUser?.email?.toLowerCase().includes("admin");
    
    if (isAdminUser) {
      setActiveTab("admin");
      showToast(`🛡️ Selamat datang, Admin ${loggedInUser.name}!`, "success");
    } else {
      setActiveTab("dashboard");
      showToast(`Selamat datang, ${loggedInUser.name}!`, "success");
    }

    // Load persistent state setelah login
    setSchedules(apiService.getSavedSchedules());
    setGamifikasi(apiService.getSavedGamifikasi());
    setHistory(apiService.getSavedTryoutHistory());
    setPosts(apiService.getSavedPosts());

    const savedCamp = localStorage.getItem("utbk_target_campus");
    if (savedCamp) setKampusImpian(JSON.parse(savedCamp));
  };

  const handleNavigateToAuth = (mode) => {
    setShowLanding(false); // mode bisa "login" atau "register", tapi AuthPage punya state sendiri
  };

  // Tampilkan modal konfirmasi terlebih dahulu
  const requestLogout = () => {
    // Refresh user data dari localStorage sebelum show modal
    // Ini memastikan avatar terbaru ditampilkan di modal
    try {
      const storedUser = localStorage.getItem("utbk_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser); // Update user state dengan data terbaru
      }
    } catch (error) {
      console.error("Error loading user for logout modal:", error);
    }
    
    setShowLogoutModal(true);
    setMobileMenuOpen(false); // tutup menu mobile jika terbuka
  };

  // Dipanggil saat user mengkonfirmasi logout di modal
  const handleLogoutConfirmed = () => {
    setShowLogoutModal(false);
    apiService.logout();
    setUser(null);
    setActiveTab("dashboard");
    showToast("Sesi belajar berhasil diakhiri.", "info");
  };

  const handleLogoutCancelled = () => {
    setShowLogoutModal(false);
  };

  // --- CORE ENGINE TRANSITION EVENT HANDLERS ---
  const handleAddCalendarEvent = (event) => {
    const newEvent = {
      ...event,
      id: "ev-" + Math.random().toString(36).substr(2, 9),
      completed: false
    };
    const updated = [newEvent, ...schedules];
    setSchedules(updated);
    apiService.saveSchedule(updated);
    showToast(`Agenda "${event.title}" berhasil dipasang!`, "success");
  };

  const handleToggleEvent = (id) => {
    const updated = schedules.map((s) => s.id === id ? { ...s, completed: !s.completed } : s);
    setSchedules(updated);
    apiService.saveSchedule(updated);
    showToast("Status agenda latihan diperbarui!", "success");
  };

  const handleDeleteEvent = (id) => {
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    apiService.saveSchedule(updated);
    showToast("Agenda belajar dihapus dari kalender", "info");
  };

  const handleAddPost = (title, content, category) => {
    const newPost = {
      id: "p-" + Math.random().toString(36).substr(2, 9),
      author: {
        name: user?.name || "Ahmad Rivaldi",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
        badge: "Pejuang Aktif"
      },
      title,
      content,
      category,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
      hasLiked: false
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    apiService.savePosts(updated);
    handleAddPoint(30, `Membuat postingan forum: ${title}`);
    showToast("Topik diskusi baru berhasil diposting!", "success");
  };

  const handleLikePost = (postId) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const change = p.hasLiked ? -1 : 1;
        return {
          ...p,
          likes: p.likes + change,
          hasLiked: !p.hasLiked
        };
      }
      return p;
    });
    setPosts(updated);
    apiService.savePosts(updated);
    showToast("Simpati diskusi diperbarui", "success");
  };

  const handleAddComment = (postId, commentText) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const newComm = {
          id: "c-" + Math.random().toString(36).substr(2, 9),
          author: user?.name || "Rivaldi",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
          content: commentText,
          timestamp: new Date().toISOString()
        };
        return {
          ...p,
          comments: [...p.comments, newComm]
        };
      }
      return p;
    });
    setPosts(updated);
    apiService.savePosts(updated);
    handleAddPoint(15, "Menulis tanggapan diskusi");
    showToast("Tanggapan berhasil dikirim ke forum!", "success");
  };

  const handleSetCampus = (kampus) => {
    setKampusImpian(kampus);
    localStorage.setItem("utbk_target_campus", JSON.stringify(kampus));
    const label = kampus.ptn?.nama || kampus.namaPTN || kampus.nama || "Jurusan";
    showToast(`Target prodi terpasang: ${label}!`, "success");
  };

  const handleSaveTryoutHistory = (session) => {
    const updated = [session, ...history];
    setHistory(updated);
    apiService.saveTryoutHistory(updated);
    showToast(`Tryout terkirim! Skor IRT: ${session.skorTotal}`, "success");
  };

  const handleAddPoint = (amount, reason) => {
    if (!gamifikasi) return;
    
    let newPoints = gamifikasi.points + amount;
    let newLevel = gamifikasi.level;
    let nextLevelPoints = gamifikasi.nextLevelPoints;
    let badges = [...gamifikasi.badges];

    // Simple level up thresholds (every 1000 Pts expands level)
    if (newPoints >= nextLevelPoints) {
      newLevel += 1;
      nextLevelPoints = newLevel * 1000;
      setTimeout(() => {
        showToast(`🎉 LUAR BIASA! Anda naik level ke Level ${newLevel}!`, "success");
      }, 700);
    }

    // Trigger specific badges based on milestone events
    if (reason.startsWith("Membaca Materi:") && !badges[4].unlockedAt) {
      // E.g. unlocked badge 1 on first study
    }

    // Let's check consistency
    if (reason.startsWith("Menyelesaikan Tryout:") && !badges[2].unlockedAt) {
      badges = badges.map((b) => b.id === "b3" ? { ...b, unlockedAt: new Date().toISOString() } : b);
    }

    const updatedGame = {
      ...gamifikasi,
      points: newPoints,
      level: newLevel,
      nextLevelPoints: nextLevelPoints,
      badges: badges
    };

    setGamifikasi(updatedGame);
    apiService.saveGamifikasi(updatedGame);
    showToast(`+${amount} EduPts: ${reason.split(":")[0]}`, "points");
  };

  // Sidebar components rendering logic helper
  const isAdmin = user?.role === "ADMIN" || user?.email?.toLowerCase().includes("admin");

  // ADMIN: Hanya menu admin dan settings
  // SISWA: Semua menu siswa (tanpa admin)
  const sidebarItems = isAdmin ? [
    { id: "admin", label: "Dashboard Admin", icon: <ShieldCheck className="h-4.5 w-4.5 text-amber-500" /> },
    { id: "settings", label: "Pengaturan Profil", icon: <Settings className="h-4.5 w-4.5 text-gray-500" /> },
  ] : [
    { id: "dashboard", label: "Dashboard", icon: <Compass className="h-4.5 w-4.5" /> },
    { id: "materi", label: "Membaca Materi", icon: <BookOpen className="h-4.5 w-4.5" /> },
    { id: "tryout", label: "Tryout Cat", icon: <Play className="h-4.5 w-4.5" /> },
    { id: "latihan", label: "Latihan Soal", icon: <Zap className="h-4.5 w-4.5 text-amber-500" /> },
    { id: "analitik", label: "Skor & Analisis", icon: <TrendingUp className="h-4.5 w-4.5" /> },
    { id: "campus_recommendation", label: "Rekomendasi Jurusan", icon: <GraduationCap className="h-4.5 w-4.5" /> },
    { id: "community", label: "Forum Diskusi", icon: <MessageSquare className="h-4.5 w-4.5" /> },
    { id: "ai", label: "Konsultan AI", icon: <Sparkles className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" /> },
    { id: "calendar", label: "Kalender Aktivitas", icon: <CalendarIcon className="h-4.5 w-4.5" /> },
    { id: "gamified", label: "Lencana & Klasemen", icon: <Award className="h-4.5 w-4.5 text-amber-500" /> },
    { id: "settings", label: "Pengaturan Profil", icon: <Settings className="h-4.5 w-4.5 text-gray-500" /> },
  ];

  // Tampilkan landing page atau auth page atau dashboard
  if (showLanding) {
    return (
      <LandingPage
        user={user}
        onNavigateToAuth={handleNavigateToAuth}
        onNavigateToDashboard={() => setShowLanding(false)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    );
  }

  if (!user) {
    return (
      <AuthPage
        onAuthSuccess={handleAuthSuccess}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans transition-all duration-300 dark:bg-[#090D16]">
      
      {/* Sidebar - Desktop Layout */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-gray-100/80 bg-white transition-all duration-300 dark:border-white/5 dark:bg-[#0E1320] md:flex">
        
        {/* Logo Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-gray-100/80 px-5 py-4 dark:border-white/5">
          <div className="rounded-xl bg-teal-600 p-2 text-white shadow-sm shadow-teal-600/20 dark:shadow-teal-500/10">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white font-display">EduPTN</h2>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider font-mono">UTBK-SNBT 2026</p>
          </div>
        </div>

        {/* Nav Items - scrollable */}
        <nav className="flex-1 overflow-y-auto space-y-0.5 px-3 py-3 font-sans text-xs">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`tab-hover flex w-full items-center gap-3 rounded-xl py-2.5 px-3.5 font-semibold cursor-pointer ${
                activeTab === item.id ? 
                "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 ring-1 ring-teal-200/60 dark:ring-teal-500/20" : 
                "text-gray-500 hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-400"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`tab-hover flex w-full items-center gap-3 rounded-xl py-2.5 px-3.5 font-semibold cursor-pointer ${
              darkMode
                ? "text-amber-500 dark:text-amber-400"
                : "text-gray-500 dark:text-zinc-400"
            }`}
          >
            {darkMode 
              ? <Sun className="h-4.5 w-4.5 text-amber-400" /> 
              : <Moon className="h-4.5 w-4.5 text-gray-400" />
            }
            <span>{darkMode ? "Mode Terang" : "Mode Gelap"}</span>
          </button>
        </nav>

        {/* User Profile Card - always at bottom, never overlaps nav */}
        <div className="shrink-0 border-t border-gray-100/80 bg-white px-4 py-3.5 dark:border-white/5 dark:bg-[#0E1320]">
          <div className="space-y-2.5">
            {/* User Info */}
            <div className="flex items-center gap-3">
              {/* Avatar - show uploaded/OAuth photo or initials */}
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || "User"}
                  className="h-9 w-9 rounded-xl object-cover shadow-sm shrink-0"
                  onError={(e) => {
                    // Fallback ke initials jika gambar error
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm ${
                  isAdmin 
                    ? "bg-amber-500 shadow-amber-500/25" 
                    : "bg-teal-600 shadow-teal-600/25 dark:shadow-teal-500/20"
                }`}
                style={{ display: user?.avatar ? 'none' : 'flex' }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {user?.name || "User"}
                  </p>
                  {isAdmin && (
                    <span className="shrink-0 rounded bg-amber-50 border border-amber-200/60 px-1 py-px text-[8px] font-bold text-amber-600 uppercase tracking-wide dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 dark:text-zinc-500 truncate mt-0.5">
                  {user?.email || "user@eduptn.com"}
                </p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              id="btn-logout-sidebar"
              onClick={requestLogout}
              className="group relative w-full flex items-center justify-center gap-2 rounded-full py-2 px-4 text-xs font-bold cursor-pointer overflow-hidden
                         border-2 border-red-500/30 text-red-500
                         dark:border-red-400/30 dark:text-red-400
                         transition-all duration-300 ease-out
                         hover:border-red-500 hover:text-white dark:hover:border-red-400 dark:hover:text-white
                         active:scale-95"
            >
              {/* Background fill animation on hover */}
              <div className="absolute inset-0 bg-red-500 dark:bg-red-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left rounded-full" />
              
              {/* Icon */}
              <LogOut className="h-3.5 w-3.5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              
              {/* Text */}
              <span className="relative z-10">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Navigation Mobile Header */}
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray-100/80 bg-white/95 px-5 backdrop-blur-md dark:border-white/5 dark:bg-[#0E1320]/95 md:hidden">
       

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleDarkMode} 
            className={`icon-btn-hover rounded-xl p-2.5 ${
              darkMode 
                ? "bg-amber-50/10 text-amber-400 dark:bg-amber-500/10 border border-amber-500/20" 
                : "bg-gray-100 text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="icon-btn-hover rounded-xl bg-gray-100 border border-gray-200 p-2.5 text-gray-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Expanded Mobile Menu Drawer */}
     {mobileMenuOpen && (
  <div className="fixed inset-x-0 top-16 z-40 border-b border-gray-100/80 bg-white/98 p-4 shadow-xl backdrop-blur-md dark:border-white/5 dark:bg-[#0E1320]/98 md:hidden animate-fade-in-up text-xs font-semibold">
    <nav className="grid grid-cols-2 gap-2">
      {sidebarItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setActiveTab(item.id);
            setMobileMenuOpen(false);
          }}
          className={`tab-hover flex items-center gap-2.5 rounded-xl py-2.5 px-3 ${
            activeTab === item.id
              ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200/60 dark:bg-teal-500/10 dark:text-teal-400 dark:ring-teal-500/20"
              : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}

      <button
        id="btn-logout-mobile"
        onClick={requestLogout}
        className="group relative col-span-2 mt-3 flex items-center justify-center gap-2 rounded-full py-2.5 px-5 text-sm font-bold cursor-pointer overflow-hidden
                   border-2 border-red-500/30 text-red-500
                   dark:border-red-400/30 dark:text-red-400
                   transition-all duration-300 ease-out
                   hover:border-red-500 hover:text-white
                   dark:hover:border-red-400 dark:hover:text-white
                   active:scale-95"
      >
        {/* Background fill animation on hover */}
        <div className="absolute inset-0 bg-red-500 dark:bg-red-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left rounded-full" />

        {/* Icon */}
        <LogOut className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />

        {/* Text */}
        <span className="relative z-10">Keluar Akun</span>
      </button>
    </nav>
  </div>
)}

      {/* Main Content Layout area */}
      <main className="min-h-screen p-4 md:p-8 md:pl-[272px] pt-20 md:pt-8 relative transition-all duration-300">
        {/* Render views dynamically */}
        <div className="mx-auto w-full max-w-5xl">
          
          {/* Dashboard Siswa - Only for non-admin */}
          {activeTab === "dashboard" && !isAdmin && (
            <div className="animate-fade-in-up">
              <DashboardView 
                user={user}
                kampusImpian={kampusImpian}
                history={history}
                schedules={schedules}
                gamifikasi={gamifikasi}
                onNavigate={(tab) => setActiveTab(tab)}
                onAddPoint={handleAddPoint}
                onSetKampus={handleSetCampus}
                onCampusRecommendClick={() => setActiveTab("campus_recommendation")}
              />
            </div>
          )}

          {/* Dashboard Admin - Only for admin */}
          {activeTab === "admin" && isAdmin && (
            <div className="animate-fade-in-up">
              <AdminDashboardView 
                user={user}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            </div>
          )}

          {/* Materi - Only for non-admin */}
          {activeTab === "materi" && !isAdmin && (
            <div className="animate-fade-in-up">
              <MateriView 
                onAddPoint={handleAddPoint}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            </div>
          )}

          {/* Tryout - Only for non-admin */}
          {activeTab === "tryout" && !isAdmin && (
            <div className="animate-fade-in-up">
              <TryoutView 
                user={user}
                onAddPoint={handleAddPoint}
                onSaveTryoutRun={handleSaveTryoutHistory}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            </div>
          )}

          {/* Latihan - Only for non-admin */}
          {activeTab === "latihan" && !isAdmin && (
            <div className="animate-fade-in-up">
              <LatihanView 
                user={user}
                onAddPoint={handleAddPoint}
              />
            </div>
          )}

          {/* Analitik - Only for non-admin */}
          {activeTab === "analitik" && !isAdmin && (
            <div className="animate-fade-in-up">
              <AnalitikView 
                history={history}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            </div>
          )}

          {/* Campus Recommendation - Only for non-admin */}
          {activeTab === "campus_recommendation" && !isAdmin && (
            <div className="animate-fade-in-up">
              <CampusRecommendationView 
                savedTarget={kampusImpian}
                onSetCampusTarget={handleSetCampus}
              />
            </div>
          )}

          {/* Community - Only for non-admin */}
          {activeTab === "community" && !isAdmin && (
            <div className="animate-fade-in-up">
              <CommunityView 
                posts={posts}
                onAddPost={handleAddPost}
                onLikePost={handleLikePost}
                onAddComment={handleAddComment}
                user={user}
              />
            </div>
          )}

          {/* AI Consultation - Only for non-admin */}
          {activeTab === "ai" && !isAdmin && (
            <div className="animate-fade-in-up">
              <ConsultationView showToast={showToast} />
            </div>
          )}

          {/* Calendar - Only for non-admin */}
          {activeTab === "calendar" && !isAdmin && (
            <div className="animate-fade-in-up">
              <CalendarView 
                events={schedules}
                onAddEvent={handleAddCalendarEvent}
                onToggleCompleteEvent={handleToggleEvent}
                onDeleteEvent={handleDeleteEvent}
              />
            </div>
          )}

          {/* Gamifikasi - Only for non-admin */}
          {activeTab === "gamified" && gamifikasi && !isAdmin && (
            <div className="animate-fade-in-up">
              <GamifikasiView 
                gamifikasi={gamifikasi}
                user={user}
              />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="animate-fade-in-up">
              <ProfileSettings 
                user={user}
                darkMode={darkMode}
                onSave={(updatedProfile) => {
                  console.log("📝 Profile updated in App.jsx:", {
                    name: updatedProfile.name,
                    email: updatedProfile.email,
                    avatar: updatedProfile.avatar ? "Yes" : "No"
                  });
                  
                  // Update user state with new data
                  // This will immediately update sidebar without page reload
                  setUser((prev) => ({
                    ...prev,
                    name: updatedProfile.name || prev.name,
                    email: updatedProfile.email || prev.email,
                    avatar: updatedProfile.avatar || prev.avatar
                  }));
                  
                  // Show success toast (removed from ProfileSettings to avoid duplicate)
                  showToast("✅ Profil berhasil diperbarui!", "success");
                }}
              />
            </div>
          )}

        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        user={user}
        isAdmin={isAdmin}
        targetUser={null}
        onConfirm={handleLogoutConfirmed}
        onCancel={handleLogoutCancelled}
      />

      {/* Elegant Toast Notifications HUD */}
      <div className="fixed bottom-5 right-5 z-55 flex flex-col gap-2.5 max-w-xs sm:max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl border p-4 shadow-xl animate-slide-in-right bg-white/95 border-gray-100 text-gray-850 backdrop-blur-md dark:bg-zinc-900/95 dark:border-zinc-800 dark:text-zinc-100 transition-all duration-300"
          >
            {toast.type === "success" && (
              <div className="rounded-xl bg-emerald-500/10 p-1.5 text-emerald-500 border border-emerald-500/15 shrink-0">
                <CheckCircle className="h-4.5 w-4.5" />
              </div>
            )}
            {toast.type === "points" && (
              <div className="rounded-xl bg-amber-400/10 p-1.5 text-amber-500 border border-amber-500/20 shrink-0 animate-pulse">
                <Award className="h-4.5 w-4.5" />
              </div>
            )}
            {toast.type === "error" && (
              <div className="rounded-xl bg-rose-500/10 p-1.5 text-rose-500 border border-rose-500/15 shrink-0">
                <AlertCircle className="h-4.5 w-4.5" />
              </div>
            )}
            {toast.type === "info" && (
              <div className="rounded-xl bg-teal-500/10 p-1.5 text-teal-500 border border-teal-500/15 shrink-0">
                <Compass className="h-4.5 w-4.5" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-xxs font-semibold font-sans leading-tight">{toast.message}</p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer font-bold text-sm shrink-0 leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
