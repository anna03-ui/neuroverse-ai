import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, Terminal, Volume2, Bot } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChatMessage, StudyVibe } from "../types";
import { VIBE_CONFIGS } from "../lib/vibeThemes";
import { VibeAvatar, VIBE_MASCOT_INFO } from "./VibeAvatars";

interface AICompanionProps {
  currentVibe?: string;
  userDisplayName?: string;
}

export const AICompanion: React.FC<AICompanionProps> = ({ currentVibe = "scifi", userDisplayName = "Scholar" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeVibe = (currentVibe as StudyVibe) || "scifi";
  const config = VIBE_CONFIGS[activeVibe] || VIBE_CONFIGS["scifi"];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTip, setCurrentTip] = useState("Focus on 25-minute sprints. Your brain is ready to learn today!");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Synchronize AI Companion Welcome dialog when switching vibes
  useEffect(() => {
    const config = VIBE_CONFIGS[activeVibe] || VIBE_CONFIGS["scifi"];
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Greetings, ${userDisplayName}! I have initialized as **${config.companionName}** attuned with your **${config.name}** environment.\n\n*"${config.companionAvatarGreeting}"*`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, [currentVibe, userDisplayName]);

  useEffect(() => {
    // Cycle tips every 45 seconds based on vibe
    const vibeTips = config?.companionTips || ["Focus on 25-minute sprints. Your brain is ready to learn today!"];
    let idx = 0;
    setCurrentTip(vibeTips[0]);

    const interval = setInterval(() => {
      idx = (idx + 1) % vibeTips.length;
      setCurrentTip(vibeTips[idx]);
    }, 45000);

    return () => clearInterval(interval);
  }, [currentVibe]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/study-verse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          currentVibe: currentVibe,
        }),
      });

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        role: "assistant",
        content: data.text,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `msg-bot-err-${Date.now()}`,
        role: "assistant",
        content: "Core connection lost. Focus locally and let's re-align.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Orb Activator with custom active mascot avatar */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              onClick={() => setIsOpen(true)}
              className="relative group cursor-pointer"
            >
              {/* Pulsing Backglow customized to active vibe */}
              <div className={`absolute -inset-1.5 bg-gradient-to-r ${config.gradientAccent} rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-300 ${config.pulsingRate}`}></div>
              
              <button
                id="ai-companion-btn"
                className={`relative flex items-center justify-center w-14 h-14 bg-slate-900 border ${config.borderAccentMuted} rounded-full hover:${config.borderAccent} text-slate-100 transition-all duration-300 shadow-xl overflow-hidden`}
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <VibeAvatar vibe={activeVibe} className="w-10 h-10 object-contain" />
                </div>
                
                {/* Visual indicator of energy matching the vibe */}
                <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-gradient-to-r ${config.gradientAccent} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 bg-gradient-to-r ${config.gradientAccent}`}></span>
                </span>
              </button>

              {/* Hover tooltip with active cosmic tip */}
              <div className="absolute right-16 bottom-2 w-64 bg-slate-900/95 border border-slate-800 p-2.5 rounded-lg text-xs leading-relaxed text-slate-350 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-2xl">
                <div className={`font-mono text-[11px] font-bold mb-0.5 flex items-center gap-1 ${config.accentText}`}>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> {config.companionName} Tips:
                </div>
                "{currentTip}"
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Chat Container Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100 }}
            className={`fixed bottom-6 right-6 z-50 w-96 h-[510px] bg-slate-950/95 border ${config.borderAccentMuted} shadow-2xl shadow-slate-950/80 rounded-2xl flex flex-col overflow-hidden text-sm`}
          >
            {/* Glass Scanline decoration */}
            <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-1/2 w-full animate-scanline pointer-events-none`}></div>

            {/* Header */}
            <div className={`px-4 py-3 bg-slate-900/95 border-b ${config.borderAccentMuted} flex items-center justify-between`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                  <VibeAvatar vibe={activeVibe} className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 tracking-wide font-mono text-xs uppercase flex items-center gap-1.5">
                    {config.companionName}
                  </h3>
                  <p className="text-[9px] text-slate-400 font-mono tracking-wider">
                    {VIBE_MASCOT_INFO[activeVibe]?.role.toUpperCase() || "DIGITAL AUXILIARY RESOURCE"}
                  </p>
                </div>
              </div>
              <button
                id="close-ai-btn"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Micro banner for quick study feedback */}
            <div className={`px-4 py-1.5 border-b ${config.borderAccentMuted} bg-slate-900/50 text-[11px] flex items-center gap-1.5 font-mono ${config.accentText}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <marquee scrollamount="2.5" className="cursor-default">"{currentTip}"</marquee>
            </div>

            {/* Chats Container */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40 relative"
            >
              {/* Mascot Info Card at the beginning of chat */}
              <div className={`p-3.5 rounded-xl bg-slate-900/70 border ${config.borderAccentMuted} mb-3 flex items-start gap-3`}>
                <div className="w-10 h-10 rounded-lg bg-slate-950/90 flex items-center justify-center p-1 self-start">
                  <VibeAvatar vibe={activeVibe} className="w-8 h-8" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className={`text-[11px] font-mono font-bold uppercase tracking-wider ${config.accentText}`}>
                    CONCEIVED MASCOT PROFILE // {config.companionName}
                  </h4>
                  <p className="text-[10px] text-slate-355 leading-relaxed">
                    <strong>Specialty:</strong> {VIBE_MASCOT_INFO[activeVibe]?.specialty || "Cognitive pacing and focus monitoring."}
                  </p>
                  <p className="text-[9.5px] text-slate-450 italic">
                    "{config.companionAvatarGreeting}"
                  </p>
                </div>
              </div>

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} items-start gap-2`}
                >
                  {m.role !== "user" && (
                    <div className="w-6 h-6 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
                      <VibeAvatar vibe={activeVibe} className="w-5 h-5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed font-sans shadow-sm ${
                      m.role === "user"
                        ? `bg-gradient-to-r ${config.gradientAccent} text-slate-950 font-bold rounded-br-none shadow-md shadow-slate-950/35`
                        : "bg-slate-900/90 text-slate-200 border border-slate-800/80 rounded-bl-none"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    <span className={`block text-[8px] text-right mt-1 font-mono ${m.role === "user" ? "text-slate-900/80" : "text-slate-500"}`}>
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start items-start gap-2">
                  <div className="w-6 h-6 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
                    <VibeAvatar vibe={activeVibe} className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="bg-slate-900/80 text-slate-400 border border-slate-800 rounded-xl rounded-bl-none px-4 py-2.5 text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    <span className="text-[10px] font-mono text-cyan-400/80">Conducting matrix scan...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-slate-950 border-t border-slate-900/80 flex items-center gap-2"
            >
              <input
                id="ai-chat-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Ask ${config.companionName} something...`}
                className={`flex-1 bg-slate-900/80 text-slate-200 border border-slate-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:${config.borderAccent} focus:ring-1 focus:ring-slate-800 transition-all font-sans placeholder-slate-500`}
              />
              <button
                id="send-ai-chat"
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={`flex items-center justify-center p-2 rounded-xl bg-gradient-to-r ${config.gradientAccent} hover:opacity-90 text-dark-bg transition-all disabled:opacity-45 disabled:cursor-not-allowed`}
              >
                <Send className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
