import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCw, Trophy, Zap, Clock, ShieldCheck, Flame, Medal, Award, Volume2, VolumeX } from "lucide-react";
import { db } from "../firebase";
import { focusAudioInstance } from "../lib/focusAudioEngine";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { StudyVibe, UserProfile } from "../types";
import { VIBE_CONFIGS } from "../lib/vibeThemes";
import { VibeAvatar, VibeArtwork, VIBE_MASCOT_INFO } from "./VibeAvatars";

interface StudyVerseProps {
  userProfile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
  onDailyMissionComplete?: (title: string, xp?: number) => void;
}

export const StudyVerse: React.FC<StudyVerseProps> = ({ userProfile, onProfileUpdated, onDailyMissionComplete }) => {
  // Timer settings
  const [timerDuration, setTimerDuration] = useState(15 * 60); // 15 minutes by default
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [earnedAnimation, setEarnedAnimation] = useState(false);

  // Gamified Study Missions list
  const [missions, setMissions] = useState([
    { id: "m1", title: "Start focused session", target: "Complete first study sprint", xp: 50, completed: false },
    { id: "m2", title: "Complete study diagnostic", target: "Take the BrainMirror Assessment", xp: 75, completed: false },
    { id: "m3", title: "Create action checklist", target: "Generate 1 MindDump checklist plan", xp: 60, completed: false }
  ]);

  // Handle ticking timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      triggerSessionReward(55); // +55XP for completing session!
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft]);

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    // Sync React state with instance on mount
    setIsAudioPlaying(focusAudioInstance.getIsActive());
    
    return () => {
      // Unmount cleanup - safely stop any active continuous sweep sound generator
      focusAudioInstance.stop();
    };
  }, []);

  const handleToggleAudio = () => {
    if (isAudioPlaying) {
      focusAudioInstance.stop();
      setIsAudioPlaying(false);
    } else {
      focusAudioInstance.start(userProfile.selectedVibe);
      setIsAudioPlaying(true);
    }
  };

  // Change environment theme vibe
  const handleVibeChange = async (vibe: StudyVibe) => {
    const updated = { ...userProfile, selectedVibe: vibe };
    onProfileUpdated(updated);

    // Dynamic transition: adjust the active soundscape live matching the newly selected vibe theme!
    if (isAudioPlaying) {
      focusAudioInstance.start(vibe);
    }

    // Save choice to database (bypass for guests)
    try {
      if (userProfile.uid && !userProfile.uid.startsWith("demo_")) {
        const userRef = doc(db, "users", userProfile.uid);
        await updateDoc(userRef, { selectedVibe: vibe });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Claim mission reward
  const claimMissionXP = async (missionId: string, customXP: number) => {
    const targetMission = missions.find((m) => m.id === missionId);
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, completed: true } : m))
    );
    await triggerSessionReward(customXP);
    if (onDailyMissionComplete) {
      onDailyMissionComplete(targetMission ? targetMission.title : "Daily Mission Completed", customXP);
    }
  };

  // Helper reward state increment
  const triggerSessionReward = async (earnedXP: number) => {
    setEarnedAnimation(true);
    setTimeout(() => setEarnedAnimation(false), 3000);

    const totalXP = userProfile.xp + earnedXP;
    const levelModifier = Math.floor(totalXP / 200) + 1;
    
    // Save to user Profile and lift components
    const updatedProfile: UserProfile = {
      ...userProfile,
      xp: totalXP,
      level: levelModifier
    };

    onProfileUpdated(updatedProfile);

    try {
      if (userProfile.uid && !userProfile.uid.startsWith("demo_")) {
        const userRef = doc(db, "users", userProfile.uid);
        await updateDoc(userRef, {
          xp: totalXP,
          level: levelModifier
        });
      }
    } catch (e) {
      console.error("Failed to persist reward:", e);
    }
  };

  // Quick reset / interval adjustments
  const adjustTimer = (mins: number) => {
    setTimerDuration(mins * 60);
    setTimeLeft(mins * 60);
    setIsTimerRunning(false);
  };

  const getFormattedTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const config = VIBE_CONFIGS[userProfile.selectedVibe] || VIBE_CONFIGS["scifi"];

  return (
    <div className="space-y-6">
      
      {/* Visual background gradient block based on active vibe environment setup */}
      <div className={`rounded-2xl bg-gradient-to-br ${config.bgGradient} border ${config.borderAccent} p-1 transition-all duration-700 relative overflow-hidden flex flex-col shadow-2xl`}>
        {/* Floating background ambient grids and particles */}
        <div className="absolute inset-x-0 bottom-0 top-0 bg-grid-white/[0.015] bg-[size:30px_30px] pointer-events-none"></div>
        <div className={`absolute -top-20 -left-20 w-80 h-80 ${config.ambientGlowColor} rounded-full filter blur-[100px] pointer-events-none animate-pulse`}></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 md:p-6 relative z-10 w-full">
          {/* LEFT COLUMN: Character-Inspired Study Companion details */}
          <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-block px-3 py-1 rounded-full bg-slate-950/80 border ${config.borderAccentMuted} text-[9.5px] font-mono font-bold uppercase tracking-widest ${config.accentText}`}>
                  {config.motivationalCards.tag}
                </span>
                <span className="text-[10px] font-mono text-slate-400 tracking-wider">
                  SYSTEM READY: 100% ONLINE
                </span>
              </div>
              
              <div className="flex items-start gap-3 md:gap-4">
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-900 border ${config.borderAccent} shadow-xl flex items-center justify-center relative overflow-hidden p-1 shrink-0`}>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-scanline pointer-events-none"></div>
                  <VibeAvatar vibe={userProfile.selectedVibe} className="w-12 h-12 md:w-14 md:h-14" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg md:text-xl font-extrabold text-slate-100 tracking-tight font-mono uppercase">
                      {config.companionName}
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                    {VIBE_MASCOT_INFO[userProfile.selectedVibe]?.role}
                  </p>
                </div>
              </div>

              <div className="relative p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 mt-1">
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{config.companionAvatarGreeting}"
                </p>
                <div className={`absolute -bottom-1 right-3 text-[9px] font-mono font-bold uppercase tracking-wider ${config.accentText} px-2 bg-[#020617] rounded-md border ${config.borderAccentMuted}`}>
                  MASCOT ADVICE
                </div>
              </div>
            </div>

            {/* Custom advice and motivation fields changing dynamically with active vibe */}
            <div className="pt-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                {config.motivationalCards.adviceHeader}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {config.motivationalCards.adviceDescription}
              </p>
            </div>

            {/* Premium Dynamic Ambient Soundscape Controller */}
            <div className={`p-3 rounded-xl bg-slate-950/70 border ${config.borderAccentMuted} flex flex-col sm:flex-row items-center justify-between gap-3 mt-2`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg bg-slate-900 border ${config.borderAccentMuted} flex items-center justify-center text-slate-100 select-none shrink-0`}>
                  {isAudioPlaying ? (
                    <Volume2 className={`w-4 h-4 ${config.accentText} animate-pulse`} />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div className="text-left">
                  <h4 className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-wider">
                    COGNITIVE ACOUSTICS
                  </h4>
                  <p className="text-[9.5px] text-slate-400 font-medium">
                    {isAudioPlaying 
                      ? `Synthesizing live: ${config.name.split(' ')[0]} Ambient` 
                      : "Procedural sound generator offline"}
                  </p>
                </div>
              </div>
              
              <button
                id="toggle-ambient-audio"
                onClick={handleToggleAudio}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 shrink-0 cursor-pointer ${
                  isAudioPlaying
                    ? `bg-gradient-to-r ${config.gradientAccent} text-slate-950 hover:shadow-lg`
                    : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100"
                }`}
              >
                {isAudioPlaying ? "Mute Acoustics" : "Enable Ambient Sounds"}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Splendid Landscape Scenery / Aesthetic artwork */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className={`relative rounded-xl border ${config.borderAccentMuted} overflow-hidden bg-slate-950 aspect-[16/8] shadow-inner`}>
              {/* Scanline overlay for cybernetic lens */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent h-1/2 w-full animate-scanline pointer-events-none z-10"></div>
              {/* Vibe Artwork */}
              <VibeArtwork vibe={userProfile.selectedVibe} className="w-full h-full object-cover" />
              
              <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-slate-950/80 border border-slate-900/80 px-2.5 py-1.5 rounded-lg text-[10px] text-slate-300 backdrop-blur-sm z-20 flex justify-between items-center">
                <span className="font-mono text-slate-400">PERSPECTIVE // SCENE</span>
                <span className={`font-mono font-bold ${config.accentText}`}>{config.name.toUpperCase()}</span>
              </div>
            </div>

            {/* Quote of the vibe theme */}
            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-900 text-center relative">
              <p className="text-xs italic text-slate-350 leading-relaxed font-sans font-medium">
                "{config.motivationalCards.quote}"
              </p>
            </div>
          </div>
        </div>

        {/* STUDY VIBE RAPID SELECTORS FOOTER BAR */}
        <div className="px-5 py-3 bg-slate-900/40 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
            CHOOSE AN ENVIRONMENT CALIBRATION:
          </span>
          
          <div className="grid grid-cols-2 xs:flex xs:flex-wrap sm:flex items-center gap-2 w-full sm:w-auto">
            {(["anime", "gamer", "scifi", "cozy", "superhero", "minimalist"] as StudyVibe[]).map((vibe) => {
              const vibeInfo = VIBE_CONFIGS[vibe];
              const isActive = userProfile.selectedVibe === vibe;
              return (
                <button
                  key={vibe}
                  id={`select-vibe-${vibe}`}
                  onClick={() => handleVibeChange(vibe)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] uppercase font-mono tracking-wider border transition-all duration-300 flex items-center gap-1.5 ${
                    isActive
                      ? `bg-gradient-to-r ${vibeInfo.gradientAccent} text-slate-950 font-black shadow-md border-transparent scale-105`
                      : "bg-slate-950/60 hover:bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                    <VibeAvatar vibe={vibe} className="w-3.5 h-3.5" isAnimated={isActive} />
                  </span>
                  <span>{vibeInfo.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Claim Rewards Popup */}
        {earnedAnimation && (
          <div className="absolute top-4 right-4 bg-emerald-500 text-slate-950 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold font-mono shadow-lg border border-emerald-400 animate-bounce z-30">
            <Trophy className="w-4 h-4 fill-slate-950 animate-bounce" /> +{config.xpShort} XP COMPLETED!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Virtual Study Timer Grid Card */}
        <div className="lg:col-span-5 cyber-glass rounded-2xl p-6 flex flex-col items-center justify-center text-center relative">
          <div className="absolute top-4 left-4 flex items-center gap-1 text-[10px] font-mono text-slate-400 uppercase">
            <Clock className="w-4 h-4 text-neon-blue" /> Study Timer
          </div>

          {/* Slices buttons */}
          <div className="flex gap-2.5 mt-4 mb-6">
            <button
              id="set-timer-15"
              onClick={() => adjustTimer(15)}
              className="px-2.5 py-1 text-[10px] font-mono border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-350 hover:text-slate-100 rounded-md transition duration-200"
            >
              15m Sprint
            </button>
            <button
              id="set-timer-25"
              onClick={() => adjustTimer(25)}
              className="px-2.5 py-1 text-[10px] font-mono border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-350 hover:text-slate-100 rounded-md transition duration-200"
            >
              25m Focus
            </button>
            <button
              id="set-timer-45"
              onClick={() => adjustTimer(45)}
              className="px-2.5 py-1 text-[10px] font-mono border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-350 hover:text-slate-100 rounded-md transition duration-200"
            >
              45m Heavy
            </button>
          </div>

          {/* Main Huge countdown readout */}
          <div className="relative py-4">
            <h1 className="text-6xl font-extrabold tracking-widest font-mono text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-cyan-300 to-neon-purple drop-shadow-lg select-none">
              {getFormattedTime()}
            </h1>
            <div className="h-0.5 bg-gradient-to-r from-neon-blue/10 via-[#00f0ff]/30 to-neon-blue/10 w-4/5 mx-auto mt-2"></div>
          </div>

          {/* Interactive controls */}
          <div className="flex gap-4 mt-6">
            <button
              id="timer-play-pause"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition duration-300 font-bold ${
                isTimerRunning
                  ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                  : "bg-gradient-to-r from-neon-blue to-neon-purple text-slate-950 hover:cyber-glow-blue"
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-4 h-4 text-slate-950 fill-slate-950" /> PAUSE
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-slate-950 fill-slate-950" /> START TIMER
                </>
              )}
            </button>

            <button
              id="timer-reset"
              onClick={() => adjustTimer(timerDuration / 60)}
              className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-full text-slate-400 hover:text-slate-100 transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[10px] text-slate-500 font-mono mt-4 leading-relaxed max-w-xs">
            Completed countdowns instantly grant +55 XP and rank levels are updated securely to your account.
          </p>
        </div>

        {/* Gamified Productivity Missions */}
        <div className="lg:col-span-7 cyber-glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div>
              <h3 className="font-bold text-slate-100 font-mono text-sm uppercase flex items-center gap-1.5">
                <Medal className="w-5 h-5 text-neon-blue animate-pulse" /> DAILY STUDY GOALS
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">Gain Experience Points (XP) to raise your student rank and level up.</p>
            </div>
            
            {/* Short tracker of user stats preview */}
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <div className="font-mono text-[10px] leading-tight text-right">
                <div className="text-slate-350 uppercase">STREAK</div>
                <div className="text-slate-100 font-bold">{userProfile.streak} DAY STREAK</div>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            {missions.map((m) => (
              <div
                key={m.id}
                className={`p-4 border rounded-xl flex items-center justify-between transition duration-200 ${
                  m.completed
                    ? "bg-slate-950/40 border-slate-950 text-slate-500"
                    : "bg-slate-900/30 border-slate-850 hover:bg-slate-900/60"
                }`}
              >
                <div className="space-y-1">
                  <span className="block text-[11px] font-bold text-slate-205 tracking-wide font-sans">{m.title}</span>
                  <span className="block text-xs text-slate-400">{m.target}</span>
                </div>

                <div>
                  {m.completed ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      <ShieldCheck className="w-3.5 h-3.5" /> claimed
                    </span>
                  ) : (
                    <button
                      id={`claim-${m.id}`}
                      onClick={() => claimMissionXP(m.id, m.xp)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border ${config.borderAccentMuted} text-slate-100 hover:bg-gradient-to-r ${config.gradientAccent} hover:text-slate-950 transition-all duration-300 font-mono text-xs font-bold uppercase tracking-wide`}
                    >
                      +{m.xp} {config.xpShort} claim
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic XP tracker bar representation */}
          <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Award className={`w-4 h-4 ${config.accentText}`} /> Rank level: <strong className={config.accentText}>{userProfile.level}</strong>
              </span>
              <span className="text-slate-200 font-bold">{config.xpName}: {userProfile.xp} / {userProfile.level * 200}</span>
            </div>
            
            {/* Progress segment */}
            <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${config.gradientAccent} transition-all duration-500`}
                style={{ width: `${Math.min(100, (userProfile.xp / (userProfile.level * 200)) * 100)}%` }}
              ></div>
            </div>
            <p className="text-[9px] text-slate-500 text-right font-mono">{config.xpName} scores are synchronized securely with the NeuroVerse DB</p>
          </div>

        </div>

      </div>

    </div>
  );
};
