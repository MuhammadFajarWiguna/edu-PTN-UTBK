import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, CheckCircle, Plus, Trash2, CalendarRange, Sparkles } from "lucide-react";

export default function CalendarView({
  events,
  onAddEvent,
  onToggleCompleteEvent,
  onDeleteEvent
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newType, setNewType] = useState("belajar");
  const [newNotes, setNewNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate.trim()) return;

    onAddEvent({
      title: newTitle,
      date: newDate,
      time: newTime || "00:00",
      type: newType,
      notes: newNotes,
    });

    // Reset Form
    setNewTitle("");
    setNewDate("");
    setNewTime("");
    setNewType("belajar");
    setNewNotes("");
    setShowAddForm(false);
  };

  // Sort events by date ascending
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Filter current vs historic events
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingEvents = sortedEvents.filter((ev) => ev.date >= todayStr);
  const pastEvents = sortedEvents.filter((ev) => ev.date < todayStr);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 font-sans text-xs font-semibold">
      {/* Kiri: Agenda List & Form */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-850 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-5 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-teal-500/10 p-2 text-teal-600 dark:bg-teal-950">
                <CalendarRange className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-955 dark:text-white font-display text-base leading-tight">Kalender Saya</h3>
                <p className="text-[10px] text-gray-450 mt-0.5 font-medium">Bimbingan harian & penanda jadwal penting snbt</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="rounded-xl bg-teal-650 px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-teal-600 active:scale-[0.98] inline-flex items-center gap-1.5 cursor-pointer transition-all duration-200 transform-gpu shadow-xs"
            >
              <Plus className="h-4 w-4" /> Susun Jadwal
            </button>
          </div>

          {/* New Event Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-xl border border-gray-100 bg-gray-50/20 space-y-3 dark:border-zinc-800 antialiased">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2 block font-display text-[12px]">Agenda Pengingat Baru</h4>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Aktivitas Agenda</label>
                  <input
                    type="text"
                    placeholder="E.g. Menghafal Ringkasan Bab Logika"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-150 py-2 px-3 text-xs focus:outline-none focus:border-teal-400 dark:bg-zinc-850 dark:border-zinc-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-150 py-2 px-3 focus:outline-none dark:bg-zinc-850 dark:border-zinc-800 dark:text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Waktu/Jam</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full rounded-xl border border-gray-150 py-2 px-3 focus:outline-none dark:bg-zinc-850 dark:border-zinc-800 dark:text-white text-xs"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Jenis Kegiatan</label>
                  <div className="flex gap-2 pt-1">
                    {["belajar", "tryout", "deadline", "ujian"].map((typeStr) => (
                      <button
                        key={typeStr}
                        type="button"
                        onClick={() => setNewType(typeStr)}
                        className={`rounded-lg py-1 px-3 text-xxs font-bold uppercase tracking-wider border cursor-pointer ${newType === typeStr ?
                            "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950/20 dark:text-teal-400" :
                            "border-transparent bg-gray-100 text-gray-550 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                      >
                        {typeStr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Catatan Pendukung</label>
                  <input
                    type="text"
                    placeholder="Buku catatan bab 4 hlm 22, dll"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full rounded-xl border border-gray-150 py-2 px-3 text-xs focus:outline-none focus:border-teal-400 dark:bg-zinc-850 dark:border-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 text-xxs font-bold">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-lg border border-gray-150 py-1.5 px-3 text-gray-500 cursor-pointer hover:bg-gray-50 dark:border-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-650 py-1.5 px-4 text-white hover:bg-teal-600 cursor-pointer"
                >
                  Pasang Pengingat
                </button>
              </div>
            </form>
          )}

          {/* Agenda Feed Grid */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xxs uppercase tracking-wider text-gray-400 font-bold font-mono mb-3">Agenda Terdekat</h4>

              <div className="space-y-3">
                {upcomingEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`rounded-xl border p-4 flex gap-4 justify-between items-start transition-all duration-250 transform-gpu ${ev.completed ?
                        "border-gray-100 bg-gray-50/20 opacity-50 dark:border-zinc-850 dark:bg-zinc-900/30" :
                        "border-gray-100 bg-white subtle-shadow hover:border-teal-500/30 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-teal-500/40 hover:-translate-y-[1.5px] hover:shadow-xs"
                      }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[8px] font-extrabold uppercase py-0.5 px-1.5 rounded tracking-wider ${ev.type === "ujian" ? "bg-red-400/10 text-red-750 dark:bg-red-950/20 dark:text-red-400" :
                            ev.type === "deadline" ? "bg-amber-400/10 text-amber-750 dark:bg-amber-950/20 dark:text-amber-400" :
                              ev.type === "tryout" ? "bg-indigo-400/10 text-indigo-750 dark:bg-indigo-950/20 dark:text-indigo-400" :
                                "bg-teal-405/10 text-teal-750 dark:bg-teal-950/20 dark:text-teal-400"
                          }`}>
                          {ev.type}
                        </span>

                        <span className="text-[10px] text-gray-400 font-mono">
                          🗓 {ev.date} pukul {ev.time}
                        </span>
                      </div>

                      <h4 className={`font-extrabold text-gray-950 dark:text-white tracking-tight leading-tight font-display text-sm ${ev.completed ? "line-through text-gray-400" : ""}`}>
                        {ev.title}
                      </h4>

                      {ev.notes && (
                        <p className="text-xxs text-gray-500 leading-relaxed dark:text-zinc-400 font-medium">Catatan: {ev.notes}</p>
                      )}
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => onToggleCompleteEvent(ev.id)}
                        className={`rounded-lg px-2.5 py-1.5 border hover:bg-gray-50 text-[10px] font-bold cursor-pointer transition-all dark:border-zinc-800 dark:hover:bg-zinc-800 ${ev.completed ? "bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/20" : "bg-white text-gray-500"
                          }`}
                      >
                        {ev.completed ? "✓ Selesai" : "Centang Selesai"}
                      </button>

                      <button
                        onClick={() => onDeleteEvent(ev.id)}
                        className="rounded-lg p-1.5 border border-red-200 hover:border-red-400 text-red-500 cursor-pointer hover:bg-red-50/30 dark:border-zinc-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {upcomingEvents.length === 0 && (
                  <div className="text-center p-8 text-xxs text-gray-400 dark:text-zinc-550">
                    Tidak ada agenda terdekat. Yuk pasang bimbingan baru dengan tombol Susun Jadwal.
                  </div>
                )}
              </div>
            </div>

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                <h4 className="text-xxs uppercase tracking-wider text-gray-400 font-bold font-mono mb-3">Agenda Sebelumnya</h4>

                <div className="space-y-2 opacity-50 text-xxs">
                  {pastEvents.map((ev) => (
                    <div key={ev.id} className="flex justify-between items-center bg-gray-50/50 p-2.5 rounded-lg border border-gray-105/45 dark:border-zinc-850 dark:bg-zinc-900/10">
                      <div>
                        <span className="text-[10px] font-bold text-gray-800 dark:text-zinc-200">{ev.title}</span>
                        <span className="block text-[8px] text-gray-400 mt-0.5 font-mono">Dilakukan {ev.date}</span>
                      </div>
                      <span className="rounded bg-gray-100 text-gray-400 px-1.5 py-0.5 text-[8px] uppercase tracking-wide">
                        LALU
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kanan: Kalender Info Widget */}
      <div className="lg:col-span-1">
        <div className="rounded-2xl border border-teal-100 bg-teal-50/10 p-5 dark:border-teal-900/30">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 mb-3">
            <Sparkles className="h-4.5 w-4.5 animate-pulse" />
            <h3 className="font-bold text-sm">Organisasi Belajar Efektif</h3>
          </div>
          <p className="text-xs text-gray-550 dark:text-zinc-400 leading-relaxed font-sans font-normal space-y-2.5">
            - <b>Fokus Gelombang Sesi</b>: Bagi 3 hari per subtes (3 hari PK, 3 hari PM, hlm sosiologi).<br />
            - <b>Ujian Akbar Gelombang</b>: Pastikan simulasi Tryout minimal 2 minggu sekali untuk menjaga ketelitian berfikir pada batas denda waktu nyata.<br />
            - <b>Jeda Pintar</b>: Sisipkan aktivitas non-akademik di sela-sela belajar harian untuk memelihara kesehatan mental siswa bimbingan.
          </p>
        </div>
      </div>
    </div>
  );
}
