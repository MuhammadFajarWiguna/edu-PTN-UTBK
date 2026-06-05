import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Send, Bot, User, RefreshCw, Key, Eye, EyeOff, Check } from "lucide-react";
import { apiService } from "../utils/api";

function parseBoldText(text, isAI) {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, pIdx) => {
    if (pIdx % 2 === 1) {
      return <strong key={pIdx} className={isAI ? "font-bold text-teal-800 dark:text-teal-400" : "font-extrabold text-teal-100"}>{part}</strong>;
    }
    return part;
  });
}

function renderFormattedMessage(text, isAI) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, lIdx) => {
    // Heading format
    if (line.startsWith("### ")) {
      return (
        <h4 key={lIdx} className={`font-bold font-display text-sm tracking-tight mb-2 ${lIdx > 0 ? "mt-3" : ""} ${isAI ? "text-teal-600 dark:text-teal-400 border-b border-gray-100 dark:border-zinc-800 pb-1" : "text-white border-b border-teal-500 pb-1"}`}>
          {parseBoldText(line.substring(4), isAI)}
        </h4>
      );
    }
    
    // Bullet points format
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const displayLine = line.trim().substring(2);
      return (
        <div key={lIdx} className="flex items-start gap-1.5 ml-1 mb-1.5">
          <span className={`shrink-0 text-[9px] mt-1.5 ${isAI ? "text-teal-500" : "text-white"}`}>●</span>
          <span className="flex-1 text-xs leading-relaxed">
            {parseBoldText(displayLine, isAI)}
          </span>
        </div>
      );
    }

    if (line.trim() === "") {
      return <div key={lIdx} className="h-2" />;
    }

    return (
      <p key={lIdx} className="mb-1.5 text-xs leading-relaxed">
        {parseBoldText(line, isAI)}
      </p>
    );
  });
}

