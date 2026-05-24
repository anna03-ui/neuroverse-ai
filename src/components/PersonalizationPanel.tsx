import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { UserProfile, StudyVibe } from "../types";
import { VIBE_CONFIGS } from "../lib/vibeThemes";
import { VibeAvatar } from "./VibeAvatars";
import {
  Moon,
  Sun,
  Palette,
  Type,
  ImageIcon,
  Check,
  Sparkles,
  Gamepad2,
  Compass,
  Cpu,
  Trophy,
  Coffee,
  Atom,
  Eye,
  Info,
  Layers,
  Save,
  Grid
} from "lucide-react";

interface PersonalizationPanelProps {
  userProfile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

export function PersonalizationPanel({
  userProfile,
  onProfileUpdated
}: PersonalizationPanelProps) {
  // Local active states reflecting database field structure or safe defaults
  const [themeMode, setThemeMode] = useState<"dark" | "light">(
    userProfile.themeMode || "dark"
  );
  const [customTheme, setCustomTheme] = useState<StudyVibe>(
    userProfile.customTheme || userProfile.selectedVibe || "scifi"
  );
  const [fontFamily, setFontFamily] = useState<"futuristic" | "clean" | "rounded" | "sans">(
    userProfile.fontFamily || "futuristic"
  );
  const [dashboardBg, setDashboardBg] = useState<"grid" | "nebula" | "particles" | "minimal" | "cafe" | "arcade">(
    userProfile.dashboardBg || "grid"
  );

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available Theme configurations mapping nicely back to system vibes
  const themeOptions = [
    {
      id: "scifi" as StudyVibe,
      displayName: "Neon Mode",
      desc: "Cyberpunk neon highlights, tech stats, and vibrant focus prompts",
      icon: Cpu,
      color: "from-[#00f0ff] to-blue-600"
    },
    {
      id: "cozy" as StudyVibe,
      displayName: "Cozy Focus",
      desc: "Comforting sounds, slow rain patterns, and gentle encouragement",
      icon: Coffee,
      color: "from-amber-400 to-orange-400"
    },
    {
      id: "anime" as StudyVibe,
      displayName: "Anime Inspired",
      desc: "Sakura petal ambiance, heroic study mode, and inspiring aesthetics",
      icon: Sparkles,
      color: "from-rose-500 to-pink-500"
    },
    {
      id: "minimalist" as StudyVibe,
      displayName: "Minimal Focus",
      desc: "Tranquil zen silence, void aesthetic, and zero distraction overlays",
      icon: Eye,
      color: "from-slate-400 to-slate-100"
    },
    {
      id: "gamer" as StudyVibe,
      displayName: "Gamer Mode",
      desc: "Retro game master interface, interactive quest pings, and dungeon levels",
      icon: Gamepad2,
      color: "from-purple-500 to-cyan-400"
    },
    {
      id: "space" as StudyVibe,
      displayName: "Space Mode",
      desc: "Starfield orbits, cosmic planetary backgrounds, and deep space aesthetics",
      icon: Atom,
      color: "from-indigo-500 to-purple-500"
    }
  ];

  // Font options mapped to CSS styles defined in index.css
  const fontOptions = [
    {
      id: "futuristic" as const,
      name: "Futuristic",
      preview: "NEURAL NETWORK SYSTEM",
      cssClass: "font-futuristic",
      desc: "Monolithic geometric tracking with scifi gaming weight"
    },
    {
      id: "clean" as const,
      name: "Clean Minimal",
      preview: "Inter Mono Sans // Clean Scale",
      cssClass: "font-clean",
      desc: "Highly legible swiss grotesque with spacious kerning"
    },
    {
      id: "rounded" as const,
      name: "Rounded Modern",
      preview: "Warm Soft Rounded UI Layout",
      cssClass: "font-rounded",
      desc: "Organic aesthetic with rounded edges, warm and approachable"
    },
    {
      id: "sans" as const,
      name: "Productivity Sans",
      preview: "Outfit Master Series // Geometric",
      cssClass: "font-productivity",
      desc: "Professional modern editorial sans-serif optimized for reading"
    }
  ];

  // Dashboard backgrounds options
  const backgroundOptions = [
    {
      id: "grid" as const,
      name: "Subtle Grid Pattern",
      desc: "Cybernetic grid framework tracing lines for structural integrity",
      icon: Grid
    },
    {
      id: "nebula" as const,
      name: "Soft Space Nebula",
      desc: "Deep space nebula nebulous rings with fading light pulses",
      icon: Atom
    },
    {
      id: "particles" as const,
      name: "Dynamic Floating Particles",
      desc: "Slow drifting soft atmospheric dots capturing warmth and focus",
      icon: Sparkles
    },
    {
      id: "minimal" as const,
      name: "Clean Minimal Slate",
      desc: "Zero-clutter high-contrast backing for maximum focus",
      icon: Eye
    },
    {
      id: "cafe" as const,
      name: "Cozy Café Warmth",
      desc: "Lo-fi cafe warm candlelights and amber shadows",
      icon: Coffee
    },
    {
      id: "arcade" as const,
      name: "Retro Cyber Arcade",
      desc: "Classic arcade layout scanlines for retro aesthetic styling",
      icon: Gamepad2
    }
  ];

  const handleApplySettings = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);

