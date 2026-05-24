import React, { useState } from "react";
import { Sparkles, Terminal, CheckCircle, Trash2, ShieldAlert, CloudLightning, HelpCircle, ToggleLeft, ToggleRight, Loader } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { MindDumpEntry, MindDumpChecklistItem } from "../types";

interface MindDumpProps {
  userId: string;
  onPlanCreated: (entry: MindDumpEntry) => void;
  previousDumps: MindDumpEntry[];
}

export const MindDump: React.FC<MindDumpProps> = ({ userId, onPlanCreated, previousDumps }) => {
  const [rawText, setRawText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSync, setAutoSync] = useState(true);

  // Focus detail states for an active plan
  const [activePlan, setActivePlan] = useState<MindDumpEntry | null>(
    previousDumps && previousDumps.length > 0 ? previousDumps[0] : null
  );

  const triggerOffloadAnalysis = async () => {
    if (!rawText.trim() || rawText.trim().length < 15) {
      setError("Please write a bit more (at least 15 characters) to help us analyze your tasks.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gemini/mind-dump", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });

      if (!response.ok) {
        throw new Error("Core mind-dump engine had a network hiccup.");
      }

      const rawData = await response.json();
      
      const dumpId = `dump_${Date.now()}`;
      const checklistItems: MindDumpChecklistItem[] = (rawData.actionPlan || []).map((item: any) => ({
        task: item.task || "Mind offload item",
        description: item.description || "Deconstruct this item further.",
        priority: (item.priority === "High" || item.priority === "Medium" || item.priority === "Low") ? item.priority : "Medium",
        completed: false
      }));

      const newEntry: MindDumpEntry = {
        id: dumpId,
        userId,
        rawText,
        clarityPercentage: rawData.clarityPercentage || 65,
        actionPlan: checklistItems,
        createdAt: new Date().toISOString()
      };

      if (autoSync && userId && !userId.startsWith("demo_")) {
        try {
          const mindDumpDocRef = doc(db, "users", userId, "mindDumps", dumpId);
          await setDoc(mindDumpDocRef, newEntry);
        } catch (fErr: any) {
          throw new Error(JSON.stringify({
            code: fErr.code || "unknown",
            message: fErr.message || "Could not write mind dump to Firestore",
            operation: "setDoc"
          }));
        }
      }

      onPlanCreated(newEntry);
      setActivePlan(newEntry);
      setRawText("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChecklistItem = async (itemIndex: number) => {
    if (!activePlan) return;

    const modifiedPlan = { ...activePlan };
    modifiedPlan.actionPlan = modifiedPlan.actionPlan.map((item, idx) => {
      if (idx === itemIndex) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    // Dynamically adjust clarity percentage based on checked off items
    const completedCount = modifiedPlan.actionPlan.filter((a) => a.completed).length;
    const totalCount = modifiedPlan.actionPlan.length;
    const originalClarity = activePlan.clarityPercentage;
    const remainingClarityRange = 100 - originalClarity;
    
    // Add up to remainingClarityRange linearly based on completeness
    modifiedPlan.clarityPercentage = Math.min(
      100,
      Math.round(originalClarity + (totalCount > 0 ? (completedCount / totalCount) * remainingClarityRange : 0))
    );

    setActivePlan(modifiedPlan);

    // Save modified plan
    if (autoSync && userId && !userId.startsWith("demo_")) {
      try {
        const mindDumpDocRef = doc(db, "users", userId, "mindDumps", modifiedPlan.id);
        await setDoc(mindDumpDocRef, modifiedPlan);
      } catch (fErr: any) {
        console.error("Firestore update failed:", fErr);
      }
    }
  };

  const deleteActiveDump = async () => {
    if (!activePlan) return;
    try {
      if (autoSync && userId && !userId.startsWith("demo_")) {
        const mindDumpDocRef = doc(db, "users", userId, "mindDumps", activePlan.id);
        await deleteDoc(mindDumpDocRef);
      }
      setActivePlan(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Offlaod container (Input) */}
      <div className="lg:col-span-6 space-y-4">
        <div className="cyber-glass rounded-2xl p-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent h-1/2 w-full animate-scanline pointer-events-none"></div>

          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-100 flex items-center gap-1.5 font-mono text-sm uppercase">
              <CloudLightning className="w-5 h-5 text-neon-purple animate-pulse" /> Empty Your Mind
            </h3>
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <span>Auto-Sync</span>
              <button
                id="toggle-sync-btn"
                onClick={() => setAutoSync(!autoSync)}
                className="text-neon-purple focus:outline-none"
              >
                {autoSync ? (
                  <ToggleRight className="w-5 h-5 text-neon-purple" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-slate-600" />
                )}
              </button>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Type out whatever is on your mind right now—deadlines, stressful projects, homework, or general worries. Our AI will break it down into an organized, prioritized study plan.
          </p>

          <textarea
            id="minddump-text"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="e.g., I have an exam in 3 days on pathing structures, I haven't completed chapter 4, my visual notes is disorganized, and I keep scrolling on my phone. Plus I need to sync with the research paper groups tonight..."
            rows={8}
            disabled={isLoading}
            className="w-full text-xs p-4 bg-slate-900/60 border border-slate-850 hover:border-slate-800 focus:border-neon-purple rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none transition-all leading-relaxed"
          ></textarea>

          {error && (
            <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-start gap-2">
              <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          <div className="mt-4 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-mono">
              Words/characters: {rawText.length} chars
            </span>
            <button
              id="synthesize-minddump-btn"
              onClick={triggerOffloadAnalysis}
              disabled={isLoading || !rawText.trim()}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-r from-neon-purple to-neon-pink text-slate-950 font-bold uppercase tracking-wider text-xs rounded-xl transition duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin text-slate-950" /> Organizing thoughts...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" /> Create Action Plan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Previous dumps selector list */}
        {previousDumps && previousDumps.length > 0 && (
          <div className="cyber-glass-purple rounded-2xl p-4">
            <span className="block font-mono text-[11px] text-slate-400 uppercase mb-2 tracking-wider">Previous Action Plans</span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
              {previousDumps.map((d) => (
                <button
                  key={d.id}
                  id={`select-dump-${d.id}`}
                  onClick={() => setActivePlan(d)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-sans truncate transition duration-200 ${
                    activePlan?.id === d.id
                      ? "bg-neon-purple/20 border border-neon-purple/40 text-neon-purple font-semibold"
                      : "bg-slate-900/60 border border-slate-850 hover:bg-slate-900 text-slate-350"
                  }`}
                >
                  {d.rawText.substring(0, 50)}...
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Plan Container (Output) */}
      <div className="lg:col-span-6 space-y-4">
        {isLoading ? (
          // Shimmering cyberpunk action plan skeleton loader
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="cyber-glass-purple rounded-2xl p-6 space-y-6 relative overflow-hidden"
          >
            {/* Holographic matrix scan overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent h-1/2 w-full animate-scanline pointer-events-none"></div>
            
            <div className="flex items-center justify-between gap-4 border-b border-slate-900 pb-4">
              <div className="space-y-2">
                <div className="h-3 w-32 bg-purple-950/60 rounded animate-pulse"></div>
                <div className="h-5 w-48 bg-purple-900/40 rounded animate-pulse"></div>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-950/40 animate-pulse"></div>
            </div>

            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 bg-slate-900/30 border border-slate-950 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-purple-950/60 animate-pulse"></div>
                    <div className="h-4 w-40 bg-purple-900/40 rounded animate-pulse"></div>
                    <div className="h-3 w-10 bg-purple-950/60 rounded animate-pulse"></div>
                  </div>
                  <div className="h-3 w-full bg-purple-950/20 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : activePlan ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cyber-glass-purple rounded-2xl p-6 space-y-6 relative"
          >
            {/* Header with Clarity Gauge */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-900 pb-4">
              <div>
                <span className="inline-block px-1.5 py-0.5 bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-[9px] font-mono uppercase rounded">Student Stress Roadmap</span>
                <h3 className="font-bold text-slate-100 font-mono text-sm mt-1 uppercase tracking-wide">AI Organized Study Steps</h3>
              </div>

              {/* Progress Ring percentage */}
              <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="#13141c" strokeWidth="2.5" />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="transparent"
                    stroke="#bd00ff"
                    strokeWidth="2.5"
                    strokeDasharray="100"
                    strokeDashoffset={100 - activePlan.clarityPercentage}
                    className="transition-all duration-500 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xs font-mono font-bold text-neon-purple">{activePlan.clarityPercentage}%</span>
                  <span className="text-[7px] text-slate-500 font-mono uppercase">Clarity</span>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              {activePlan.actionPlan.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleChecklistItem(idx)}
                  className={`p-3.5 border rounded-xl pointer duration-300 cursor-pointer flex gap-3 select-none ${
                    item.completed
                      ? "bg-emerald-950/20 border-emerald-500/30 text-slate-400"
                      : "bg-slate-900/50 hover:bg-slate-900 border-slate-850 hover:border-slate-800"
                  }`}
                >
                  <div className="pt-0.5">
                    <button
                      id={`check-plan-${idx}`}
                      className={`flex items-center justify-center w-5 h-5 rounded-md border flex-shrink-0 transition-colors ${
                        item.completed
                          ? "bg-emerald-500 text-slate-950 border-emerald-400"
                          : "border-slate-700 bg-slate-900 hover:border-neon-purple"
                      }`}
                    >
                      {item.completed && <CheckCircle className="w-4.5 h-4.5 text-slate-950 fill-slate-950" />}
                    </button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold font-mono uppercase tracking-wide ${item.completed ? "line-through" : "text-slate-105"}`}>
                        {item.task}
                      </span>
                      {!item.completed && (
                        <span
                          className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                            item.priority === "High"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : item.priority === "Medium"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          }`}
                        >
                          {item.priority}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${item.completed ? "text-slate-500 line-through" : "text-slate-400"}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Completion trigger */}
            <div className="flex items-center justify-between border-t border-slate-900 pt-4">
              <span className="text-[10px] text-slate-500 font-mono">
                CREATED: {new Date(activePlan.createdAt).toLocaleDateString()}
              </span>
              <button
                id="delete-minddump-btn"
                onClick={deleteActiveDump}
                className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors text-xs font-mono"
              >
                <Trash2 className="w-4 h-4" /> Delete Plan
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 cyber-glass border-slate-900 text-center rounded-2xl min-h-[300px]">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-500 mb-3 animate-pulse">
              <Terminal className="w-6 h-6" />
            </div>
            <h4 className="font-mono text-sm text-slate-300 uppercase mb-1">No Active Study Plan</h4>
            <p className="text-xs text-slate-500 max-w-sm">
              Type your stream of thoughts in the section on the left. We will instantly organize them into a structured checklist map.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
