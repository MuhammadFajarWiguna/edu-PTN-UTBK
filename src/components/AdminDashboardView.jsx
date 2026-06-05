import React, { useState, useEffect } from "react";
import {
  Users, BookOpen, FileQuestion, GraduationCap, TrendingUp,
  BarChart3, PieChart, Activity, Database, Settings,
  PlusCircle, Edit2, Trash2, Search, Filter, Download,
  CheckCircle, AlertCircle, Clock, Award, Target, Zap,
  ShieldCheck, Eye, UserCheck, UserX, RefreshCw, Lock,
  Unlock, Mail, Bell, Shield, Key, HelpCircle, DollarSign,
  MessageSquare, AlertTriangle, Pin, Calendar, Flame, Cpu,
  CreditCard, ChevronRight, FileText, Send, Trash, Sparkles,
  Play
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { apiService } from "../utils/api.js";

const normalizeOpsi = (opsi) => {
  if (Array.isArray(opsi)) return opsi;
  if (opsi && typeof opsi === "object" && Object.keys(opsi).length > 0) {
    return Object.entries(opsi).map(([k, v]) => `${k}. ${v}`);
  }
  return [];
};

export default function AdminDashboardView({ user, onNavigate }) {
  // --- STATE SYSTEM ---
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Entities Data
  const [users, setUsers] = useState([]);
  const [soalList, setSoalList] = useState([]);
  const [materiList, setMateriList] = useState([]);
  const [tryouts, setTryouts] = useState([]);
  const [ptnList, setPtnList] = useState([]);
  const [jurusanList, setJurusanList] = useState([]);
  const [posts, setPosts] = useState([]);

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [premiumFilter, setPremiumFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [mapelFilter, setMapelFilter] = useState("ALL");

  // Modals / Editors
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [showSoalModal, setShowSoalModal] = useState(false);
  const [editingSoal, setEditingSoal] = useState(null);
  const [soalForm, setSoalForm] = useState({
    pertanyaan: "", mapel: "TPS", subtest: "Penalaran Umum",
    tingkat: "sedang", jawaban: "A", pembahasan: "",
    opsi: ["", "", "", "", ""]
  });

  const [showMateriModal, setShowMateriModal] = useState(false);
  const [editingMateri, setEditingMateri] = useState(null);
  const [materiForm, setMateriForm] = useState({
    judul: "", kategori: "TPS", subtest: "Penalaran Umum",
    konten: "", estimasiMembaca: 10, poinReward: 100,
    videoUrl: "", pdfUrl: "", thumbnailUrl: ""
  });

  const [showTryoutModal, setShowTryoutModal] = useState(false);
  const [editingTryout, setEditingTryout] = useState(null);

  const [tryoutForm, setTryoutForm] = useState({
    judul: "", kategori: "TPS & LITERASI", status: "DRAFT",
    durasiMenit: 195, durasiTPS: 90, durasiTKA: 90,
    totalSoal: 155, jadwalMulai: "", jadwalSelesai: ""
  });

  const [showPtnModal, setShowPtnModal] = useState(false);
  const [editingPtn, setEditingPtn] = useState(null);
  const [ptnForm, setPtnForm] = useState({
    nama: "", akreditasi: "A", lokasi: ""
  });

  const [showJurusanModal, setShowJurusanModal] = useState(false);
  const [editingJurusan, setEditingJurusan] = useState(null);
  const [jurusanForm, setJurusanForm] = useState({
    nama: "", passingGrade: 60, dayaTampung: 50,
    peminat: 1200, kelompok: "SAINTEK", ptnId: ""
  });

  // Settings State
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    theme: "dark",
    logoUrl: "",
    geminiApiKey: "AIzaSyBmceORLI7vyfwGiwMxc-x1nLWkVA5ZifA",
    openaiApiKey: "sk-proj-...",
    supabaseUrl: "https://ysveoqfelzwdldhzkkws.supabase.co",
    aiLimitPerUser: 25,
    thresholdSkorKelolosan: 650
  });

  // Gamification States
  const [badges, setBadges] = useState([
    { id: "b1", title: "Pejuang Pertama", icon: "GraduationCap", xp: 100, desc: "Selesaikan 1 Tryout" },
    { id: "b2", title: "Master TPS", icon: "Zap", xp: 500, desc: "Skor TPS > 700" },
    { id: "b3", title: "Konsisten Belajar", icon: "Flame", xp: 300, desc: "Streak belajar 7 hari" }
  ]);
  const [newBadge, setNewBadge] = useState({ title: "", icon: "Award", xp: 100, desc: "" });

  // Notification Send Form
  const [notifForm, setNotifForm] = useState({
    title: "", message: "", target: "ALL", type: "PUSH"
  });

  // AI Logs simulation
  const [aiLogs] = useState([
    { id: 1, email: "ahmad.rivaldi@gmail.com", prompt: "Bagaimana cara cepat mengerjakan soal kuantitatif?", tokens: 254, timestamp: "2026-05-26T12:00:00Z" },
    { id: 2, email: "sarah.azzahra@outlook.com", prompt: "Bahas soal penalaran umum nomor 5", tokens: 412, timestamp: "2026-05-26T12:05:00Z" },
    { id: 3, email: "clara.angelica@gmail.com", prompt: "Rekomendasi PTN dengan skor 600", tokens: 198, timestamp: "2026-05-26T12:15:00Z" }
  ]);

  // Payment logs
  const [payments] = useState([
    { id: "TX-9901", name: "Sarah Azzahra", plan: "PRO Bulanan", amount: 49000, date: "2026-05-25T10:00:00Z", status: "SUCCESS" },
    { id: "TX-9902", name: "Budi Santoso", plan: "PRO 3 Bulan", amount: 129000, date: "2026-05-25T14:30:00Z", status: "SUCCESS" },
    { id: "TX-9903", name: "Clara Angelica", plan: "PRO Bulanan", amount: 49000, date: "2026-05-26T09:12:00Z", status: "SUCCESS" },
    { id: "TX-9904", name: "Heri Setiawan", plan: "PRO Bulanan", amount: 49000, date: "2026-05-26T11:45:00Z", status: "PENDING" }
  ]);

  // Bug reports and activity feeds
  const [activityFeed, setActivityFeed] = useState([
    { id: 1, type: "REGISTER", text: "Ahmad Rivaldi mendaftar akun baru", time: "5 menit yang lalu" },
    { id: 2, type: "TRYOUT_COMPLETE", text: "Sarah Azzahra menyelesaikan Tryout Akbar #1 (Skor: 672)", time: "12 menit yang lalu" },
    { id: 3, type: "BUG", text: "Laporan Bug: Tombol submit error di iOS (User: Budi)", time: "1 jam yang lalu" },
    { id: 4, type: "CREATE_TO", text: "Admin membuat draft Tryout Kuantitatif baru", time: "2 jam yang lalu" }
  ]);

  // --- INITIALIZERS & LOADER ---
  useEffect(() => {
    loadAllAdminData();
  }, []);

  const triggerToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const uData = await apiService.fetchRegisteredUsers();
      // Ensure role is mapped correctly for safety
      const mappedUsers = uData.map(usr => ({
        ...usr,
        role: usr.role || "SISWA",
        premium: usr.email?.includes("premium") || usr.id?.includes("2") || usr.id?.includes("3"),
        status: usr.suspended ? "SUSPENDED" : "ACTIVE",
        streak: usr.id === "usr-1" ? 12 : usr.id === "usr-2" ? 5 : 0
      }));
      setUsers(mappedUsers);

      const sData = await apiService.getQuestions();
      setSoalList(sData);

      const mData = await apiService.fetchMaterials();
      setMateriList(mData);

      const tData = await apiService.getTryouts();
      setTryouts(tData);

      const pData = await apiService.getPTNList();
      setPtnList(pData);

      const jData = await apiService.getAllJurusan();
      setJurusanList(jData);

      const pPosts = apiService.getSavedPosts();
      setPosts(pPosts);

    } catch (e) {
      console.error("Gagal memuat data admin:", e);
      triggerToast("Beberapa data gagal disinkronkan dari server backend", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD ACTIONS ---

  // 1. Users
  const handleUpdateRole = async (userId, newRole) => {
    try {
      await apiService.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      triggerToast(`Berhasil mengubah role user menjadi ${newRole}`);
    } catch (e) {
      triggerToast("Gagal memperbarui role", "error");
    }
  };

  const handleToggleSuspend = async (userId, currentStatus) => {
    const isSuspending = currentStatus !== "SUSPENDED";
    try {
      await apiService.suspendUser(userId, isSuspending);
      setUsers(users.map(u => u.id === userId ? { ...u, status: isSuspending ? "SUSPENDED" : "ACTIVE" } : u));
      triggerToast(isSuspending ? "Akun berhasil ditangguhkan" : "Akun berhasil diaktifkan kembali");
    } catch (e) {
      triggerToast("Gagal mengubah status akun", "error");
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      await apiService.resetUserPassword(userId, "123456");
      triggerToast("Password berhasil direset ke default: 123456");
    } catch (e) {
      triggerToast("Gagal reset password", "error");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus user ini secara permanen?")) return;
    try {
      await apiService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      triggerToast("User berhasil dihapus");
    } catch (e) {
      triggerToast("Gagal menghapus user", "error");
    }
  };

  // 2. Tryouts
  const handleSaveTryout = async (e) => {
    e.preventDefault();
    try {
      if (editingTryout) {
        // Edit tryout - try Railway first
        try {
          await apiService.updateTryoutStatus(editingTryout.id, tryoutForm.status);
          setTryouts(tryouts.map(t => t.id === editingTryout.id ? { ...t, ...tryoutForm } : t));
          triggerToast("Tryout berhasil diperbarui di Railway");
        } catch (railwayErr) {
          // Fallback to local
          setTryouts(tryouts.map(t => t.id === editingTryout.id ? { ...t, ...tryoutForm } : t));
          triggerToast("Tryout diperbarui (mode offline)");
        }
      } else {
        // Create new tryout - try Railway first
        const payload = {
          judul: tryoutForm.judul,
          kategori: tryoutForm.kategori,
          durasiMenit: tryoutForm.durasiMenit,
          totalSoal: tryoutForm.totalSoal,
          status: tryoutForm.status || "DRAFT",
          jadwalMulai: tryoutForm.jadwalMulai || null,
          jadwalSelesai: tryoutForm.jadwalSelesai || null
        };

        try {
          const created = await apiService.createTryout(payload);
          setTryouts([created, ...tryouts]);
          triggerToast("Tryout baru berhasil dibuat di Railway! Status: DRAFT");
        } catch (railwayErr) {
          console.warn("Railway gagal, simpan lokal:", railwayErr);
          // Fallback to local
          const localPayload = {
            ...payload,
            id: "to-local-" + Math.random().toString(36).substr(2, 9)
          };
          setTryouts([localPayload, ...tryouts]);
          triggerToast("Tryout dibuat (mode offline) - Sync ke Railway saat online");
        }
      }
      setShowTryoutModal(false);
      setEditingTryout(null);
      setTryoutForm({ judul: "", kategori: "TPS & LITERASI", status: "DRAFT", durasiMenit: 195, totalSoal: 155, jadwalMulai: "", jadwalSelesai: "" });
    } catch (err) {
      console.error("Error saving tryout:", err);
      triggerToast("Gagal memproses tryout: " + err.message, "error");
    }
  };

  const handleTogglePublishTryout = async (toId, currentStatus) => {
    const nextStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await apiService.updateTryoutStatus(toId, nextStatus);
      setTryouts(tryouts.map(t => t.id === toId ? { ...t, status: nextStatus } : t));
      triggerToast(`Status tryout diubah menjadi ${nextStatus}`);
    } catch (e) {
      triggerToast("Gagal memperbarui status tryout", "error");
    }
  };

  const handleDeleteTryout = async (toId) => {
    if (!confirm("Hapus tryout ini?")) return;
    try {
      await apiService.deleteTryout(toId);
      setTryouts(tryouts.filter(t => t.id !== toId));
      triggerToast("Tryout berhasil dihapus");
    } catch (e) {
      triggerToast("Gagal menghapus tryout", "error");
    }
  };

  // 3. Bank Soal
  const handleSaveSoal = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...soalForm,
        id: editingSoal ? editingSoal.id : "s-custom-" + Math.random().toString(36).substr(2, 9)
      };

      if (editingSoal) {
        await apiService.updateQuestion(editingSoal.id, payload);
        setSoalList(soalList.map(s => s.id === editingSoal.id ? payload : s));
        triggerToast("Soal berhasil diperbarui");
      } else {
        await apiService.createQuestion(payload);
        setSoalList([payload, ...soalList]);
        triggerToast("Soal berhasil ditambahkan ke Bank Soal");
      }
      setShowSoalModal(false);
      setEditingSoal(null);
      setSoalForm({ pertanyaan: "", mapel: "TPS", subtest: "Penalaran Umum", tingkat: "sedang", jawaban: "A", pembahasan: "", opsi: ["", "", "", "", ""] });
    } catch (err) {
      triggerToast("Gagal menyimpan soal", "error");
    }
  };

  const handleDeleteSoal = async (soalId) => {
    if (!confirm("Hapus soal ini dari Bank Soal?")) return;
    try {
      await apiService.deleteQuestion(soalId);
      setSoalList(soalList.filter(s => s.id !== soalId));
      triggerToast("Soal berhasil dihapus");
    } catch (e) {
      triggerToast("Gagal menghapus soal", "error");
    }
  };

  // Import Soal Simulator (Excel/CSV/JSON upload support)
  const handleImportSoal = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        let imported = [];
        if (file.name.endsWith(".json")) {
          imported = JSON.parse(evt.target.result);
        } else {
          // Simulator CSV
          const text = evt.target.result;
          const rows = text.split("\n").slice(1);
          imported = rows.map((row, idx) => {
            const cols = row.split(",");
            if (cols.length < 5) return null;
            return {
              id: `s-import-${idx}-${Date.now()}`,
              pertanyaan: cols[0]?.replace(/"/g, "") || "Soal Impor",
              mapel: cols[1]?.replace(/"/g, "") || "TPS",
              subtest: cols[2]?.replace(/"/g, "") || "Penalaran Kuantitatif",
              tingkat: cols[3]?.replace(/"/g, "") || "sedang",
              jawaban: cols[4]?.replace(/"/g, "").trim() || "A",
              pembahasan: cols[5]?.replace(/"/g, "") || "Cukup jelas.",
              opsi: [cols[6] || "A", cols[7] || "B", cols[8] || "C", cols[9] || "D", cols[10] || "E"]
            };
          }).filter(Boolean);
        }

        if (imported.length > 0) {
          for (const s of imported) {
            await apiService.createQuestion(s);
          }
          setSoalList([...imported, ...soalList]);
          triggerToast(`Berhasil mengimpor ${imported.length} soal ke platform!`);
        } else {
          triggerToast("Format file tidak valid atau kosong", "error");
        }
      } catch (err) {
        triggerToast("Gagal mengurai file impor", "error");
      }
    };
    reader.readAsText(file);
  };

  // 4. PTN & Jurusan
  const handleSavePtn = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...ptnForm,
        id: editingPtn ? editingPtn.id : "ptn-" + Math.random().toString(36).substr(2, 9)
      };
      if (editingPtn) {
        await apiService.updatePTN(editingPtn.id, payload);
        setPtnList(ptnList.map(p => p.id === editingPtn.id ? { ...p, ...payload } : p));
        triggerToast("PTN berhasil diperbarui");
      } else {
        await apiService.createPTN(payload);
        setPtnList([...ptnList, payload]);
        triggerToast("PTN baru berhasil ditambahkan");
      }
      setShowPtnModal(false);
      setEditingPtn(null);
      setPtnForm({ nama: "", akreditasi: "A", lokasi: "" });
    } catch (e) {
      triggerToast("Gagal memproses PTN", "error");
    }
  };

  const handleSaveJurusan = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...jurusanForm,
        id: editingJurusan ? editingJurusan.id : "jur-" + Math.random().toString(36).substr(2, 9)
      };
      if (editingJurusan) {
        await apiService.updateJurusan(editingJurusan.id, payload);
        setJurusanList(jurusanList.map(j => j.id === editingJurusan.id ? { ...j, ...payload } : j));
        triggerToast("Jurusan berhasil diperbarui");
      } else {
        await apiService.createJurusan(payload);
        setJurusanList([...jurusanList, payload]);
        triggerToast("Jurusan baru berhasil ditambahkan");
      }
      setShowJurusanModal(false);
      setEditingJurusan(null);
      setJurusanForm({ nama: "", passingGrade: 60, dayaTampung: 50, peminat: 1200, kelompok: "SAINTEK", ptnId: "" });
    } catch (e) {
      triggerToast("Gagal memproses jurusan", "error");
    }
  };

  // 5. Materi
  const handleSaveMateri = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...materiForm,
        id: editingMateri ? editingMateri.id : "m-custom-" + Math.random().toString(36).substr(2, 9)
      };
      if (editingMateri) {
        await apiService.updateMaterial(editingMateri.id, payload);
        setMateriList(materiList.map(m => m.id === editingMateri.id ? payload : m));
        triggerToast("Materi belajar berhasil diperbarui");
      } else {
        await apiService.createMaterial(payload);
        setMateriList([...materiList, payload]);
        triggerToast("Materi baru berhasil diunggah");
      }
      setShowMateriModal(false);
      setEditingMateri(null);
      setMateriForm({ judul: "", kategori: "TPS", subtest: "Penalaran Umum", konten: "", estimasiMembaca: 10, poinReward: 100, videoUrl: "", pdfUrl: "", thumbnailUrl: "" });
    } catch (e) {
      triggerToast("Gagal memproses materi", "error");
    }
  };

  const handleDeleteMateri = async (materiId) => {
    if (!confirm("Hapus materi ini?")) return;
    try {
      await apiService.deleteMaterial(materiId);
      setMateriList(materiList.filter(m => m.id !== materiId));
      triggerToast("Materi berhasil dihapus");
    } catch (e) {
      triggerToast("Gagal menghapus materi", "error");
    }
  };

  // 6. Community Moderation
  const handleDeletePost = (postId) => {
    if (!confirm("Hapus postingan forum yang melanggar ketentuan ini?")) return;
    const updated = posts.filter(p => p.id !== postId);
    setPosts(updated);
    apiService.savePosts(updated);
    triggerToast("Postingan forum berhasil dihapus");
  };

  const handlePinPost = (postId) => {
    const updated = posts.map(p => p.id === postId ? { ...p, pinned: !p.pinned } : p);
    setPosts(updated);
    apiService.savePosts(updated);
    triggerToast("Status pin diskusi diperbarui");
  };

  // 7. Gamification Customizer
  const handleCreateBadge = (e) => {
    e.preventDefault();
    if (!newBadge.title || !newBadge.desc) return;
    const badge = { ...newBadge, id: "badge-" + Date.now() };
    setBadges([...badges, badge]);
    setNewBadge({ title: "", icon: "Award", xp: 100, desc: "" });
    triggerToast("Lencana gamifikasi baru berhasil diterbitkan!");
  };

  // 8. Notifications
  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!notifForm.title || !notifForm.message) return;
    triggerToast(`Pengumuman massal (${notifForm.type}) berhasil dipancarkan ke seluruh user!`);
    setNotifForm({ title: "", message: "", target: "ALL", type: "PUSH" });
  };

  // 9. Settings Save
  const handleSaveSettings = (e) => {
    e.preventDefault();
    triggerToast("Konfigurasi sistem berhasil diperbarui dan diterapkan!");
  };

  // --- STATS COMPILATION FOR OVERVIEW ---
  const activeSiswa = users.filter(u => u.role === "SISWA");
  const premiumSiswa = users.filter(u => u.premium);
  const totalRevenue = payments.filter(p => p.status === "SUCCESS").reduce((sum, curr) => sum + curr.amount, 0);

  // Analytical Mock Data
  const userGrowthData = [
    { month: "Jan", users: 12, active: 8 },
    { month: "Feb", users: 24, active: 18 },
    { month: "Mar", users: 50, active: 39 },
    { month: "Apr", users: 95, active: 71 },
    { month: "Mei", users: users.length || 180, active: Math.floor((users.length || 180) * 0.75) }
  ];

  const activityData = [
    { day: "Sen", tryout: 8, latihan: 35, materi: 18 },
    { day: "Sel", tryout: 14, latihan: 42, materi: 25 },
    { day: "Rab", tryout: 11, latihan: 38, materi: 22 },
    { day: "Kam", tryout: 19, latihan: 51, materi: 30 },
    { day: "Jum", tryout: 16, latihan: 48, materi: 27 },
    { day: "Sab", tryout: 25, latihan: 65, materi: 42 },
    { day: "Min", tryout: 10, latihan: 28, materi: 15 }
  ];

  const mapelDifficultyData = [
    { name: "Pengetahuan Kuantitatif", avgScore: 480, difficulty: "82%" },
    { name: "Penalaran Matematika", avgScore: 505, difficulty: "75%" },
    { name: "Literasi Bahasa Inggris", avgScore: 510, difficulty: "70%" },
    { name: "Pemahaman Bacaan", avgScore: 540, difficulty: "60%" },
    { name: "Penalaran Umum", avgScore: 575, difficulty: "50%" }
  ];

  const scorePerformanceRanges = [
    { range: "0-400", count: Math.ceil(users.length * 0.1) || 2 },
    { range: "401-500", count: Math.ceil(users.length * 0.25) || 5 },
    { range: "501-600", count: Math.ceil(users.length * 0.4) || 12 },
    { range: "601-700", count: Math.ceil(users.length * 0.18) || 4 },
    { range: "701-1000", count: Math.ceil(users.length * 0.07) || 1 }
  ];

  const mapelChartData = [
    { name: "TPS", value: soalList.filter(s => s.mapel === "TPS").length || 10, color: "#14b8a6" },
    { name: "Literasi", value: soalList.filter(s => s.mapel === "LITERASI").length || 8, color: "#3b82f6" },
    { name: "TKA Saintek", value: soalList.filter(s => s.mapel?.includes("Saintek") || s.mapel === "SAINTEK").length || 5, color: "#8b5cf6" },
    { name: "TKA Soshum", value: soalList.filter(s => s.mapel?.includes("Soshum") || s.mapel === "SOSHUM").length || 5, color: "#f59e0b" }
  ];

  // Menu Sidebar list
  const adminMenuItems = [
    { id: "overview", label: "Overview Dashboard", icon: <BarChart3 className="h-4.5 w-4.5" />, desc: "Statistik utama & metrik platform" },
    { id: "users", label: "Manajemen User", icon: <Users className="h-4.5 w-4.5 text-teal-500" />, desc: "Daftar siswa, detail, & tindakan admin" },
    { id: "tryouts", label: "Manajemen Tryout", icon: <Play className="h-4.5 w-4.5 text-amber-500 animate-pulse" />, desc: "CRUD tryout, jadwal, & monitoring" },
    { id: "soal", label: "Bank Soal", icon: <FileQuestion className="h-4.5 w-4.5 text-blue-500" />, desc: "CRUD bank soal, impor, & subtes" },
    { id: "analytics", label: "Analitik Platform", icon: <TrendingUp className="h-4.5 w-4.5 text-purple-500" />, desc: "Analisis mendalam soal & completion rate" },
    { id: "ptn", label: "PTN & Jurusan", icon: <GraduationCap className="h-4.5 w-4.5 text-emerald-500" />, desc: "Kelola PTN, passing grade, & AI threshold" },
    { id: "materi", label: "Materi Belajar", icon: <BookOpen className="h-4.5 w-4.5 text-indigo-500" />, desc: "Video URL, PDF, & tracking bacaan" },
    { id: "community", label: "Moderasi Komunitas", icon: <MessageSquare className="h-4.5 w-4.5 text-pink-500" />, desc: "Hapus posting toxic & ban user" },
    { id: "gamification", label: "Gamifikasi", icon: <Award className="h-4.5 w-4.5 text-orange-500" />, desc: "XP, badge custom, & reward streak" },
    { id: "ai_consultation", label: "AI Consultation", icon: <Sparkles className="h-4.5 w-4.5 text-cyan-500" />, desc: "Log prompt & kuota token AI Gemini" },
    { id: "payments", label: "Payments & Premium", icon: <DollarSign className="h-4.5 w-4.5 text-yellow-500" />, desc: "Statistik pendapatan & transaksi" },
    { id: "notifications", label: "Sistem Notifikasi", icon: <Bell className="h-4.5 w-4.5 text-rose-500" />, desc: "Broadcast push notif & email massal" },
    { id: "settings", label: "Platform Settings", icon: <Settings className="h-4.5 w-4.5 text-zinc-500" />, desc: "Maintenance mode & API Keys config" }
  ];

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-gray-500 dark:text-zinc-400">
        <RefreshCw className="h-10 w-10 animate-spin text-teal-600" />
        <p className="text-sm font-bold animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Toast HUD */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-gray-900 border border-zinc-800 text-white p-4 shadow-2xl backdrop-blur-md animate-slide-in-right">
          {toast.type === "success" ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <AlertCircle className="h-5 w-5 text-rose-500" />}
          <p className="text-xs font-semibold">{toast.message}</p>
        </div>
      )}

      {/* Main Admin Header Banner */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-6 dark:border-amber-500/10 backdrop-blur-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-amber-500/20 p-3 text-amber-500 shadow-lg shadow-amber-500/10 animate-pulse">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-gray-950 dark:text-white font-display">
                  EduPTN Admin Dashboard
                </h1>
                <span className="rounded-md bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-500 dark:bg-teal-950/20 uppercase tracking-widest font-mono">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-zinc-400">
                Pusat Kontrol Sistem EduPTN. Mengendalikan data Railway, database, & metrik siswa secara real-time.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadAllAdminData}
              className="inline-flex items-center gap-2 rounded-xl bg-white/50 border border-gray-200/80 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100/80 transition-all dark:bg-zinc-900/40 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Sync DB
            </button>
          </div>
        </div>
      </div>

      {/* Grid Dashboard Control Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left SaaS Sidebar Menu Navigation */}
        <div className="lg:col-span-1 flex flex-col gap-1.5 p-3 rounded-2xl border border-gray-200/80 bg-white/80 dark:border-zinc-850 dark:bg-[#0E1320] h-fit">
          <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest px-3 mb-2 font-mono">Navigasi Admin</p>
          {adminMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSearchQuery("");
              }}
              className={`flex items-center gap-3 rounded-xl py-2.5 px-3 text-left transition-all cursor-pointer ${activeTab === item.id ?
                "bg-teal-50 text-teal-700 dark:bg-teal-950/20 dark:text-teal-400 font-bold border border-teal-500/10" :
                "text-gray-600 hover:bg-gray-50 hover:text-teal-600 dark:text-zinc-400 dark:hover:bg-zinc-800/45 dark:hover:text-teal-400"
                }`}
              title={item.desc}
            >
              {item.icon}
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate">{item.label}</p>
              </div>
              <ChevronRight className={`h-3 w-3 opacity-30 transition-transform ${activeTab === item.id ? "translate-x-0.5 opacity-80" : ""}`} />
            </button>
          ))}
        </div>

        {/* Right Dashboard Workspace Panel */}
        <div className="lg:col-span-3 space-y-6">

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in-up">

              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase font-mono">Siswa Terdaftar</span>
                    <Users className="h-4 w-4 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-0.5">{users.length}</h3>
                  <p className="text-[10px] text-emerald-500 font-bold">100% dari DB Railway</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase font-mono">User Aktif Hari Ini</span>
                    <Flame className="h-4 w-4 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-0.5">{Math.floor(users.length * 0.75)}</h3>
                  <p className="text-[10px] text-gray-400">75% aktivitas harian</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase font-mono">Total Tryout</span>
                    <Play className="h-4 w-4 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-0.5">{tryouts.length}</h3>
                  <p className="text-[10px] text-teal-500 font-bold">{tryouts.filter(t => t.status === "PUBLISHED").length} Aktif</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase font-mono">Total Bank Soal</span>
                    <FileQuestion className="h-4 w-4 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-0.5">{soalList.length}</h3>
                  <p className="text-[10px] text-blue-500 font-bold">Tersebar di subtes</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase font-mono">Selesai Tryout</span>
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-0.5">85</h3>
                  <p className="text-[10px] text-emerald-500 font-bold">92% completion rate</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase font-mono">Rata-rata Nasional</span>
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-0.5">542.5</h3>
                  <p className="text-[10px] text-purple-400">Target kelolosan: 650</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase font-mono">User Premium</span>
                    <Zap className="h-4 w-4 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-0.5">{premiumSiswa.length}</h3>
                  <p className="text-[10px] text-yellow-500 font-bold">{Math.round((premiumSiswa.length / (users.length || 1)) * 100)}% Rasio Premium</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase font-mono">Total Pendapatan</span>
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-0.5">Rp {(totalRevenue / 1000).toLocaleString('id-ID')}K</h3>
                  <p className="text-[10px] text-emerald-500 font-bold">100% terverifikasi</p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* User Growth */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="text-xs font-bold text-gray-450 uppercase mb-4 tracking-wider font-mono flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-teal-500" /> Grafik Pertumbuhan Siswa
                  </h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                      <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="users" stroke="#14b8a6" strokeWidth={2.5} name="Total Siswa" dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} name="Siswa Aktif" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Activity Trends */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="text-xs font-bold text-gray-450 uppercase mb-4 tracking-wider font-mono flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" /> Aktivitas Tryout & Latihan Mingguan
                  </h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                      <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="tryout" stackId="1" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.4} name="Tryout" />
                      <Area type="monotone" dataKey="latihan" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Latihan" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Hardest Subtests */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="text-xs font-bold text-gray-450 uppercase mb-4 tracking-wider font-mono flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" /> Subtes Paling Sulit (Avg Skor Nasional)
                  </h3>
                  <div className="space-y-3.5">
                    {mapelDifficultyData.map((m, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-gray-700 dark:text-zinc-300">{m.name}</span>
                          <span className="font-bold text-red-500">{m.avgScore} pts ({m.difficulty})</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-zinc-800">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-red-500 to-amber-500"
                            style={{ width: `${(m.avgScore / 800) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Student Score Distribution */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="text-xs font-bold text-gray-450 uppercase mb-4 tracking-wider font-mono flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-500" /> Distribusi Skor Siswa (Kurva Performa)
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={scorePerformanceRanges}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                      <XAxis dataKey="range" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Jumlah Siswa" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Activity Feed & Bug Logs */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-xs font-bold text-gray-450 uppercase mb-4 tracking-wider font-mono flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-teal-500" /> Live Platform Activity Feed
                </h3>
                <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {activityFeed.map((feed) => (
                    <div key={feed.id} className="flex justify-between items-center py-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${feed.type === "REGISTER" ? "bg-teal-500" :
                          feed.type === "TRYOUT_COMPLETE" ? "bg-emerald-500 animate-pulse" :
                            feed.type === "BUG" ? "bg-red-500" : "bg-zinc-500"
                          }`} />
                        <span className="text-gray-800 dark:text-zinc-200 font-semibold">{feed.text}</span>
                      </div>
                      <span className="text-gray-400 dark:text-zinc-500 font-mono text-[10px]">{feed.time}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MANAJEMEN USER */}
          {activeTab === "users" && (
            <div className="space-y-4 animate-fade-in-up">

              {/* Search & Filters */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex items-center gap-3 w-full border-b md:border-b-0 pb-2 md:pb-0 border-gray-100 dark:border-zinc-800">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari user berdasarkan nama, email, target kampus..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  >
                    <option value="ALL">Semua Role</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SISWA">SISWA</option>
                  </select>

                  <select
                    value={premiumFilter}
                    onChange={(e) => setPremiumFilter(e.target.value)}
                    className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  >
                    <option value="ALL">Semua Tipe Akun</option>
                    <option value="PREMIUM">PREMIUM ONLY</option>
                    <option value="FREE">FREE ONLY</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50">
                      <tr className="text-gray-500 dark:text-zinc-400 uppercase text-[10px] tracking-wider font-mono">
                        <th className="px-6 py-3 text-left">User</th>
                        <th className="px-6 py-3 text-left">Email</th>
                        <th className="px-6 py-3 text-left">Role & Tipe</th>
                        <th className="px-6 py-3 text-left">Status</th>
                        <th className="px-6 py-3 text-right">Tindakan Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 dark:divide-zinc-800/60">
                      {users
                        .filter(u => {
                          const matchesQuery = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (u.pilihanKampus && u.pilihanKampus.toLowerCase().includes(searchQuery.toLowerCase()));
                          const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
                          const matchesPremium = premiumFilter === "ALL" || (premiumFilter === "PREMIUM" && u.premium) || (premiumFilter === "FREE" && !u.premium);
                          const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;
                          return matchesQuery && matchesRole && matchesPremium && matchesStatus;
                        })
                        .map((u) => (
                          <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-zinc-850/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => { setSelectedUser(u); setShowUserModal(true); }}
                                  className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-950/30 flex items-center justify-center text-xs font-bold text-teal-700 dark:text-teal-400 hover:scale-105 transition-transform"
                                >
                                  {u.name.charAt(0).toUpperCase()}
                                </button>
                                <div>
                                  <button
                                    onClick={() => { setSelectedUser(u); setShowUserModal(true); }}
                                    className="font-bold text-gray-900 dark:text-white hover:text-teal-500 hover:underline text-left block"
                                  >
                                    {u.name}
                                  </button>
                                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">Target: {u.pilihanKampus || "Belum diset"}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-650 dark:text-zinc-400 font-mono">{u.email}</td>
                            <td className="px-6 py-4 space-x-1">
                              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-bold ${u.role === "ADMIN" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400" : "bg-teal-50 text-teal-750 dark:bg-teal-950/15 dark:text-teal-400"
                                }`}>
                                {u.role === "ADMIN" ? <ShieldCheck className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                                {u.role}
                              </span>

                              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-bold ${u.premium ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                }`}>
                                <Zap className="h-3 w-3" />
                                {u.premium ? "PREMIUM" : "FREE"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold ${u.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/15 dark:text-emerald-400" : "bg-rose-50 text-rose-700 dark:bg-rose-950/15 dark:text-rose-400"
                                }`}>
                                {u.status === "ACTIVE" ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                                {u.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-1">
                              <button
                                onClick={() => handleUpdateRole(u.id, u.role === "ADMIN" ? "SISWA" : "ADMIN")}
                                className="rounded-lg bg-gray-50 border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 px-2.5 py-1 text-[10px] font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 cursor-pointer"
                                title="Ubah Role"
                              >
                                Role Toggle
                              </button>
                              <button
                                onClick={() => handleToggleSuspend(u.id, u.status)}
                                className={`rounded-lg px-2.5 py-1 text-[10px] font-bold cursor-pointer ${u.status === "ACTIVE" ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                                  }`}
                              >
                                {u.status === "ACTIVE" ? "Suspend" : "Unsuspend"}
                              </button>
                              <button
                                onClick={() => handleResetPassword(u.id)}
                                className="rounded-lg bg-gray-50 border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 px-2.5 py-1 text-[10px] font-bold text-zinc-550 hover:bg-gray-100 cursor-pointer"
                              >
                                Reset Pass
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/10 dark:text-rose-400 p-1 cursor-pointer inline-flex items-center justify-center align-middle"
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* User detail modal */}
              {showUserModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                  <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-800">
                    <div className="flex justify-between items-start mb-4 border-b border-gray-150 dark:border-zinc-800 pb-3">
                      <div>
                        <h3 className="text-base font-extrabold text-gray-900 dark:text-white">{selectedUser.name}</h3>
                        <p className="text-xs text-gray-400 dark:text-zinc-500 font-mono">{selectedUser.email}</p>
                      </div>
                      <button
                        onClick={() => { setSelectedUser(null); setShowUserModal(false); }}
                        className="text-gray-450 hover:text-gray-900 dark:hover:text-white text-base font-bold"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl bg-gray-50 dark:bg-zinc-850 p-3">
                          <p className="text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Pilihan PTN Target</p>
                          <p className="font-bold text-gray-800 dark:text-zinc-200">{selectedUser.pilihanKampus || "Belum Memilih"}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 dark:bg-zinc-850 p-3">
                          <p className="text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Streak Belajar</p>
                          <p className="font-bold text-orange-500 flex items-center gap-1"><Flame className="h-4 w-4" /> {selectedUser.streak || 0} Hari</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 dark:bg-zinc-850 p-3">
                          <p className="text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Akun Dibuat</p>
                          <p className="font-bold text-gray-800 dark:text-zinc-200">{new Date(selectedUser.createdAt || Date.now()).toLocaleDateString("id-ID")}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 dark:bg-zinc-850 p-3">
                          <p className="text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Sesi Tryout Diikuti</p>
                          <p className="font-bold text-teal-600">{selectedUser.id === "usr-1" ? 2 : selectedUser.id === "usr-2" ? 1 : 0} Sesi</p>
                        </div>
                      </div>

                      <div className="rounded-xl bg-gray-50 dark:bg-zinc-850 p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase font-mono mb-2">Riwayat Skor Tryout (IRT)</p>
                        {selectedUser.id === "usr-1" ? (
                          <div className="space-y-1">
                            <div className="flex justify-between font-mono">
                              <span>Tryout Akbar Jilid I:</span>
                              <span className="font-bold text-teal-500">630 pts</span>
                            </div>
                            <div className="flex justify-between font-mono">
                              <span>Simulasi Kuantitatif:</span>
                              <span className="font-bold text-teal-500">690 pts</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-400 font-medium italic">Belum ada riwayat pengerjaan tryout.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: MANAJEMEN TRYOUT */}
          {activeTab === "tryouts" && (
            <div className="space-y-4 animate-fade-in-up">

              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
                <p className="text-xs text-gray-500 dark:text-zinc-400">Total Tryout: <strong>{tryouts.length}</strong> (Ongoing & Draft)</p>
                <button
                  onClick={() => { setEditingTryout(null); setTryoutForm({ judul: "", kategori: "TPS & LITERASI", status: "DRAFT", durasiMenit: 195, totalSoal: 155, jadwalMulai: "", jadwalSelesai: "" }); setShowTryoutModal(true); }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4.5 py-2 text-xs font-bold text-white hover:bg-teal-500 cursor-pointer shadow-md"
                >
                  <PlusCircle className="h-4 w-4" /> Tambah Tryout
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {tryouts.map((to) => (
                  <div key={to.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-850 dark:bg-zinc-900">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="rounded-lg bg-teal-50 dark:bg-teal-950/25 px-3 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase font-mono">{to.kategori}</span>
                          <span className={`rounded-lg px-3 py-0.5 text-[10px] font-bold uppercase font-mono ${to.status === "PUBLISHED" || to.status === "ONGOING" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                            }`}>{to.status}</span>
                        </div>
                        <h4 className="text-sm font-black text-gray-900 dark:text-white mb-2">{to.judul}</h4>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500 dark:text-zinc-400 mt-4">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-teal-500" />
                            <span>Durasi: <strong>{to.durasiMenit} Menit</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span>Soal: <strong>{to.totalSoal} butir</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-purple-500" />
                            <span>Peserta: <strong>{to.id === "to-1" ? 142 : to.id === "to-2" ? 85 : 0} siswa</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                            <span>Avg Skor: <strong>{to.id === "to-1" ? 582 : to.id === "to-2" ? 610 : 0}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleTogglePublishTryout(to.id, to.status)}
                          className={`rounded-lg text-[10px] font-bold px-3 py-1.5 cursor-pointer ${to.status === "PUBLISHED" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                            }`}
                        >
                          {to.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => { setEditingTryout(to); setTryoutForm(to); setShowTryoutModal(true); }}
                          className="rounded-lg border border-gray-200 dark:border-zinc-800 p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/20 cursor-pointer text-xs font-bold inline-flex items-center justify-center gap-1"
                        >
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTryout(to.id)}
                          className="rounded-lg border border-red-200 dark:border-red-900/30 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15 cursor-pointer text-xs font-bold inline-flex items-center justify-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" /> Hapus
                        </button>
                      </div>
                    </div>

                    {/* Leaderboard preview */}
                    {(to.id === "to-1" || to.id === "to-2") && (
                      <div className="mt-5 border-t border-gray-100 dark:border-zinc-800/80 pt-4">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest font-mono mb-2">Leaderboard Teratas ({to.judul})</p>
                        <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-650 dark:text-zinc-400 font-mono">
                          <div>1. Sarah Azzahra <span className="text-teal-500 font-bold">(720)</span></div>
                          <div>2. Ahmad Rivaldi <span className="text-teal-500 font-bold">(690)</span></div>
                          <div>3. Clara Angelica <span className="text-teal-500 font-bold">(665)</span></div>
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>

              {/* Tryout Form Modal */}
              {showTryoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                  <form onSubmit={handleSaveTryout} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-800 space-y-4">
                    <div className="flex justify-between items-start border-b border-gray-150 dark:border-zinc-800 pb-3">
                      <h3 className="text-base font-extrabold text-gray-900 dark:text-white">{editingTryout ? "Edit Tryout" : "Buat Tryout Baru"}</h3>
                      <button type="button" onClick={() => setShowTryoutModal(false)} className="text-gray-450 text-base font-bold">×</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="font-bold text-gray-700 dark:text-zinc-300">Judul Tryout</label>
                        <input
                          type="text" required
                          value={tryoutForm.judul}
                          onChange={(e) => setTryoutForm({ ...tryoutForm, judul: e.target.value })}
                          className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                          placeholder="Contoh: Tryout Nasional 2026 Jilid 3"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-700 dark:text-zinc-300">Kategori Subtes</label>
                        <select
                          value={tryoutForm.kategori}
                          onChange={(e) => setTryoutForm({ ...tryoutForm, kategori: e.target.value })}
                          className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                        >
                          <option value="TPS & LITERASI">TPS & LITERASI (Komplit)</option>
                          <option value="Kuantitatif">Kuantitatif Only</option>
                          <option value="TKA SANTEK">TKA Saintek</option>
                          <option value="TKA SOSHUM">TKA Soshum</option>
                        </select>
                      </div>

                      {/* Ganti satu input durasiMenit menjadi dua field */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-700 dark:text-zinc-300">Durasi TPS (Menit)</label>
                        <input
                          type="number" required min="1"
                          value={tryoutForm.durasiTPS || 90}
                          onChange={(e) => setTryoutForm({ ...tryoutForm, durasiTPS: parseInt(e.target.value), durasiMenit: (parseInt(e.target.value) || 0) + (tryoutForm.durasiTKA || 90) })}
                          className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-700 dark:text-zinc-300">Durasi TKA (Menit)</label>
                        <input
                          type="number" required min="1"
                          value={tryoutForm.durasiTKA || 90}
                          onChange={(e) => setTryoutForm({ ...tryoutForm, durasiTKA: parseInt(e.target.value), durasiMenit: (tryoutForm.durasiTPS || 90) + (parseInt(e.target.value) || 0) })}
                          className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-700 dark:text-zinc-300">Jumlah Soal</label>
                        <input
                          type="number" required
                          value={tryoutForm.totalSoal}
                          onChange={(e) => setTryoutForm({ ...tryoutForm, totalSoal: parseInt(e.target.value) })}
                          className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-700 dark:text-zinc-300">Status</label>
                        <select
                          value={tryoutForm.status}
                          onChange={(e) => setTryoutForm({ ...tryoutForm, status: e.target.value })}
                          className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                        >
                          <option value="DRAFT">DRAFT</option>
                          <option value="PUBLISHED">PUBLISHED</option>
                          <option value="ONGOING">ONGOING</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-700 dark:text-zinc-300">Jadwal Mulai</label>
                        <input
                          type="datetime-local"
                          value={tryoutForm.jadwalMulai}
                          onChange={(e) => setTryoutForm({ ...tryoutForm, jadwalMulai: e.target.value })}
                          className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-700 dark:text-zinc-300">Jadwal Selesai</label>
                        <input
                          type="datetime-local"
                          value={tryoutForm.jadwalSelesai}
                          onChange={(e) => setTryoutForm({ ...tryoutForm, jadwalSelesai: e.target.value })}
                          className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <button type="button" onClick={() => setShowTryoutModal(false)} className="rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-4 py-2 text-xs font-bold text-gray-700 dark:text-zinc-300">Batal</button>
                      <button type="submit" className="rounded-lg bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-500">Simpan Tryout</button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: BANK SOAL */}
          {activeTab === "soal" && (
            <div className="space-y-4 animate-fade-in-up">

              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex items-center gap-3 w-full border-b md:border-b-0 pb-2 md:pb-0 border-gray-100 dark:border-zinc-800">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari soal berdasarkan potongan pertanyaan atau pembahasan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={mapelFilter}
                    onChange={(e) => setMapelFilter(e.target.value)}
                    className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  >
                    <option value="ALL">Semua Mapel</option>
                    <option value="TPS">TPS</option>
                    <option value="LITERASI">LITERASI</option>
                    <option value="SAINTEK">TKA Saintek</option>
                    <option value="SOSHUM">TKA Soshum</option>
                  </select>

                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  >
                    <option value="ALL">Semua Kesulitan</option>
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang</option>
                    <option value="sulit">Sulit</option>
                  </select>
                </div>
              </div>

              {/* Import Excel/CSV/JSON Button */}
              <div className="flex justify-between items-center bg-teal-600/10 border border-teal-500/20 rounded-xl p-4 dark:bg-teal-950/20">
                <div className="text-xs">
                  <p className="font-bold text-teal-800 dark:text-teal-400">Import Soal Massal</p>
                  <p className="text-gray-550 dark:text-zinc-400">Unggah file dalam format JSON atau CSV (Simulator Excel).</p>
                </div>
                <label className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-500 cursor-pointer transition-all inline-flex items-center gap-1.5 shadow-md">
                  <Download className="h-4.5 w-4.5" />
                  Impor File
                  <input type="file" accept=".csv,.json" onChange={handleImportSoal} className="hidden" />
                </label>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500 dark:text-zinc-400">Ditemukan <strong>{soalList.length}</strong> butir soal</p>
                <button
                  onClick={() => { setEditingSoal(null); setSoalForm({ pertanyaan: "", mapel: "TPS", subtest: "Penalaran Umum", tingkat: "sedang", jawaban: "A", pembahasan: "", opsi: ["", "", "", "", ""] }); setShowSoalModal(true); }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4.5 py-2 text-xs font-bold text-white hover:bg-teal-500 cursor-pointer shadow-md"
                >
                  <PlusCircle className="h-4 w-4" /> Tambah Soal
                </button>
              </div>

              {/* Questions List */}
              <div className="grid grid-cols-1 gap-4">
                {soalList
                  .filter(s => {
                    const matchesQuery = s.pertanyaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (s.pembahasan && s.pembahasan.toLowerCase().includes(searchQuery.toLowerCase()));
                    const matchesMapel = mapelFilter === "ALL" || s.mapel === mapelFilter;
                    const matchesDiff = difficultyFilter === "ALL" || s.tingkat === difficultyFilter;
                    return matchesQuery && matchesMapel && matchesDiff;
                  })
                  .slice(0, 15) // Limit view to prevent browser hang
                  .map((soal) => (
                    <div key={soal.id} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/80">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="rounded-lg bg-teal-50 dark:bg-teal-950/20 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase font-mono">{soal.mapel}</span>
                            <span className="rounded-lg bg-gray-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600 dark:text-zinc-400 font-mono">{soal.subtest}</span>
                            <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold font-mono uppercase ${soal.tingkat === "sulit" ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400" :
                              soal.tingkat === "sedang" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400" :
                                "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                              }`}>{soal.tingkat}</span>
                            <span className="rounded-lg bg-purple-50 dark:bg-purple-950/20 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-400 font-mono">SNBT / HOTS</span>
                          </div>

                          <p className="text-xs font-semibold text-gray-900 dark:text-white mb-3 leading-relaxed">{soal.pertanyaan}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono mb-4 text-gray-650 dark:text-zinc-400">
                            {normalizeOpsi(soal.opsi).map((op, oIdx) => (
                              <div key={oIdx} className={`p-2 rounded-lg border ${String.fromCharCode(65 + oIdx) === soal.jawaban ?
                                "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/10 dark:border-emerald-800" : "border-gray-100 dark:border-zinc-850"
                                }`}>
                                <strong className={String.fromCharCode(65 + oIdx) === soal.jawaban ? "text-emerald-500" : "text-gray-400"}>
                                  {String.fromCharCode(65 + oIdx)}.
                                </strong> {op}
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-gray-100 dark:border-zinc-800/80 pt-3 text-[11px] text-gray-500 dark:text-zinc-500">
                            <p className="font-bold text-gray-600 dark:text-zinc-400 mb-1 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Kunci Jawaban: {soal.jawaban}</p>
                            <p className="italic"><strong>Pembahasan:</strong> {soal.pembahasan || "Belum ada pembahasan tertulis."}</p>
                          </div>
                        </div>

                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => { setEditingSoal(soal); setSoalForm(soal); setShowSoalModal(true); }}
                            className="rounded-lg p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/20 transition-all cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSoal(soal.id)}
                            className="rounded-lg p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Soal CRUD Modal */}
              {showSoalModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
                  <form onSubmit={handleSaveSoal} className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-800 space-y-4 my-8">
                    <div className="flex justify-between items-start border-b border-gray-150 dark:border-zinc-800 pb-3">
                      <h3 className="text-base font-extrabold text-gray-900 dark:text-white">{editingSoal ? "Edit Soal" : "Tambah Soal Baru"}</h3>
                      <button type="button" onClick={() => setShowSoalModal(false)} className="text-gray-455 text-base font-bold">×</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-gray-700 dark:text-zinc-300">Mata Pelajaran (Mapel)</label>
                        <select
                          value={soalForm.mapel}
                          onChange={(e) => setSoalForm({ ...soalForm, mapel: e.target.value })}
                          className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                        >
                          <option value="TPS">TPS</option>
                          <option value="LITERASI">LITERASI</option>
                          <option value="SAINTEK">TKA Saintek</option>
                          <option value="SOSHUM">TKA Soshum</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-gray-700 dark:text-zinc-300">Subtes</label>
                        <input
                          type="text" required
                          value={soalForm.subtest}
                          onChange={(e) => setSoalForm({ ...soalForm, subtest: e.target.value })}
                          className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                          placeholder="Contoh: Penalaran Kuantitatif"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-gray-700 dark:text-zinc-300">Tingkat Kesulitan</label>
                        <select
                          value={soalForm.tingkat}
                          onChange={(e) => setSoalForm({ ...soalForm, tingkat: e.target.value })}
                          className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                        >
                          <option value="mudah">Mudah</option>
                          <option value="sedang">Sedang</option>
                          <option value="sulit">Sulit</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-gray-700 dark:text-zinc-300">Kunci Jawaban Benar</label>
                        <select
                          value={soalForm.jawaban}
                          onChange={(e) => setSoalForm({ ...soalForm, jawaban: e.target.value })}
                          className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="E">E</option>
                        </select>
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="font-bold text-gray-700 dark:text-zinc-300">Pertanyaan Soal</label>
                        <textarea
                          required rows={3}
                          value={soalForm.pertanyaan}
                          onChange={(e) => setSoalForm({ ...soalForm, pertanyaan: e.target.value })}
                          className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                          placeholder="Tuliskan isi pertanyaan di sini..."
                        />
                      </div>

                      {/* Options */}
                      <div className="space-y-1.5 md:col-span-2 border-t border-gray-100 dark:border-zinc-800 pt-3">
                        <p className="font-bold text-gray-750 dark:text-zinc-200 mb-1">Pilihan Jawaban (Opsi)</p>
                        {soalForm.opsi && [0, 1, 2, 3, 4].map((idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="font-bold text-gray-400">{String.fromCharCode(65 + idx)}.</span>
                            <input
                              type="text" required
                              value={soalForm.opsi[idx] || ""}
                              onChange={(e) => {
                                const newOpsi = [...soalForm.opsi];
                                newOpsi[idx] = e.target.value;
                                setSoalForm({ ...soalForm, opsi: newOpsi });
                              }}
                              placeholder={`Pilihan Opsi ${String.fromCharCode(65 + idx)}`}
                              className="flex-1 border border-gray-200 dark:border-zinc-700 rounded-lg p-2 dark:bg-zinc-850 dark:text-white"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1 md:col-span-2 border-t border-gray-100 dark:border-zinc-800 pt-3">
                        <label className="font-bold text-gray-700 dark:text-zinc-300">Pembahasan Lengkap (Markdown)</label>
                        <textarea
                          rows={3}
                          value={soalForm.pembahasan}
                          onChange={(e) => setSoalForm({ ...soalForm, pembahasan: e.target.value })}
                          className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                          placeholder="Tuliskan kunci cara cepat & pembahasan logis..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-zinc-800">
                      <button type="button" onClick={() => setShowSoalModal(false)} className="rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-4 py-2 text-xs font-bold text-gray-700 dark:text-zinc-300">Batal</button>
                      <button type="submit" className="rounded-lg bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-500">Simpan Soal</button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          )}

          {/* TAB 5: PLATFORM ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="space-y-6 animate-fade-in-up">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Accuracy per question stats */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="text-xs font-bold text-gray-450 uppercase mb-4 tracking-wider font-mono flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-blue-500" /> Soal Paling Sering Salah
                  </h3>
                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between items-center font-semibold text-gray-400 font-mono">
                      <span>Kode Soal / Subtes</span>
                      <span>Tingkat Akurasi Siswa</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800 dark:text-zinc-200">#s-PU-012 (Penalaran Logis)</p>
                        <p className="text-[10px] text-gray-400">Mapel: TPS • Kesulitan: sulit</p>
                      </div>
                      <span className="rounded-full bg-red-100 text-red-800 px-2 py-0.5 font-bold font-mono">18% Benar</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800 dark:text-zinc-200">#s-PK-088 (Fungsi Komposisi)</p>
                        <p className="text-[10px] text-gray-400">Mapel: TPS • Kesulitan: sulit</p>
                      </div>
                      <span className="rounded-full bg-red-100 text-red-800 px-2 py-0.5 font-bold font-mono">24% Benar</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800 dark:text-zinc-200">#s-PM-044 (Trigonometri Lanjut)</p>
                        <p className="text-[10px] text-gray-400">Mapel: TPS • Kesulitan: sulit</p>
                      </div>
                      <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 font-bold font-mono">42% Benar</span>
                    </div>
                  </div>
                </div>

                {/* Tryout Completion & Timing metrics */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="text-xs font-bold text-gray-450 uppercase mb-4 tracking-wider font-mono flex items-center gap-2">
                    <Clock className="h-4.5 w-4.5 text-indigo-500" /> Analitik Durasi Pengerjaan & Completion
                  </h3>
                  <div className="space-y-4 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tryout Akbar #1:</span>
                      <span className="text-gray-850 dark:text-white font-bold">142 Peserta (95% Selesai)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Durasi (Nasional):</span>
                      <span className="text-gray-850 dark:text-white font-bold">182 menit (Limit: 195m)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dropout Terbanyak:</span>
                      <span className="text-red-500 font-bold">Subtes PM (Penalaran Matematika)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Target Passing Grade:</span>
                      <span className="text-teal-500 font-bold">Passing rate: 38% user mencapai &gt; 600</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Heatmap Simulation Card */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-xs font-bold text-gray-450 uppercase mb-4 tracking-wider font-mono flex items-center gap-2">
                  <Database className="h-4.5 w-4.5 text-emerald-500" /> Platform Study Time Heatmap (Jam Belajar Aktif Siswa)
                </h3>

                <div className="grid grid-cols-7 gap-1 text-[9px] font-mono text-center">
                  {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(d => (
                    <div key={d} className="font-bold text-gray-450">{d}</div>
                  ))}

                  {/* Grid cells representing color coded hours */}
                  {Array.from({ length: 28 }).map((_, idx) => {
                    const intensity = (idx * 31) % 5;
                    const color = intensity === 0 ? "bg-teal-50 dark:bg-zinc-800" :
                      intensity === 1 ? "bg-teal-100 dark:bg-teal-950/20" :
                        intensity === 2 ? "bg-teal-300 dark:bg-teal-800/40" :
                          intensity === 3 ? "bg-teal-500 dark:bg-teal-600/70" :
                            "bg-teal-700 dark:bg-teal-500";
                    return (
                      <div
                        key={idx}
                        className={`h-7 rounded-sm flex items-center justify-center text-white/50 text-[8px] font-bold ${color}`}
                        title={`Siswa Belajar: ${intensity * 15 + 10} orang`}
                      >
                        {intensity * 10}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-end gap-3 mt-4 text-[10px] font-mono text-gray-400">
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 bg-teal-550 rounded-xs" /> Sibuk (&gt;50 siswa)</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 bg-teal-100 rounded-xs" /> Lengang (&lt;10 siswa)</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: PTN & JURUSAN */}
          {activeTab === "ptn" && (
            <div className="space-y-6 animate-fade-in-up">

              {/* Threshold controller configuration */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h4 className="text-xs font-bold text-gray-450 uppercase mb-3 tracking-wider font-mono flex items-center gap-2">
                  <Shield className="h-4.5 w-4.5 text-teal-500" /> AI Recommendation & Prediction Config
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700 dark:text-zinc-300">Passing Skor Threshold (IRT)</label>
                    <input
                      type="number"
                      value={settings.thresholdSkorKelolosan}
                      onChange={(e) => setSettings({ ...settings, thresholdSkorKelolosan: parseInt(e.target.value) })}
                      className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700 dark:text-zinc-300">AI Prompt Tuning Mode</label>
                    <select className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white">
                      <option>Strict (Ketat Sesuai Passing Grade)</option>
                      <option>Relaxed (Mendorong Pilihan Alternatif)</option>
                      <option>Optimistic (Rekomendasi PTN Lebih Tinggi)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* PTN CRUD Grid */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-gray-450 uppercase tracking-wider font-mono">Daftar Perguruan Tinggi (PTN)</h4>
                  <button
                    onClick={() => { setEditingPtn(null); setPtnForm({ nama: "", akreditasi: "A", lokasi: "" }); setShowPtnModal(true); }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-500 cursor-pointer shadow-sm"
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> Tambah PTN
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ptnList.map((ptn) => (
                    <div key={ptn.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60 relative">
                      <h5 className="font-extrabold text-gray-900 dark:text-white text-xs mb-1.5">{ptn.nama || ptn.namaPTN}</h5>
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono mb-3">Akreditasi: <strong>{ptn.akreditasi || "A"}</strong> • {ptn.lokasi || "Jawa Barat"}</p>

                      <div className="flex justify-end gap-1.5 border-t border-gray-100 dark:border-zinc-850 pt-2">
                        <button
                          onClick={() => { setEditingPtn(ptn); setPtnForm({ nama: ptn.nama || ptn.namaPTN, akreditasi: ptn.akreditasi || "A", lokasi: ptn.lokasi || "" }); setShowPtnModal(true); }}
                          className="text-[10px] font-bold text-teal-600 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={async () => {
                            if (!confirm("Hapus PTN ini beserta jurusannya?")) return;
                            await apiService.deletePTN(ptn.id);
                            setPtnList(ptnList.filter(p => p.id !== ptn.id));
                            triggerToast("PTN berhasil didelete");
                          }}
                          className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jurusan CRUD Grid */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-gray-450 uppercase tracking-wider font-mono">Daftar Jurusan & Passing Grade</h4>
                  <button
                    onClick={() => { setEditingJurusan(null); setJurusanForm({ nama: "", passingGrade: 60, dayaTampung: 50, peminat: 1200, kelompok: "SAINTEK", ptnId: ptnList[0]?.id || "" }); setShowJurusanModal(true); }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-500 cursor-pointer shadow-sm"
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> Tambah Jurusan
                  </button>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50 font-mono">
                      <tr className="text-gray-400 text-[10px] uppercase">
                        <th className="px-6 py-3 text-left">Nama Jurusan</th>
                        <th className="px-6 py-3 text-left">Kelompok</th>
                        <th className="px-6 py-3 text-left">Passing Grade</th>
                        <th className="px-6 py-3 text-left">Daya Tampung / Peminat</th>
                        <th className="px-6 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {jurusanList.slice(0, 15).map((jur, idx) => (
                        <tr key={jur.id || idx} className="hover:bg-gray-50 dark:hover:bg-zinc-850/20">
                          <td className="px-6 py-3">
                            <span className="font-bold text-gray-800 dark:text-zinc-200 block">{jur.nama}</span>
                            <span className="text-[10px] text-gray-400">{jur.ptn?.nama || "PTN Asal"}</span>
                          </td>
                          <td className="px-6 py-3">
                            <span className="rounded-md bg-zinc-100 text-zinc-700 px-2 py-0.5 font-bold uppercase">{jur.kelompok || "SAINTEK"}</span>
                          </td>
                          <td className="px-6 py-3 font-bold text-teal-600">{jur.passingGrade || jur.pasingGrade || 65}%</td>
                          <td className="px-6 py-3 font-mono">{jur.dayaTampung || 50} / {jur.peminat || 1200}</td>
                          <td className="px-6 py-3 text-right space-x-2">
                            <button
                              onClick={() => { setEditingJurusan(jur); setJurusanForm({ nama: jur.nama, passingGrade: jur.passingGrade || 60, dayaTampung: jur.dayaTampung || 50, peminat: jur.peminat || 1200, kelompok: jur.kelompok || "SAINTEK", ptnId: jur.ptnId || "" }); setShowJurusanModal(true); }}
                              className="text-teal-600 hover:underline font-bold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm("Hapus jurusan ini?")) return;
                                await apiService.deleteJurusan(jur.id);
                                setJurusanList(jurusanList.filter(j => j.id !== jur.id));
                                triggerToast("Jurusan berhasil didelete");
                              }}
                              className="text-red-500 hover:underline font-bold"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PTN Modal */}
              {showPtnModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                  <form onSubmit={handleSavePtn} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-800 space-y-4">
                    <div className="flex justify-between items-start border-b border-gray-150 dark:border-zinc-800 pb-3">
                      <h3 className="text-base font-extrabold text-gray-900 dark:text-white">{editingPtn ? "Edit PTN" : "Tambah PTN"}</h3>
                      <button type="button" onClick={() => setShowPtnModal(false)} className="text-gray-450 text-base font-bold">×</button>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-gray-700">Nama Perguruan Tinggi</label>
                        <input type="text" required value={ptnForm.nama} onChange={(e) => setPtnForm({ ...ptnForm, nama: e.target.value })} className="w-full border rounded-lg p-2 dark:bg-zinc-850 dark:text-white" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-gray-700">Akreditasi</label>
                        <select value={ptnForm.akreditasi} onChange={(e) => setPtnForm({ ...ptnForm, akreditasi: e.target.value })} className="w-full border rounded-lg p-2 dark:bg-zinc-850 dark:text-white">
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-gray-700">Lokasi / Provinsi</label>
                        <input type="text" required value={ptnForm.lokasi} onChange={(e) => setPtnForm({ ...ptnForm, lokasi: e.target.value })} className="w-full border rounded-lg p-2 dark:bg-zinc-850 dark:text-white" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setShowPtnModal(false)} className="rounded-lg bg-gray-50 px-4 py-2 dark:bg-zinc-800">Batal</button>
                      <button type="submit" className="rounded-lg bg-teal-600 px-4 py-2 text-white font-bold">Simpan</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Jurusan Modal */}
              {showJurusanModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                  <form onSubmit={handleSaveJurusan} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-800 space-y-4">
                    <div className="flex justify-between items-start border-b border-gray-150 dark:border-zinc-800 pb-3">
                      <h3 className="text-base font-extrabold text-gray-900 dark:text-white">{editingJurusan ? "Edit Jurusan" : "Tambah Jurusan"}</h3>
                      <button type="button" onClick={() => setShowJurusanModal(false)} className="text-gray-455 text-base font-bold">×</button>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-gray-700">Nama Jurusan / Prodi</label>
                        <input type="text" required value={jurusanForm.nama} onChange={(e) => setJurusanForm({ ...jurusanForm, nama: e.target.value })} className="w-full border rounded-lg p-2 dark:bg-zinc-850 dark:text-white" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-gray-700">Kategori Kelompok</label>
                        <select value={jurusanForm.kelompok} onChange={(e) => setJurusanForm({ ...jurusanForm, kelompok: e.target.value })} className="w-full border rounded-lg p-2 dark:bg-zinc-850 dark:text-white">
                          <option value="SAINTEK">SAINTEK</option>
                          <option value="SOSHUM">SOSHUM</option>
                          <option value="CAMPURAN">CAMPURAN</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-gray-700">Passing Grade (%)</label>
                        <input type="number" required value={jurusanForm.passingGrade} onChange={(e) => setJurusanForm({ ...jurusanForm, passingGrade: parseInt(e.target.value) })} className="w-full border rounded-lg p-2 dark:bg-zinc-850 dark:text-white" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-gray-700">Daya Tampung</label>
                        <input type="number" required value={jurusanForm.dayaTampung} onChange={(e) => setJurusanForm({ ...jurusanForm, dayaTampung: parseInt(e.target.value) })} className="w-full border rounded-lg p-2 dark:bg-zinc-850 dark:text-white" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-gray-700">Peminat Tahun Lalu</label>
                        <input type="number" required value={jurusanForm.peminat} onChange={(e) => setJurusanForm({ ...jurusanForm, peminat: parseInt(e.target.value) })} className="w-full border rounded-lg p-2 dark:bg-zinc-850 dark:text-white" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-gray-700">Pilih Kampus PTN</label>
                        <select value={jurusanForm.ptnId} onChange={(e) => setJurusanForm({ ...jurusanForm, ptnId: e.target.value })} className="w-full border rounded-lg p-2 dark:bg-zinc-850 dark:text-white">
                          {ptnList.map(p => (
                            <option key={p.id} value={p.id}>{p.nama || p.namaPTN}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setShowJurusanModal(false)} className="rounded-lg bg-gray-50 px-4 py-2 dark:bg-zinc-800">Batal</button>
                      <button type="submit" className="rounded-lg bg-teal-600 px-4 py-2 text-white font-bold">Simpan</button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          )}

          {/* TAB 7: MATERI BELAJAR */}
          {activeTab === "materi" && (
            <div className="space-y-4 animate-fade-in-up">

              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
                <p className="text-xs text-gray-505 dark:text-zinc-400">Total modul materi: <strong>{materiList.length}</strong> bab</p>
                <button
                  onClick={() => { setEditingMateri(null); setMateriForm({ judul: "", kategori: "TPS", subtest: "Penalaran Umum", konten: "", estimasiMembaca: 10, poinReward: 100, videoUrl: "", pdfUrl: "", thumbnailUrl: "" }); setShowMateriModal(true); }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4.5 py-2 text-xs font-bold text-white hover:bg-teal-500 cursor-pointer shadow-md"
                >
                  <PlusCircle className="h-4 w-4" /> Unggah Materi
                </button>
              </div>

              {/* Materi Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materiList.map((materi, idx) => (
                  <div key={materi.id || idx} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="rounded-lg bg-purple-50 dark:bg-purple-950/30 p-2 shrink-0">
                          <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => { setEditingMateri(materi); setMateriForm(materi); setShowMateriModal(true); }}
                            className="rounded-lg p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-all cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMateri(materi.id)}
                            className="rounded-lg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2 leading-snug">
                        {materi.judul}
                      </h3>

                      <div className="flex flex-wrap items-center gap-1.5 mb-4">
                        <span className="rounded-md bg-teal-50 dark:bg-teal-950/20 px-2 py-0.5 text-[9px] font-bold text-teal-700 dark:text-teal-400 font-mono">
                          {materi.kategori}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">
                          {materi.subtest}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-500 border-t border-gray-100 dark:border-zinc-850 pt-3">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5"><Clock className="h-3.5 w-3.5" /> {materi.estimasiMembaca || 10}m</span>
                        <span className="flex items-center gap-0.5"><Award className="h-3.5 w-3.5 text-amber-500" /> {materi.poinReward || 100}xp</span>
                      </div>
                      <span className="font-bold text-purple-600 dark:text-purple-400">View: {idx * 15 + 120}x</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Materi Modal */}
              {showMateriModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
                  <form onSubmit={handleSaveMateri} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-800 space-y-4 my-8">
                    <div className="flex justify-between items-start border-b border-gray-150 dark:border-zinc-800 pb-3">
                      <h3 className="text-base font-extrabold text-gray-900 dark:text-white">{editingMateri ? "Edit Materi" : "Unggah Materi Baru"}</h3>
                      <button type="button" onClick={() => setShowMateriModal(false)} className="text-gray-450 text-base font-bold">×</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="font-bold text-gray-700 dark:text-zinc-300">Judul Modul Materi</label>
                        <input
                          type="text" required value={materiForm.judul}
                          onChange={(e) => setMateriForm({ ...materiForm, judul: e.target.value })}
                          className="w-full border rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-700 dark:text-zinc-300">Kategori Subtes</label>
                        <input
                          type="text" required value={materiForm.subtest}
                          onChange={(e) => setMateriForm({ ...materiForm, subtest: e.target.value })}
                          className="w-full border rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-700 dark:text-zinc-300">Estimasi Membaca (Menit)</label>
                        <input
                          type="number" required value={materiForm.estimasiMembaca}
                          onChange={(e) => setMateriForm({ ...materiForm, estimasiMembaca: parseInt(e.target.value) })}
                          className="w-full border rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="font-bold text-gray-700 dark:text-zinc-300">Video Pembahasan URL (Opsional)</label>
                        <input
                          type="url" value={materiForm.videoUrl}
                          onChange={(e) => setMateriForm({ ...materiForm, videoUrl: e.target.value })}
                          className="w-full border rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="font-bold text-gray-700 dark:text-zinc-300">Isi Modul Konten Belajar (Rich Text / Markdown)</label>
                        <textarea
                          required rows={6} value={materiForm.konten}
                          onChange={(e) => setMateriForm({ ...materiForm, konten: e.target.value })}
                          className="w-full border rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white font-mono"
                          placeholder="# Judul Bab... \n Tuliskan materi detail persis..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setShowMateriModal(false)} className="rounded-lg bg-gray-50 px-4 py-2 dark:bg-zinc-800">Batal</button>
                      <button type="submit" className="rounded-lg bg-teal-600 px-5 py-2 text-white font-bold">Simpan Materi</button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          )}

          {/* TAB 8: COMMUNITY MODERATION */}
          {activeTab === "community" && (
            <div className="space-y-4 animate-fade-in-up">

              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <h4 className="text-xs font-bold text-gray-450 uppercase mb-2 tracking-wider font-mono">Moderasi Konten Komunitas (Forum)</h4>
                <p className="text-xs text-gray-650 dark:text-zinc-400">Total topik diskusi: <strong>{posts.length}</strong> postingan.</p>
              </div>

              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-850 dark:bg-zinc-900 flex justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded bg-teal-50 text-teal-700 px-2 py-0.5 text-[9px] font-bold dark:bg-teal-950/20 dark:text-teal-400">{post.category}</span>
                        {post.pinned && <span className="rounded bg-amber-50 text-amber-700 px-2 py-0.5 text-[9px] font-bold flex items-center gap-0.5"><Pin className="h-3 w-3" /> Pinned</span>}
                        <span className="text-[10px] text-gray-400">Penulis: <strong>{post.author?.name || "Siswa"}</strong></span>
                      </div>
                      <h4 className="text-xs font-black text-gray-900 dark:text-white mb-1.5">{post.title}</h4>
                      <p className="text-xs text-gray-650 dark:text-zinc-400 line-clamp-2 leading-relaxed">{post.content}</p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 justify-center">
                      <button
                        onClick={() => handlePinPost(post.id)}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold cursor-pointer border ${post.pinned ? "border-amber-300 text-amber-600 bg-amber-50 dark:bg-amber-950/10 dark:border-amber-800" : "border-gray-200 dark:border-zinc-800 text-gray-500"
                          }`}
                      >
                        Pin Post
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="rounded-lg bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 px-2.5 py-1 text-[10px] font-bold cursor-pointer"
                      >
                        Hapus Toxic
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 9: GAMIFIKASI MANAGEMENT */}
          {activeTab === "gamification" && (
            <div className="space-y-6 animate-fade-in-up">

              <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <h4 className="text-xs font-bold text-gray-450 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Award className="h-4.5 w-4.5 text-orange-500" /> Terbitkan Lencana (Badge) Baru
                </h4>

                <form onSubmit={handleCreateBadge} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Nama Lencana</label>
                    <input
                      type="text" required placeholder="Contoh: Sang Penakluk Kuantitatif"
                      value={newBadge.title} onChange={(e) => setNewBadge({ ...newBadge, title: e.target.value })}
                      className="w-full border rounded-lg p-2 dark:bg-zinc-850 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Poin Reward (XP)</label>
                    <input
                      type="number" required
                      value={newBadge.xp} onChange={(e) => setNewBadge({ ...newBadge, xp: parseInt(e.target.value) })}
                      className="w-full border rounded-lg p-2 dark:bg-zinc-850 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Icon Lencana</label>
                    <select
                      value={newBadge.icon} onChange={(e) => setNewBadge({ ...newBadge, icon: e.target.value })}
                      className="w-full border rounded-lg p-2 dark:bg-zinc-850 dark:text-white"
                    >
                      <option value="Award">Award Badge</option>
                      <option value="Zap">Zap / Flash</option>
                      <option value="Flame">Flame / Streak</option>
                      <option value="Target">Target Center</option>
                    </select>
                  </div>
                  <div className="space-y-1 md:col-span-3">
                    <label className="font-bold text-gray-700">Syarat Klaim & Keterangan</label>
                    <input
                      type="text" required placeholder="Contoh: Menyelesaikan 5 Tryout Kuantitatif berturut-turut dengan skor > 750"
                      value={newBadge.desc} onChange={(e) => setNewBadge({ ...newBadge, desc: e.target.value })}
                      className="w-full border rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end">
                    <button type="submit" className="rounded-lg bg-orange-500 hover:bg-orange-600 px-5 py-2 font-bold text-white shadow-md">Terbitkan Lencana</button>
                  </div>
                </form>
              </div>

              {/* Badges List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {badges.map((b) => (
                  <div key={b.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60 flex items-center gap-3">
                    <div className="rounded-xl bg-orange-500/10 p-2.5 text-orange-500">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-gray-900 dark:text-white">{b.title}</h5>
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500 mb-1">{b.desc}</p>
                      <span className="rounded-md bg-orange-100 text-orange-800 px-2 py-0.5 text-[9px] font-bold font-mono">+{b.xp} XP Reward</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 10: AI CONSULTATION MONITORING */}
          {activeTab === "ai_consultation" && (
            <div className="space-y-6 animate-fade-in-up">

              <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <h4 className="font-extrabold text-gray-900 dark:text-white">AI Consultation Limits</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Batas Chat Siswa per Hari:</span>
                      <input
                        type="number"
                        value={settings.aiLimitPerUser}
                        onChange={(e) => setSettings({ ...settings, aiLimitPerUser: parseInt(e.target.value) })}
                        className="border rounded-md p-1 w-20 text-center dark:bg-zinc-850 dark:text-white"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Model AI Terpakai:</span>
                      <span className="font-bold text-teal-600 font-mono">Gemini 3.5 Flash</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Status API Key:</span>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold font-mono text-[9px]">ONLINE</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-gray-900 dark:text-white">Total Token Terpakai Hari Ini</h4>
                  <div className="rounded-xl bg-cyan-500/5 p-4 border border-cyan-500/10 flex items-center justify-between">
                    <div>
                      <h5 className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">14.8K</h5>
                      <p className="text-[10px] text-gray-400">Rata-rata 325 token per request</p>
                    </div>
                    <Cpu className="h-10 w-10 text-cyan-500 opacity-20" />
                  </div>
                </div>
              </div>

              {/* Log prompts */}
              <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                <p className="text-[10px] font-bold text-gray-450 uppercase tracking-widest font-mono p-4 border-b border-gray-100 dark:border-zinc-800">Prompt Logs Siswa (AI Consultant)</p>
                <div className="divide-y divide-gray-100 dark:divide-zinc-800 text-xs">
                  {aiLogs.map((log) => (
                    <div key={log.id} className="p-4 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-teal-600 font-mono">{log.email}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{log.tokens} tokens • {new Date(log.timestamp).toLocaleTimeString("id-ID")}</span>
                      </div>
                      <p className="text-gray-700 dark:text-zinc-350 italic">"{log.prompt}"</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 11: PAYMENT & SUBSCRIPTION */}
          {activeTab === "payments" && (
            <div className="space-y-6 animate-fade-in-up">

              {/* Revenue Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <span className="text-[9px] font-bold text-gray-400 uppercase font-mono">MRR (Monthly Recurring Revenue)</span>
                  <h4 className="text-xl font-black text-gray-900 dark:text-white mt-1">Rp 4.900.000</h4>
                  <p className="text-[9px] text-emerald-500 font-bold">+15% dari bulan lalu</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <span className="text-[9px] font-bold text-gray-400 uppercase font-mono">Transaksi Sukses</span>
                  <h4 className="text-xl font-black text-gray-900 dark:text-white mt-1">{payments.filter(p => p.status === "SUCCESS").length} Transaksi</h4>
                  <p className="text-[9px] text-gray-400">100% gateway terintegrasi</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <span className="text-[9px] font-bold text-gray-400 uppercase font-mono">ARPU (Avg Revenue Per User)</span>
                  <h4 className="text-xl font-black text-gray-900 dark:text-white mt-1">Rp 56.700</h4>
                  <p className="text-[9px] text-teal-500 font-mono">Rasio Premium: {premiumSiswa.length} user</p>
                </div>
              </div>

              {/* Transactions List */}
              <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-zinc-800/50 font-mono">
                    <tr className="text-gray-400 text-[10px] uppercase">
                      <th className="px-6 py-3 text-left">Invoice / User</th>
                      <th className="px-6 py-3 text-left">Plan Langganan</th>
                      <th className="px-6 py-3 text-left">Nominal</th>
                      <th className="px-6 py-3 text-left">Tanggal</th>
                      <th className="px-6 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-zinc-850/20">
                        <td className="px-6 py-3">
                          <span className="font-bold text-gray-800 dark:text-zinc-200 block">{p.id}</span>
                          <span className="text-[10px] text-gray-400">{p.name}</span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400 px-2 py-0.5 font-bold">{p.plan}</span>
                        </td>
                        <td className="px-6 py-3 font-mono font-bold text-gray-900 dark:text-white">Rp {p.amount.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-3 text-gray-400 font-mono">{new Date(p.date).toLocaleDateString("id-ID")}</td>
                        <td className="px-6 py-3 text-right">
                          <span className={`rounded-full px-2.5 py-0.5 font-bold ${p.status === "SUCCESS" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}>{p.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 12: NOTIFICATION SYSTEM */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-fade-in-up">

              <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h4 className="text-xs font-bold text-gray-450 uppercase mb-4 tracking-wider font-mono flex items-center gap-1.5">
                  <Bell className="h-4.5 w-4.5 text-rose-500" /> Kirim Pengumuman Massal
                </h4>

                <form onSubmit={handleSendNotification} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Judul Notifikasi / Subjek Email</label>
                      <input
                        type="text" required placeholder="Contoh: Pengumuman Jadwal SNBT UTBK 2026!"
                        value={notifForm.title} onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                        className="w-full border rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Metode Pengiriman</label>
                      <select
                        value={notifForm.type} onChange={(e) => setNotifForm({ ...notifForm, type: e.target.value })}
                        className="w-full border rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                      >
                        <option value="PUSH">Push Notification (Situs & Mobile)</option>
                        <option value="EMAIL">Email Massal (Mailgun/Sendgrid API)</option>
                        <option value="POPUP">Popup Alert Banner (Situs Utama)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Isi Pesan Notifikasi</label>
                    <textarea
                      required rows={4} placeholder="Tulis pengumuman resmi di sini..."
                      value={notifForm.message} onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                      className="w-full border rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="submit" className="rounded-lg bg-rose-500 hover:bg-rose-600 px-6 py-2.5 font-bold text-white shadow-md inline-flex items-center gap-1.5 cursor-pointer">
                      <Send className="h-4 w-4" /> Pancarkan Notifikasi
                    </button>
                  </div>
                </form>
              </div>

              {/* Notification templates */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60 text-xs space-y-3">
                <h5 className="font-extrabold text-gray-900 dark:text-white">Quick Templates</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setNotifForm({ title: "Jadwal Resmi SNBT 2026", message: "Registrasi akun SNPMB resmi dibuka! Segera lengkapi portofolio Anda di portal resmi.", target: "ALL", type: "PUSH" })}
                    className="p-3 rounded-lg border border-gray-200 text-left hover:border-teal-500 transition-colors"
                  >
                    <p className="font-bold mb-1">📅 Jadwal SNBT</p>
                    <p className="text-[10px] text-gray-400 line-clamp-2">Registrasi akun SNPMB resmi dibuka! Segera lengkapi...</p>
                  </button>

                  <button
                    onClick={() => setNotifForm({ title: "Tryout Akbar SNBT Jilid II", message: "Tryout Cat Online Berskala Nasional akan dibuka serentak besok pagi. Siapkan kartu ujian Anda!", target: "ALL", type: "PUSH" })}
                    className="p-3 rounded-lg border border-gray-200 text-left hover:border-teal-500 transition-colors"
                  >
                    <p className="font-bold mb-1">🏆 Tryout Nasional</p>
                    <p className="text-[10px] text-gray-400 line-clamp-2">Tryout Cat Online Berskala Nasional akan dibuka serentak...</p>
                  </button>

                  <button
                    onClick={() => setNotifForm({ title: "Promo Premium Pro-Pack", message: "Gunakan kode kupon UTBKPRO99 untuk potongan 50% paket persiapan bimbingan belajar khusus AI.", target: "ALL", type: "EMAIL" })}
                    className="p-3 rounded-lg border border-gray-200 text-left hover:border-teal-500 transition-colors"
                  >
                    <p className="font-bold mb-1">⚡ Promo Premium</p>
                    <p className="text-[10px] text-gray-400 line-clamp-2">Gunakan kode kupon UTBKPRO99 untuk potongan 50%...</p>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 13: SETTINGS SYSTEM */}
          {activeTab === "settings" && (
            <form onSubmit={handleSaveSettings} className="space-y-6 animate-fade-in-up">

              <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-4 text-xs">
                <h4 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5"><Shield className="h-4.5 w-4.5 text-zinc-500" /> Platform Maintenance & Themes</h4>

                <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-zinc-200">Mode Perawatan (Maintenance Mode)</p>
                    <p className="text-[10px] text-gray-400">Jika aktif, siswa tidak bisa login atau mengakses materi/tryout.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:bg-zinc-700 peer-checked:bg-rose-500"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Tema Standar Platform</label>
                    <select
                      value={settings.theme}
                      onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                      className="w-full border rounded-lg p-2 dark:bg-zinc-850 dark:text-white"
                    >
                      <option value="light">Mode Terang (Sleek Clean)</option>
                      <option value="dark">Mode Gelap (Pluss500 Deep Navy)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Unggah Logo Platform (Mock Url)</label>
                    <input
                      type="text"
                      value={settings.logoUrl}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      placeholder="https://eduptn.com/logo.png"
                      className="w-full border rounded-lg p-2 dark:bg-zinc-850 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-4 text-xs">
                <h4 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5"><Key className="h-4.5 w-4.5 text-zinc-500" /> API Keys & Credentials</h4>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 flex items-center gap-1">Gemini AI Key <Sparkles className="h-3.5 w-3.5 text-purple-500" /></label>
                    <input
                      type="password" required
                      value={settings.geminiApiKey}
                      onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                      className="w-full border rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">OpenAI Api Key (Fallback)</label>
                    <input
                      type="password"
                      value={settings.openaiApiKey}
                      onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                      className="w-full border rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Supabase DB Client Url</label>
                    <input
                      type="text" required
                      value={settings.supabaseUrl}
                      onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value })}
                      className="w-full border rounded-lg p-2.5 dark:bg-zinc-850 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="rounded-lg bg-teal-650 hover:bg-teal-600 px-6 py-2.5 font-bold text-white shadow-md cursor-pointer">Simpan Konfigurasi</button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
