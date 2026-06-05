import React, { useState } from "react";
import { 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  User, 
  PlusCircle, 
  Tag, 
  Clock 
} from "lucide-react";

export default function CommunityView({ 
  posts, 
  onAddPost, 
  onLikePost, 
  onAddComment, 
  user 
}) {
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("TPS");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [commentInputs, setCommentInputs] = useState({});

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddPost(newTitle, newContent, newCategory);
    setNewTitle("");
    setNewContent("");
  };

  const handleCommentSubmit = (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    onAddComment(postId, text);
    setCommentInputs({
      ...commentInputs,
      [postId]: ""
    });
  };

  const filteredPosts = posts.filter((p) => {
    return activeCategory === "ALL" || p.category === activeCategory;
  });

  const categories = ["ALL", "TPS", "LITERASI", "Jurusan", "Mandiri"];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Kolom 1-2: Feed Diskusi */}
      <div className="lg:col-span-2 space-y-4">
        {/* Forum category filters */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-bold tracking-wide cursor-pointer transition-all duration-200 transform-gpu active:scale-95 ease-out ${
                activeCategory === cat ? 
                "bg-teal-650 text-white shadow-xs" : 
                "bg-white text-gray-650 border border-gray-100 hover:border-teal-500/30 hover:text-teal-650 hover:-translate-y-0.5 dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-400 dark:hover:border-teal-400/30"
              }`}
            >
              #{cat}
            </button>
          ))}
        </div>

        {/* Posts cards feed */}
        <div className="space-y-4 text-xs">
          {filteredPosts.map((p) => (
            <div key={p.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-zinc-850 dark:bg-zinc-900">
              {/* Post Header */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  <img 
                    src={p.author.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"} 
                    alt={p.author.name}
                    className="h-9 w-9 rounded-full object-cover border border-gray-100 dark:border-zinc-800"
                  />
                  <div>
                    <h4 className="font-extrabold text-gray-950 dark:text-white font-display text-xs">{p.author.name}</h4>
                    <span className="block text-[9px] font-bold text-teal-605 tracking-wide uppercase font-mono mt-0.5">{p.author.badge}</span>
                  </div>
                </div>

                <span className="rounded bg-gray-50 text-gray-400 font-bold px-2 py-0.5 text-[8px] tracking-wider dark:bg-zinc-800 dark:text-zinc-500 font-mono uppercase">
                  #{p.category}
                </span>
              </div>

              {/* Post Title & Content */}
              <div className="mt-4 space-y-1.5">
                <h3 className="font-bold text-gray-955 dark:text-white font-display text-sm md:text-sm leading-snug">{p.title}</h3>
                <p className="text-gray-600 dark:text-zinc-350 leading-relaxed font-sans">{p.content}</p>
              </div>

              {/* Action Toolbar */}
              <div className="mt-5 flex items-center gap-4 border-t border-gray-50 pt-3 text-xxs font-bold text-gray-400 dark:border-zinc-850/65 dark:text-zinc-500">
                <button 
                  onClick={() => onLikePost(p.id)}
                  className={`flex items-center gap-1.5 hover:text-teal-650 transition-all duration-200 transform-gpu active:scale-90 cursor-pointer ${p.hasLiked ? "text-teal-600 scale-105" : ""}`}
                >
                  <ThumbsUp className="h-4 w-4 transition-transform group-hover:scale-110" /> {p.likes || 0} Menyukai
                </button>
                <div className="flex items-center gap-1.5 transition-colors duration-200 hover:text-teal-650 cursor-pointer">
                  <MessageSquare className="h-4 w-4" /> {p.comments ? p.comments.length : 0} Balasan
                </div>
              </div>

              {/* Comments list expansion */}
              {p.comments && p.comments.length > 0 && (
                <div className="mt-4 border-t border-gray-50 pt-4 space-y-3 dark:border-zinc-850/65 bg-gray-50/20 rounded-xl p-3">
                  {p.comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2.5 text-xxs pb-2 last:pb-0 border-b border-gray-50 last:border-0 dark:border-zinc-850/40">
                      <img 
                        src={c.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"} 
                        alt={c.author} 
                        className="h-7 w-7 rounded-full object-cover"
                      />
                      <div className="space-y-0.5">
                        <span className="font-bold text-gray-950 dark:text-white">{c.author}</span>
                        <p className="text-gray-550 dark:text-zinc-400 leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Post comment form */}
              <div className="mt-4 flex gap-2">
                <input 
                  type="text" 
                  placeholder="Tulis tanggapan diskusi..."
                  value={commentInputs[p.id] || ""}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [p.id]: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCommentSubmit(p.id); }}
                  className="flex-1 rounded-xl border border-gray-150 px-3.5 py-1.5 focus:outline-none focus:border-teal-500 text-xxs dark:bg-zinc-800 dark:border-zinc-850 dark:text-white transition-all focus:ring-1 focus:ring-teal-500/20"
                />
                <button 
                  onClick={() => handleCommentSubmit(p.id)}
                  className="rounded-xl bg-teal-650 px-3.5 py-1.5 text-white hover:bg-teal-605 group cursor-pointer transition-all duration-200 transform-gpu active:scale-95"
                >
                  <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>

            </div>
          ))}

          {filteredPosts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-150 p-12 text-center text-gray-400">
              Belum ada postingan untuk kriteria filter ini. Mulailah membuka diskusi hari ini!
            </div>
          )}
        </div>
      </div>

      {/* Kolom 3: Pembuat Postingan Baru */}
      <div className="lg:col-span-1">
        <form onSubmit={handlePostSubmit} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-zinc-850 dark:bg-[#0E1320]/60 space-y-4.5 font-sans text-xs">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 flex-wrap dark:border-zinc-850">
            <PlusCircle className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <h3 className="font-extrabold text-gray-950 dark:text-white font-display text-sm tracking-tight">Buat Topik Baru</h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Kategori Forum</label>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["TPS", "LITERASI", "Jurusan", "Mandiri"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNewCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-wider cursor-pointer font-mono transition-all ${
                    newCategory === cat ? 
                    "bg-teal-50 border border-teal-500 text-teal-700 dark:bg-teal-950/25 dark:text-teal-400 dark:border-teal-500/40" : 
                    "bg-gray-50 text-gray-400 border border-transparent hover:bg-gray-100 dark:bg-zinc-800 dark:text-zinc-500"
                  }`}
                >
                  #{cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Judul Pertanyaan/Diskusi</label>
            <input 
              type="text" 
              placeholder="E.g. Bingung cara eliminasi sumbu simetri PK"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3.5 text-xs focus:outline-none focus:border-teal-500 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-white dark:placeholder-zinc-650 transition-all focus:ring-2 focus:ring-teal-500/10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Detail Penjelasan</label>
            <textarea 
              placeholder="Berikan argumen, soal cerita, atau bagikan trik pengerjaan yang sudah kamu temukan disini..."
              rows={4}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3.5 text-xs focus:outline-none focus:border-teal-500 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-white dark:placeholder-zinc-650 transition-all focus:ring-2 focus:ring-teal-500/10"
            />
          </div>

          <button
            type="submit"
            className="w-full font-bold bg-teal-600 text-white rounded-xl py-3 hover:bg-teal-555 transition-all cursor-pointer font-sans shadow-md shadow-teal-550/10 active:scale-[0.98] duration-200 transform-gpu"
          >
            Kirim Pertanyaan (+30 EduPts)
          </button>
        </form>
      </div>

    </div>
  );
}
