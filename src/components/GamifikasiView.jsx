import React from "react";
import { Award, Flame, CheckCircle, Smartphone, Lock, ShieldCheck, HelpCircle, Trophy, Target, Zap, Star, Medal } from "lucide-react";

export default function GamifikasiView({ gamifikasi, user }) {
  // Icon mapping
  const IconMap = {
    Flame,
    Target,
    Trophy,
    Zap,
    Star,
    Medal,
    Award
  };

  const renderIcon = (iconName) => {
    const IconComponent = IconMap[iconName] || Award;
    return <IconComponent className="h-6 w-6" />;
  };

  // Hardcoded leaderboard values for gamified community structure
  const leaderboardMock = [
    { rank: 1, name: " Sarah Azzahra", points: 1250, badge: "Juara Umum", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" },
    { rank: 2, name: "Budi Santoso", points: 980, badge: "Master Kuantitatif", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" },
    { rank: 3, name: "Clara Angelica", points: 840, badge: "Pejuang Aktif", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80" },
    { rank: 4, name: user?.name || "Ahmad Rivaldi", points: gamifikasi.points, badge: "Siswa Ambis", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80" },
    { rank: 5, name: "Taufik Hidayat", points: 390, badge: "Pioneer", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80" },
  ];

  // Sort leaderboard dynamically based on actual points
  const sortedLeaderboard = [...leaderboardMock].sort((a, b) => b.points - a.points);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 font-sans text-xs">
      {/* Kiri: Lencana Penghargaan (Badges) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-850 dark:bg-zinc-900">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-3 mb-5 dark:border-zinc-800">
            <div className="rounded-xl bg-amber-400/10 p-1.5 text-amber-500">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-950 dark:text-white font-display text-base leading-tight">Lencana Belajar Saya</h3>
              <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Buka pencapaian akademik untuk meraih lencana istimewa</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {gamifikasi.badges.map((b) => {
              const isUnlocked = !!b.unlockedAt;
              return (
                <div 
                  key={b.id} 
                  className={`flex items-start gap-4 rounded-xl border p-4 transition-all ${
                    isUnlocked ?
                    "border-teal-500 bg-teal-50/5 dark:border-teal-900/30 dark:bg-teal-950/15" :
                    "border-gray-100 bg-gray-50/20 opacity-55 dark:border-zinc-805 dark:bg-zinc-850/40"
                  }`}
                >
                  <span className="text-3xl filter saturate-100 select-none bg-gray-100 p-2 text-center rounded-xl block shrink-0 dark:bg-zinc-800 flex items-center justify-center">
                    {isUnlocked ? (
                      <span className="text-amber-500">{renderIcon(b.icon)}</span>
                    ) : (
                      <Lock className="h-6 w-6 text-gray-400" />
                    )}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-gray-900 dark:text-white font-display text-xs">{b.name}</h4>
                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 text-emerald-700 px-1.5 py-0.2 text-[8px] font-bold dark:bg-emerald-950/40 dark:text-emerald-400">
                          <CheckCircle className="h-2.5 w-2.5" /> Terbuka
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 rounded bg-gray-100 text-gray-400 px-1.5 py-0.2 text-[8px] font-bold dark:bg-zinc-700">
                          <Lock className="h-2.5 w-2.5" /> Terkunci
                        </span>
                      )}
                    </div>
                    <p className="text-xxs text-gray-500 dark:text-zinc-400 leading-relaxed">{b.description}</p>
                    {isUnlocked && (
                      <span className="block text-[8px] text-gray-450 mt-1.5 font-mono dark:text-zinc-500">
                        Didapatkan pada: {new Date(b.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kanan: Klasemen (Leaderboard) */}
      <div className="lg:col-span-1">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-850 dark:bg-zinc-900">
          <div className="border-b border-gray-50 pb-3 mb-4 dark:border-zinc-800">
            <h3 className="font-bold text-gray-950 dark:text-white font-display text-sm leading-tight">Klasemen Pejuang SNBT 2026</h3>
            <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Bandingkan total poin akumulasi belajar Anda nasional</p>
          </div>

          <div className="space-y-3">
            {sortedLeaderboard.map((player, idx) => {
              const isCurrentUser = player.name === user?.name || player.name.trim() === "Ahmad Rivaldi";
              const rank = idx + 1;
              return (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                    isCurrentUser ?
                    "bg-teal-50/50 border border-teal-200 dark:bg-teal-950/20 dark:border-teal-900/40" :
                    "hover:bg-gray-50/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank indicator badge styles */}
                    <span className={`w-5 h-5 shrink-0 rounded-full font-sans font-black flex items-center justify-center text-[10px] ${
                      rank === 1 ? "bg-amber-100 text-amber-700 border border-amber-300" :
                      rank === 2 ? "bg-slate-100 text-slate-700 border border-slate-300" :
                      rank === 3 ? "bg-orange-100 text-orange-700 border border-orange-300" :
                      "text-gray-400"
                    }`}>
                      {rank}
                    </span>

                    <img 
                      src={player.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"} 
                      alt={player.name} 
                      className="h-7 w-7 rounded-full object-cover"
                    />

                    <div>
                      <h4 className={`font-bold font-display text-[11px] ${isCurrentUser ? "text-teal-700 dark:text-teal-450" : "text-gray-900 dark:text-zinc-200"}`}>
                        {player.name} {isCurrentUser && " (Saya)"}
                      </h4>
                      <span className="block text-[8px] text-gray-400 leading-none">{player.badge}</span>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-[11px] text-gray-700 dark:text-zinc-300 shrink-0">
                    {player.points} Pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
