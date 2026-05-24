import React, { useState, useEffect } from "react";
import { AlertCircle, Timer, ShieldAlert, Sparkles, CheckCircle2, RefreshCw, Send, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ExamSprintState, ExamSprintTask } from "../types";

interface ExamSprintProps {
  userId: string;
}

export const ExamSprint: React.FC<ExamSprintProps> = () => {
  const [examTopic, setExamTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Core Exam Sprint prep state
  const [sprintState, setSprintState] = useState<ExamSprintState | null>(null);

  // Simulated countdown interval
  const [countdown, setCountdown] = useState({ h: 14, m: 59, s: 47 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        let s = prev.s - 1;
        let m = prev.m;
        let h = prev.h;

        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }
        if (h < 0) {
          h = 0;
          m = 0;
          s = 0;
          clearInterval(interval);
        }

        return { h, m, s };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const triggerEmergencySynthesis = async () => {
    if (!examTopic.trim()) {
      setError("Please enter an exam subject description (e.g. Advanced Biology midterms).");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gemini/exam-sprint-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examTopic })
      });

      if (!response.ok) {
        throw new Error("The exam prep service timed out. Please try again.");
      }

      const rawData = await response.json();

      const tasks: ExamSprintTask[] = (rawData.roadmap || []).map((t: any) => ({
        topic: t.topic || "Core revision topic",
        timeMinutes: t.timeMinutes || 30,
        priority: (t.priority === "Critical" || t.priority === "High" || t.priority === "Normal") ? t.priority : "High",
        description: t.description || "Synthesize material from syllabus notes.",
        completed: false
      }));

      const newState: ExamSprintState = {
        topic: examTopic,
        syllabusCompletionReady: rawData.syllabusCompletionReady || 60,
        roadmap: tasks,
        quickFireStrategy: rawData.quickFireStrategy || "Focus on primary theorems first.",
        createdAt: new Date().toISOString()
      };

      setSprintState(newState);
      setExamTopic("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskCompleted = (idx: number) => {
    if (!sprintState) return;

    const updatedRoadmap = sprintState.roadmap.map((task, i) => {
      if (i === idx) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });

    const completedCount = updatedRoadmap.filter((t) => t.completed).length;
    const totalCount = updatedRoadmap.length;
    const originalReady = sprintState.syllabusCompletionReady;
    const remainingReadyRange = 100 - originalReady;

    const progressIncrease = totalCount > 0 ? (completedCount / totalCount) * remainingReadyRange : 0;

    setSprintState({
      ...sprintState,
      roadmap: updatedRoadmap,
      syllabusCompletionReady: Math.min(100, Math.round(originalReady + progressIncrease))
    });
  };

  const formattedCountdown = () => {
    const hh = countdown.h.toString().padStart(2, "0");
    const mm = countdown.m.toString().padStart(2, "0");
    const ss = countdown.s.toString().padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Immersive Warning Banner block */}
      <div className="bg-rose-500/10 border border-rose-500/30 p-4.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-500/15 rounded-full border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0 animate-pulse">
            <ShieldAlert className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-500 text-slate-950 font-mono text-[9px] uppercase px-1.5 py-0.5 rounded font-bold animate-pulse">
                Exam Mode Active
              </span>
              <span className="text-slate-400 font-mono text-xs">HIGH FOCUS ZONE</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
              Minimize all distractions. Time is valuable and your productivity multipliers are active.
            </p>
          </div>
        </div>

        {/* Huge glowing alarm clock countdown */}
        <div className="bg-slate-905 border border-rose-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
          <Timer className="w-5 h-5 text-rose-500 animate-spin" style={{ animationDuration: "10s" }} />
          <div className="font-mono text-center">
            <span className="block text-[8px] text-zinc-500 uppercase tracking-widest font-semibold">T-Minus to Exam Session</span>
            <span className="block text-sm font-bold text-rose-400 tracking-widest">{formattedCountdown()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Search Engine core input */}
        <div className="lg:col-span-5 cyber-glass rounded-2xl p-6 h-fit space-y-4">
          <span className="inline-block px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-rose-400 uppercase font-semibold">
            Instant Exam Prep
          </span>
          <h3 className="font-bold text-slate-100 font-mono text-sm uppercase">Create Rapid Exam Prep Plan</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Short on time? Enter your exam topics, draft outline or syllabus. Gemini will compile optimized, high-yield study sessions in seconds.
          </p>

          <div className="space-y-3.5">
            <textarea
              id="examsprint-topic-input"
              value={examTopic}
              onChange={(e) => setExamTopic(e.target.value)}
              placeholder="e.g., Organic chemistry pathways (Sn1/Sn2 mechanisms), tomorrow at 9am. I need a rapid strategy to memorize functional group behaviors..."
              rows={4}
              disabled={isLoading}
              className="w-full text-xs p-3.5 bg-slate-900 border border-slate-850 focus:border-rose-500/50 text-slate-200 placeholder-slate-500 focus:outline-none rounded-xl transition-all"
            ></textarea>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                <div>{error}</div>
              </div>
            )}

            <button
              id="synthesize-sprint-btn"
              onClick={triggerEmergencySynthesis}
              disabled={isLoading || !examTopic.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 hover:opacity-95 font-bold uppercase tracking-wider text-xs rounded-xl transition duration-300 disabled:opacity-45 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> CREATING EXAM SPRINT ROADMAP...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" /> ACTIVATE ROADMAP
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sprint analysis roadmap result */}
        <div className="lg:col-span-7">
          {isLoading ? (
            // Shimmering cyberpunk exam roadmap skeleton loader
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="cyber-glass rounded-2xl p-6 space-y-5 relative overflow-hidden"
            >
              {/* Holographic scan overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-500/10 to-transparent h-1/2 w-full animate-scanline pointer-events-none"></div>
              
              <div className="bg-slate-950/60 p-4 border border-rose-500/10 rounded-xl space-y-2">
                <div className="h-3 w-40 bg-rose-950/40 rounded animate-pulse"></div>
                <div className="h-2 bg-slate-900 rounded-full w-full overflow-hidden">
                  <div className="h-full bg-rose-950/60 rounded animate-pulse w-2/3"></div>
                </div>
              </div>

              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 bg-slate-900/30 border border-slate-950 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-rose-950/60 animate-pulse"></div>
                      <div className="h-4 w-44 bg-rose-900/40 rounded animate-pulse"></div>
                      <div className="h-3 w-12 bg-rose-950/40 rounded animate-pulse"></div>
                    </div>
                    <div className="h-3 w-5/6 bg-rose-950/20 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : sprintState ? (
            <div className="cyber-glass rounded-2xl p-6 space-y-5 relative">
              {/* completeness gauge */}
              <div className="bg-slate-950/60 p-4 border border-rose-500/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-rose-400/90 font-bold uppercase flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" /> Exam Prep Meter: {sprintState.syllabusCompletionReady}%
                  </span>
                  <span className="text-slate-400">Study target: 100% completed</span>
                </div>
                
                {/* Progress */}
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-500"
                    style={{ width: `${sprintState.syllabusCompletionReady}%` }}
                  ></div>
                </div>
              </div>

              {/* Roadmap list */}
              <div className="space-y-3">
                <span className="block font-mono text-[10px] text-slate-400 uppercase tracking-widest pl-1">Priority Checklist</span>
                {sprintState.roadmap.map((task, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleTaskCompleted(idx)}
                    className={`p-3 border rounded-xl cursor-pointer select-none transition duration-300 flex items-start gap-3 ${
                      task.completed
                        ? "bg-emerald-950/10 border-emerald-500/20 text-slate-500"
                        : "bg-slate-900/50 hover:bg-slate-900 border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    <button
                      id={`check-sprint-${idx}`}
                      className={`w-5 h-5 rounded-md border text-slate-950 flex-shrink-0 flex items-center justify-center transition-colors mt-0.5 ${
                        task.completed
                          ? "bg-emerald-500 border-emerald-400"
                          : "bg-slate-950 border-slate-800"
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-4.5 h-4.5 text-slate-950 fill-slate-950" />}
                    </button>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold font-mono tracking-wide ${task.completed ? "line-through text-slate-500" : "text-slate-100"}`}>
                          {task.topic}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded uppercase font-bold">
                          {task.timeMinutes} MIN
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-950 text-slate-400 border border-slate-850 rounded uppercase font-bold">
                          {task.priority}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${task.completed ? "text-slate-500 line-through" : "text-slate-400"}`}>
                        {task.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Fire Strategy tip */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-xs rounded-xl leading-relaxed text-amber-200">
                <strong className="font-mono text-[10px] block uppercase text-amber-400 tracking-wide mb-1">AI Rapid Summary & Tactics:</strong>
                "{sprintState.quickFireStrategy}"
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 cyber-glass border-slate-900 text-center rounded-2xl min-h-[300px]">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mb-3 animate-pulse">
                <Timer className="w-6 h-6 text-rose-400/80" />
              </div>
              <h4 className="font-mono text-sm text-slate-300 uppercase mb-1">No Exam Sprint Roadmap Active</h4>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Fill out the focus fields on the left to generate high-stakes practice roadmaps instantly.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