export default function ConsultationView({ showToast }) {
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "### Halo! Saya adalah AI Mentor EduPTN\nSaya di sini untuk membantu Anda mensukseskan ujian UTBK SNBT 2026. Anda dapat menanyakan apapun kepada saya:\n- Pembahasan soal matematika, kuantitatif, atau umum\n- Perencanaan jadwal belajar harian\n- Analisis peluang masuk Universitas Impian Anda\n- Info pendaftaran dan passing grade PTN utama\n\nSilakan ajukan pertanyaan Anda!"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Custom API Key states
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState(() => localStorage.getItem("utbk_custom_gemini_key") || "");
  const [showPassword, setShowPassword] = useState(false);

  const handleSaveCustomKey = (e) => {
    e.preventDefault();
    const cleanKey = customKeyInput.trim();
    if (cleanKey === "") {
      localStorage.removeItem("utbk_custom_gemini_key");
      if (showToast) showToast("Custom API Key dihapus. Menggunakan key bawaan platform.", "info");
    } else {
      localStorage.setItem("utbk_custom_gemini_key", cleanKey);
      if (showToast) showToast("Custom API Key berhasil disimpan dan diterapkan!", "success");
    }
    setShowKeyConfig(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsgText = inputText;
    setInputText("");
    
    // Add user message to state
    const updatedMessages = [
      ...messages,
      { role: "user", text: userMsgText }
    ];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Map message history to gemini structure [{role: 'user'|'model', parts: [{text: string}]}]
      const geminiHistory = updatedMessages.slice(0, -1).map((msg) => ({
        role: msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.text }]
      }));

      const reply = await apiService.askGeminiChat(userMsgText, geminiHistory);
      
      setMessages((prev) => [
        ...prev,
        { role: "model", text: reply }
      ]);
    } catch (err) {
      console.error(err);
      const errDetail = err?.message ? `\n\n> ⚠️ Detail: \`${err.message}\`` : "";
      setMessages((prev) => [
        ...prev,
        { 
          role: "model", 
          text: `### Maaf, Terjadi Kesalahan\nSistem gagal merespon pesan Anda. Silakan coba kirim ulang pertanyaan Anda.${errDetail}` 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: "model",
        text: "### Halo! Saya adalah AI Mentor EduPTN\nObrolan belajar kita baru saja disetel ulang. Apa yang ingin kita diskusikan atau pelajari sekarang?"
      }
    ]);
    if (showToast) {
      showToast("Sesi konsultasi AI berhasil disetel ulang.", "info");
    }
  };  return (
    <div className="rounded-2xl border border-gray-150 bg-white shadow-sm overflow-hidden flex flex-col h-[540px] dark:border-zinc-850 dark:bg-[#0E1320]/60 font-sans">
      
      {/* Header bar */}
      <div className="border-b border-slate-100 bg-slate-50/30 p-4.5 flex items-center justify-between dark:border-zinc-850 dark:bg-zinc-900/10">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-teal-500/10 p-2 text-teal-600 dark:bg-teal-950 dark:text-teal-400 border border-teal-500/10">
            <Sparkles className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-950 dark:text-white leading-tight font-display tracking-tight flex items-center gap-2">
              <span>AI Mentor EduPTN</span>
              {localStorage.getItem("utbk_custom_gemini_key") && (
                <span className="text-[8px] font-bold font-mono px-1.8 py-0.2 rounded-full border bg-purple-50 border-purple-200 text-purple-600 dark:bg-purple-950/20 dark:border-purple-800 dark:text-purple-400">
                  Custom Key Active
                </span>
              )}
            </h3>
            <span className="text-[10px] text-gray-400 dark:text-zinc-550 font-bold tracking-wide uppercase font-mono">Bimbingan & Rekomendasi Pintar Pribadi</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setShowKeyConfig(!showKeyConfig)}
            className={`rounded-xl border px-3 py-1.8 cursor-pointer text-[10px] font-bold inline-flex items-center gap-1.5 transition-all active:scale-[0.98] ${
              showKeyConfig 
                ? "bg-zinc-100 border-zinc-300 text-zinc-800 dark:bg-zinc-850 dark:border-zinc-700 dark:text-white"
                : "bg-white border-gray-200 text-gray-500 hover:text-gray-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
            title="Pengaturan API Key"
          >
            <Key className="h-3 w-3" /> API Key
          </button>
          
          <button 
            onClick={handleResetChat}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.8 text-gray-500 hover:text-gray-800 cursor-pointer text-[10px] font-bold inline-flex items-center gap-1.5 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-all active:scale-[0.98]"
            title="Reset Obrolan"
          >
            <RefreshCw className="h-3 w-3" /> Reset Obrolan
          </button>
        </div>
      </div>

      {/* Collapsible API Key settings panel */}
      {showKeyConfig && (
        <div className="bg-slate-50 border-b border-gray-150 p-4 dark:bg-zinc-900/40 dark:border-zinc-850 text-xs animate-fade-in-up">
          <form onSubmit={handleSaveCustomKey} className="space-y-2.5 max-w-lg">
            <div>
              <h4 className="font-bold text-gray-850 dark:text-white mb-0.5">Atur Gemini API Key Kustom Anda</h4>
              <p className="text-[10px] text-gray-400 leading-normal">
                Gunakan API key kustom Anda jika limit gratis platform kami sedang habis/exhausted. Dapatkan key gratis di {" "}
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:underline dark:text-teal-400 font-bold"
                >
                  Google AI Studio
                </a>.
              </p>
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Paste AIzaSy... API Key Anda di sini"
                  value={customKeyInput}
                  onChange={(e) => setCustomKeyInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white pl-3.5 pr-10 py-1.8 font-mono text-[11px] focus:outline-none focus:border-teal-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-450 hover:text-gray-700 dark:hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              <button
                type="submit"
                className="rounded-lg bg-teal-600 px-4 py-1.8 text-white font-bold hover:bg-teal-555 active:scale-98 transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
              >
                <Check className="h-3.5 w-3.5" /> Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Messages area list */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#FBFDFF] dark:bg-[#0E1320]/80 text-xs">
        {messages.map((m, idx) => {
          const isAI = m.role === "model";
          return (
            <div 
              key={idx} 
              className={`flex gap-3 max-w-[85%] ${isAI ? "mr-auto animate-fade-in" : "ml-auto flex-row-reverse"}`}
            >
              <div className={`mt-0.5 rounded-full p-1.5 shrink-0 h-8.5 w-8.5 flex items-center justify-center border shadow-xxs ${
                isAI ? 
                "bg-teal-600 text-white border-teal-500/20" : 
                "bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-850 dark:border-zinc-800 dark:text-white"
              }`}>
                {isAI ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
              </div>

              <div className={`p-4.5 rounded-2xl shadow-xxs font-medium leading-relaxed prose prose-sm dark:prose-invert ${
                isAI ? 
                "bg-white border border-gray-200/80 text-gray-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 rounded-tl-none" : 
                "bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-tr-none shadow-sm shadow-teal-700/5 text-xs text-left"
              }`}>
                {renderFormattedMessage(m.text, isAI)}
              </div>
            </div>
          );
        })}
        
        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="border border-teal-400/20 rounded-full p-2 shrink-0 bg-teal-650 text-white h-8.5 w-8.5 flex items-center justify-center animate-spin">
              <RefreshCw className="h-4.5 w-4.5" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 text-gray-400 dark:bg-zinc-900 dark:border-zinc-800 inline-flex items-center gap-2">
              <span className="dot animate-bounce text-teal-500">●</span>
              <span className="dot animate-bounce delay-100 text-teal-500">●</span>
              <span className="dot animate-bounce delay-200 text-teal-500">●</span>
              <span className="text-[11px] font-bold font-mono tracking-tight text-teal-600/80 dark:text-teal-400/80">AI Mentor sedang merumuskan solusi...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>

      {/* Input controller */}
      <form onSubmit={handleSendMessage} className="border-t border-slate-100 p-4 bg-white dark:border-zinc-850 dark:bg-zinc-950 flex gap-2">
        <input 
          type="text" 
          placeholder="Tanyakan rumus aljabar, sisa waktu snbt, info PTN..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-xs focus:outline-none focus:border-teal-500 dark:bg-zinc-900 dark:border-zinc-850 dark:text-white transition-all focus:ring-2 focus:ring-teal-500/10"
        />
        <button 
          type="submit"
          disabled={!inputText.trim() || loading}
          className="rounded-xl bg-teal-600 px-5.5 text-white font-bold hover:bg-teal-555 active:scale-95 disabled:opacity-35 transition-all duration-200 transform-gpu cursor-pointer group flex items-center justify-center shadow-md shadow-teal-550/10"
        >
          <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </form>

    </div>
  );
}