    const updatedProfile: UserProfile = {
      ...userProfile,
      themeMode,
      selectedVibe: customTheme, // Map selectedVibe instantly to change system audio & tutor config!
      customTheme,
      fontFamily,
      dashboardBg,
      updatedAt: new Date().toISOString()
    };

    try {
      if (userProfile.uid && !userProfile.uid.startsWith("demo_")) {
        // Authenticated users write to Firestore
        const docRef = doc(db, "users", userProfile.uid);
        await updateDoc(docRef, {
          themeMode,
          selectedVibe: customTheme,
          customTheme,
          fontFamily,
          dashboardBg,
          updatedAt: new Date().toISOString()
        });
      }

      // Sync local state as well
      onProfileUpdated(updatedProfile);
      
      // Store in local storage to preserve offline
      localStorage.setItem("neuroverse_preferences", JSON.stringify({
        themeMode,
        customTheme,
        fontFamily,
        dashboardBg
      }));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Firestore settings save error:", err);
      setError("Cloud write bypassed. Preferences synced instantly in current local sandbox session.");
      // Fallback update on local profile anyway so guest experience is pristine!
      onProfileUpdated(updatedProfile);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      
      {/* Introduction Banner */}
      <div className="cyber-glass-glow rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-neon-blue/10 blur-3xl rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-100 font-mono text-xs uppercase flex items-center gap-1.5 text-neon-blue">
              <Palette className="w-4 h-4" /> Settings
            </h3>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-wide font-mono">
              Customize Your Experience
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Tailor NeuroVerse's interface to your study style. Toggle Light/Dark mode, select study themes, load fonts, and choose a dashboard background.
            </p>
          </div>
          <button
            id="apply-settings-btn"
            onClick={handleApplySettings}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-neon-blue to-neon-purple text-slate-950 font-bold font-mono text-xs uppercase tracking-wide rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition duration-200"
          >
            {saving ? (
              <span className="animate-spin">◌</span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>

        {success && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4 animate-bounce" /> Settings saved successfully! Your custom experience preferences are updated.
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl text-xs font-mono">
            💡 {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column - Theme mode, fonts & Backgrounds */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Dark Mode / Light Mode Toggle */}
          <div className="cyber-glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sun className="w-4.5 h-4.5 text-amber-400" />
              <h3 className="font-mono text-xs uppercase font-bold text-slate-100 tracking-wide">
                1. Appearance Mode
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Switch between eye-safe Dark Mode or Light Mode.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                id="toggle-dark-mode"
                onClick={() => setThemeMode("dark")}
                className={`p-4 rounded-xl border transition-all duration-300 text-left flex items-center justify-between group ${
                  themeMode === "dark"
                    ? "bg-slate-900/80 border-neon-blue text-slate-100 shadow-inner"
                    : "border-slate-800 bg-slate-950/20 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${themeMode === "dark" ? "bg-neon-blue/10 text-neon-blue" : "bg-slate-900"}`}>
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-xs font-mono uppercase">Dark Mode</span>
                    <span className="text-[10px] text-slate-500">Perfect for nocturnal sessions</span>
                  </div>
                </div>
                {themeMode === "dark" && <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse"></div>}
              </button>

              <button
                id="toggle-light-mode"
                onClick={() => setThemeMode("light")}
                className={`p-4 rounded-xl border transition-all duration-300 text-left flex items-center justify-between group ${
                  themeMode === "light"
                    ? "bg-white border-neon-purple text-slate-900 shadow-md"
                    : "border-slate-800 bg-slate-950/20 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${themeMode === "light" ? "bg-neon-purple/10 text-neon-purple" : "bg-slate-900"}`}>
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-xs font-mono uppercase">Light Mode</span>
                    <span className="text-[10px] text-slate-500">Ideal for sunny reading spans</span>
                  </div>
                </div>
                {themeMode === "light" && <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse"></div>}
              </button>
            </div>
          </div>

          {/* 2. Selectable UI Fonts */}
          <div className="cyber-glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Type className="w-4.5 h-4.5 text-neon-blue" />
              <h3 className="font-mono text-xs uppercase font-bold text-slate-100 tracking-wide">
                2. Font Style
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Select a sleek, readable typography style that fits your study mood.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {fontOptions.map((opt) => (
                <button
                  key={opt.id}
                  id={`font-opt-${opt.id}`}
                  onClick={() => setFontFamily(opt.id)}
                  className={`p-4 rounded-xl border transition-all duration-300 text-left relative flex flex-col justify-between h-32 ${
                    fontFamily === opt.id
                      ? "bg-slate-900/70 border-neon-blue shadow-inner"
                      : "border-slate-800 bg-slate-950/20 text-slate-400 hover:border-slate-700 hover:bg-slate-950/40"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase font-mono text-slate-300">{opt.name}</span>
                      {fontFamily === opt.id && <Check className="w-4 h-4 text-neon-blue" />}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">{opt.desc}</p>
                  </div>
                  <div className={`p-1 border border-dashed border-slate-700 rounded text-center text-[11px] select-none text-slate-201 text-xs truncate w-full ${opt.cssClass}`}>
                    {opt.preview}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Customizable Dashboard Backgrounds */}
          <div className="cyber-glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4.5 h-4.5 text-neon-purple" />
              <h3 className="font-mono text-xs uppercase font-bold text-slate-100 tracking-wide">
                3. Custom Dashboard Backgrounds
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Set your workspace background with subtle, non-distracting layouts.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {backgroundOptions.map((opt) => {
                const IconComp = opt.icon;
                return (
                  <button
                    key={opt.id}
                    id={`bg-opt-${opt.id}`}
                    onClick={() => setDashboardBg(opt.id)}
                    className={`p-3.5 rounded-xl border transition-all duration-300 text-left relative flex flex-col justify-between gap-3 ${
                      dashboardBg === opt.id
                        ? "bg-slate-900/70 border-neon-purple shadow-inner"
                        : "border-slate-800 bg-slate-950/20 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-1.5 rounded-lg ${dashboardBg === opt.id ? "bg-neon-purple/10 text-neon-purple" : "bg-slate-905"}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      {dashboardBg === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-neon-purple"></div>}
                    </div>
                    <div>
                      <span className="block font-bold text-xs font-mono text-slate-205">{opt.name}</span>
                      <p className="text-[8.5px] text-slate-500 mt-1 uppercase tracking-tight">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right column - Study theme selector & Live Preview widget */}
        <div className="space-y-6">
          
          {/* Customizable Study Themes */}
          <div className="cyber-glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4.5 h-4.5 text-neon-blue animate-spin" />
              <h3 className="font-mono text-xs uppercase font-bold text-slate-100 tracking-wide">
                4. Study Themes
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Align themes, sounds, tips and recommendations with your mood.
            </p>

            <div className="flex flex-col gap-2.5">
              {themeOptions.map((vibe) => {
                return (
                  <button
                    key={vibe.id}
                    id={`theme-opt-${vibe.id}`}
                    onClick={() => setCustomTheme(vibe.id)}
                    className={`p-3.5 rounded-xl border transition-all duration-300 text-left flex items-start justify-between gap-3 ${
                      customTheme === vibe.id
                        ? "bg-slate-900/80 border-cyan-400 shadow-md"
                        : "border-slate-800 bg-slate-950/15 text-slate-400 hover:border-slate-750"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-950/90 border border-slate-850 flex items-center justify-center p-1 flex-shrink-0">
                        <VibeAvatar vibe={vibe.id} className="w-9 h-9" />
                      </div>
                      <div className="space-y-1">
                        <span className="block font-bold text-xs font-mono text-slate-201 uppercase tracking-wide">
                          {vibe.displayName}
                        </span>
                        <p className="text-[10px] text-slate-500 leading-snug">{vibe.desc}</p>
                      </div>
                    </div>
                    {customTheme === vibe.id && <div className="w-3.5 h-3.5 rounded-full bg-[#00f0ff] p-0.5 mt-1"><Check className="w-full h-full text-slate-950 font-black h-2.5 w-2.5" /></div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Realtime Live preview */}
          <div className="cyber-glass rounded-2xl p-6 space-y-4">
            <h3 className="font-mono text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
              Live CSS Preview <span>OS v3.5</span>
            </h3>

            <div className={`p-4 border border-dashed border-slate-700/60 rounded-xl space-y-3 relative overflow-hidden bg-slate-950 ${themeMode === "light" ? "bg-white text-slate-900 border-slate-300" : "bg-slate-950 text-slate-100"}`}>
              <div className="flex items-center justify-between border-b pb-1.5 border-slate-800">
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500">NeuroVerse AI UI Sandbox</span>
                <span className="px-1.5 py-0.5 rounded bg-orange-400/10 text-orange-400 text-[8px] font-mono">LIVE PREVIEW</span>
              </div>
              
              <div className="space-y-1.5">
                <h4 className={`text-base font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r ${VIBE_CONFIGS[customTheme]?.gradientAccent || "from-neon-blue to-neon-purple"} ${fontOptions.find(f => f.id === fontFamily)?.cssClass}`}>
                  NeuroVerse Academic Core
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  The quick brown fox jumps over the lazy dog. Welcome to the studyverse.
                </p>
              </div>

              <div className="flex gap-2 font-mono text-[9px]">
                <span className="px-2 py-0.5 rounded bg-slate-905 border border-slate-800 select-none uppercase">
                  Bg: {dashboardBg.toUpperCase()}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-905 border border-slate-800 select-none uppercase">
                  Font: {fontOptions.find(f => f.id === fontFamily)?.name}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
