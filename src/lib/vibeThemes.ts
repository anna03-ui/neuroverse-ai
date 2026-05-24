import { StudyVibe } from "../types";

export interface VibeBadge {
  id: string;
  title: string;
  description: string;
  iconName: "Shield" | "Sparkles" | "Coffee" | "Zap" | "Award" | "Target" | "Gem" | "Compass" | "Activity" | "Eye" | "Crown";
  colorClass: string;
}

export interface VibeThemeConfig {
  name: string;
  className: string;
  // Styling
  gradientAccent: string; // e.g. "from-rose-500 to-pink-500"
  sidebarActiveStyle: string; // styling for active state in sidebar
  glowShadow: string;
  accentText: string;
  borderAccent: string;
  borderAccentMuted: string;
  pulsingRate: string; // animate-pulse frequency or style

  // Background and Wallpapers decoration
  bgGradient: string; // high-quality dashboard background
  bgPatternOverlay: string; // CSS pattern classes or dynamic particles type
  ambientGlowColor: string; // class for the floating orb in dashboard background

  // Terminology
  xpName: string;
  xpShort: string;

  // AI Companion
  companionName: string;
  companionAvatarGreeting: string;
  companionPersonalityPrompt: string;
  companionTips: string[];

  // Motivation cards
  motivationalCards: {
    heroTitle: string;
    heroSubtitle: string;
    adviceHeader: string;
    adviceDescription: string;
    quote: string;
    tag: string;
  };

  // Achievement Badges
  badges: VibeBadge[];
}

export const VIBE_CONFIGS: Record<StudyVibe, VibeThemeConfig> = {
  anime: {
    name: "Anime Protagonist",
    className: "theme-anime",
    gradientAccent: "from-rose-500 to-pink-500",
    sidebarActiveStyle: "bg-gradient-to-r from-rose-500/90 to-pink-500/90 text-slate-950 font-extrabold shadow-lg shadow-rose-550/20",
    glowShadow: "shadow-rose-500/20 hover:shadow-rose-500/50 hover:border-rose-450",
    accentText: "text-rose-400 font-bold",
    borderAccent: "border-rose-500",
    borderAccentMuted: "border-rose-500/25",
    pulsingRate: "animate-pulse duration-1000",
    bgGradient: "from-slate-950 via-slate-900 to-rose-950/20",
    bgPatternOverlay: "sakura-ambient",
    ambientGlowColor: "bg-rose-500/5",
    xpName: "Protag Power",
    xpShort: "XP",
    companionName: "Sensei-AI",
    companionAvatarGreeting: "Ganbatte! Let's elevate your focus level. Your study quest starts now!",
    companionPersonalityPrompt: "You are Sensei-AI, an enthusiastic, passionate anime-inspired guide. Talk about unlocking potential, the student's inner fire, completing study arcs, keeping eyes on the horizon, and unleashing an unstoppable focus Bankai.",
    companionTips: [
      "Concentrate! A 25-minute study session is exactly how legends are animated.",
      "Hydration check! Even the strongest heroes need to replenish their reserves.",
      "Completing simple homework steps today unlocks massive main-character momentum!"
    ],
    motivationalCards: {
      heroTitle: "CURRENT MISSION // UNLOCKING TRUE FOCUS",
      heroSubtitle: "Your personalized study session is ready and loaded.",
      adviceHeader: "✧ Protag Focus Boost Advice ✧",
      adviceDescription: "Work with absolute dedication for 25 minutes. Channel your inner hero; there are no shortcuts on your path to mastery.",
      quote: "Push past your limits, right here, right now. This is your training arc!",
      tag: "✧ PROTAG MODE ACTIVE ✧"
    },
    badges: [
      { id: "anime-1", title: "Protagonist Sparks", description: "Completed a full uninterrupted 25-minute study session.", iconName: "Crown", colorClass: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
      { id: "anime-2", title: "Sensei's Endorsement", description: "Maintained a perfect study sequence under cognitive load.", iconName: "Award", colorClass: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
      { id: "anime-3", title: "Bankai Mindflow", description: "Cleared mental clutter to unlock pure strategic clarity.", iconName: "Zap", colorClass: "text-rose-400 bg-rose-500/10 border-rose-500/20" }
    ]
  },
  gamer: {
    name: "Gamer Core",
    className: "theme-gamer",
    gradientAccent: "from-purple-500 to-cyan-400",
    sidebarActiveStyle: "bg-gradient-to-r from-purple-500 to-cyan-400 text-slate-950 font-black tracking-wide shadow-lg shadow-cyan-550/20",
    glowShadow: "shadow-cyan-500/20 hover:shadow-cyan-400/50 hover:border-cyan-400",
    accentText: "text-cyan-400 font-mono",
    borderAccent: "border-cyan-400",
    borderAccentMuted: "border-cyan-500/25",
    pulsingRate: "animate-bounce duration-3000",
    bgGradient: "from-slate-950 via-purple-950/15 to-slate-900",
    bgPatternOverlay: "retro-grid",
    ambientGlowColor: "bg-cyan-500/5",
    xpName: "Quest Score",
    xpShort: "XP",
    companionName: "GameMaster Core",
    companionAvatarGreeting: "Greetings Player One. System ping is 0ms. Let's stomp this homework boss level!",
    companionPersonalityPrompt: "You are GameMaster Core, an elite gaming raid leader. Use gaming terminology like high scores, bosses, cooldown reduction, mana potions, specs, critical hits, lag spikes, and side-quests.",
    companionTips: [
      "Focus streak active! Avoid notifications to receive high-tier mastery rating.",
      "Quest active: Study continuously for 20 minutes with zero tab deviations.",
      "Clear the simple tasks first before tackling the big exam prep boss fight!"
    ],
    motivationalCards: {
      heroTitle: "LEVEL CURRENT // INTELLECT SPEEDRUN",
      heroSubtitle: "Optimize your strategic focus points for maximum rewards.",
      adviceHeader: "✦ Efficiency Tips & Tactics ✦",
      adviceDescription: "Break down your studying blocks like a speedrunner. Perfect execution on smaller stages guarantees an easy end-of-term academic sweep.",
      quote: "XP multiplier active. Prepare to easily clear the current academic tier.",
      tag: "✦ [FOCUS MULTIPLIER ACTIVE] ✦"
    },
    badges: [
      { id: "gamer-1", title: "Apex Speedrunner", description: "Completed study tactical sprints under par-time.", iconName: "Target", colorClass: "text-[#00f0ff] bg-cyan-500/10 border-cyan-500/20" },
      { id: "gamer-2", title: "Legendary Carry", description: "Successfully logged in and sustained daily missions flawlessly.", iconName: "Shield", colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
      { id: "gamer-3", title: "Triple Combo", description: "Deconstructed neural chaos into three distinct high-tier goals.", iconName: "Gem", colorClass: "text-[#00f0ff] bg-cyan-500/10 border-cyan-500/20" }
    ]
  },
  scifi: {
    name: "Cyber Interface",
    className: "theme-scifi",
    gradientAccent: "from-[#00f0ff] to-blue-600",
    sidebarActiveStyle: "bg-gradient-to-r from-neon-blue to-neon-purple text-slate-950 font-bold shadow-lg shadow-neon-blue/25",
    glowShadow: "shadow-neon-blue/15 hover:shadow-neon-blue/45 hover:border-neon-blue",
    accentText: "text-cyan-400 font-mono",
    borderAccent: "border-cyan-400",
    borderAccentMuted: "border-cyan-500/20",
    pulsingRate: "animate-pulse duration-700",
    bgGradient: "from-slate-950 via-[#00171d]/20 to-slate-950",
    bgPatternOverlay: "matrix-blueprint",
    ambientGlowColor: "bg-[#00f0ff]/5",
    xpName: "Synaptic Load",
    xpShort: "XP",
    companionName: "OmniMind AI",
    companionAvatarGreeting: "System online. Focus channels are stabilized. Send a message to start.",
    companionPersonalityPrompt: "You are OmniMind AI, a futuristic synthetic assistant core. Speak in precise, technical telemetry lines, cybernetic status reports, load computations, memory matrix arrays, and system synchronicity.",
    companionTips: [
      "Our status report shows your focus level is running at absolute peak efficiency today.",
      "Feeling overwhelmed? Open your MindDump AI right away to clear your thoughts.",
      "Draw a quick diagram of this hard concept to make studying frictionless and logical."
    ],
    motivationalCards: {
      heroTitle: "DECISION CENTER // SMART STUDY PLANS",
      heroSubtitle: "AI organizing your study goals for optimal learning and memory retention.",
      adviceHeader: "⚡ Study Load Optimizer ⚡",
      adviceDescription: "Direct all your focus to one single subject right now. Take a deep breath to clear away mental fatigue so logical clarity can flourish.",
      quote: "Synthesizing theoretical knowledge. Cybernetic cerebral circuits online.",
      tag: "📡 COGNITIVE PROFILE ONLINE"
    },
    badges: [
      { id: "scifi-1", title: "Mainframe Link", description: "Achieved absolute synchronic integration with diagnostic radar.", iconName: "Activity", colorClass: "text-cyan-400 bg-cyan-500/10 border-cyan-400/20" },
      { id: "scifi-2", title: "Silicon Deep Focus", description: "Maintained sequential compilation tasks over 45 uninterrupted units.", iconName: "Eye", colorClass: "text-[#00f0ff] bg-cyan-500/10 border-cyan-400/20" },
      { id: "scifi-3", title: "Quantum Re-alignment", description: "Successfully purged raw anxiety blocks to reclaim systematic order.", iconName: "Gem", colorClass: "text-cyan-400 bg-cyan-500/10 border-cyan-400/20" }
    ]
  },
  cozy: {
    name: "Cozy Focus",
    className: "theme-cozy",
    gradientAccent: "from-amber-400 to-orange-400",
    sidebarActiveStyle: "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20",
    glowShadow: "shadow-amber-500/15 hover:shadow-amber-400/40 hover:border-amber-450",
    accentText: "text-amber-400 font-sans font-medium",
    borderAccent: "border-amber-400",
    borderAccentMuted: "border-amber-500/15",
    pulsingRate: "animate-pulse duration-2000",
    bgGradient: "from-slate-950 via-[#170e02]/20 to-slate-950",
    bgPatternOverlay: "cozy-sparkles",
    ambientGlowColor: "bg-amber-500/4",
    xpName: "Comfy Karma",
    xpShort: "XP",
    companionName: "Lofi Companion",
    companionAvatarGreeting: "*gently passes you warm chamomile tea* Take a soft breath. Let's ease into a lovely study flow.",
    companionPersonalityPrompt: "You are Lofi Companion, a deeply comforting, soft-spoken friend. Talk about wrapping up warm, drinking warm beverages, listening to rain, the beauty of gentle progress, giving oneself kindness, and deconstructive peace.",
    companionTips: [
      "Let's drop your shoulders, unclench your jaw, and breathe in calm.",
      "Just focus for 15 quiet minutes. A single beautiful paragraph is a massive victory.",
      "Take your time. Hard concepts click perfectly when you learn them step by step."
    ],
    motivationalCards: {
      heroTitle: "WEEPING WILLOWS // GENTLE STEPS",
      heroSubtitle: "Soft rain music playing outside, a warm golden workspace inside.",
      adviceHeader: "☕ Warm Cozy Tips ☕",
      adviceDescription: "Break down intimidating chapters into bite-sized teacups. You don't have to study everything today. Just enjoy the learning path.",
      quote: "Gentle rain sounds outside, warm light inside. You are doing just fine.",
      tag: "☕ LOFI & FOCUS ENVIRONMENT"
    },
    badges: [
      { id: "cozy-1", title: "Warm Mug Focus", description: "Successfully finished a quiet, serene 15 Minutes study interval.", iconName: "Coffee", colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
      { id: "cozy-2", title: "Mindful Peace", description: "Breathed through mental chaos to write a beautiful action roadmap.", iconName: "Compass", colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
      { id: "cozy-3", title: "Whispering Rain", description: "Maintained a comfortable stream of daily steps without exhaustion.", iconName: "Sparkles", colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20" }
    ]
  },
  superhero: {
    name: "Heroic Resolve",
    className: "theme-superhero",
    gradientAccent: "from-red-600 to-yellow-500",
    sidebarActiveStyle: "bg-gradient-to-r from-red-600 to-yellow-500 text-slate-950 font-black tracking-wide shadow-lg shadow-red-500/25",
    glowShadow: "shadow-red-500/15 hover:shadow-red-500/45 hover:border-red-400",
    accentText: "text-yellow-400 font-sans tracking-wide font-extrabold",
    borderAccent: "border-red-500",
    borderAccentMuted: "border-red-500/25",
    pulsingRate: "animate-pulse duration-800",
    bgGradient: "from-slate-950 via-[#1c0205]/20 to-slate-950",
    bgPatternOverlay: "comic-halftone",
    ambientGlowColor: "bg-red-500/4",
    xpName: "Heroic Resolve",
    xpShort: "XP",
    companionName: "Commander AI",
    companionAvatarGreeting: "Focus shield charged! Distraction villains don't stand a chance today, Recruit. Let's make an impact!",
    companionPersonalityPrompt: "You are Commander AI, an inspiring superhero general. Match epic dialogue sequences, summon superhero focus fields, beat down negative procrastinator monsters, and promote valor, focus superpowers, and saving your academic destiny.",
    companionTips: [
      "Distraction forces are trying to break your focus. Set your phone aside and block them out!",
      "Our main goal today is to conquer the syllabus. Superpower mode: activate!",
      "Remember: your mind is highly attentive and ready to absorb information today."
    ],
    motivationalCards: {
      heroTitle: "MISSION PROFILE // FOCUS IMPACT",
      heroSubtitle: "Your focus shield is active. Defeating procrastination and distractions.",
      adviceHeader: "⚡ Power Study Tactics ⚡",
      adviceDescription: "Deploy maximum focus to conquer outstanding midterm tasks. Distractions are just minor obstacles to leap over!",
      quote: "You have been chosen. Your retention memory is a superpower. Defeat the essay draft outline!",
      tag: "⚡ FOCUS SHIELD ENGAGED"
    },
    badges: [
      { id: "hero-1", title: "Metropolitan Vigilance", description: "Successfully defended a solid study streak against procrastination.", iconName: "Shield", colorClass: "text-yellow-400 bg-red-500/15 border-red-500/30" },
      { id: "hero-2", title: "Valorous Focus", description: "Conquered a heavy 45-minute countdown session single-handedly.", iconName: "Zap", colorClass: "text-yellow-400 bg-red-500/15 border-red-500/30" },
      { id: "hero-3", title: "Destiny Restoration", description: "Transformed mental debris into actionable tactical instructions.", iconName: "Target", colorClass: "text-yellow-400 bg-red-500/15 border-red-500/30" }
    ]
  },
  minimalist: {
    name: "Zen Silence",
    className: "theme-minimalist",
    gradientAccent: "from-slate-400 to-slate-100",
    sidebarActiveStyle: "bg-gradient-to-r from-slate-400 to-slate-100 text-slate-950 font-bold shadow-lg shadow-slate-450/25",
    glowShadow: "shadow-slate-500/10 hover:shadow-slate-400/30 hover:border-slate-600",
    accentText: "text-slate-300 font-mono",
    borderAccent: "border-slate-700",
    borderAccentMuted: "border-slate-800",
    pulsingRate: "animate-none",
    bgGradient: "from-slate-950 via-slate-905 to-slate-950",
    bgPatternOverlay: "zen-void",
    ambientGlowColor: "bg-slate-100/2",
    xpName: "Zen Essence",
    xpShort: "XP",
    companionName: "Mono AI",
    companionAvatarGreeting: "Quiet space initialized. Take a slow breath. Let us focus on what's important.",
    companionPersonalityPrompt: "You are Mono AI, a minimalist monk. Speak in short, tranquil lines, using zen concepts, simplicity, eliminating mental noise, focusing on one single task, and returning to the quiet space.",
    companionTips: [
      "No clutter. Focus on your single main study goal right now.",
      "A clean slate. Begin fresh without overthinking.",
      "Clear away the digital clutter so your intelligence can focus."
    ],
    motivationalCards: {
      heroTitle: "ABSOLUTE ZERO // THE VOID",
      heroSubtitle: "All distractions cleared. Only simple, productive focus remains.",
      adviceHeader: "◌ Pure Simplification ◌",
      adviceDescription: "If you cannot summarize your topic in simple words, refine it. Clear away any complex fluff to let the core truth shine.",
      quote: "Do one thing. Do it deeply. Mute the universe.",
      tag: "◌ CLUTTER-FREE ZONE"
    },
    badges: [
      { id: "mini-1", title: "Empty Mind", description: "Logged in and completed focus blocks with absolute clarity.", iconName: "Compass", colorClass: "text-slate-350 bg-slate-905 border-slate-705" },
      { id: "mini-2", title: "Single Thread", description: "Successfully finished a study task without complex distraction loops.", iconName: "Target", colorClass: "text-slate-350 bg-slate-905 border-slate-705" },
      { id: "mini-3", title: "Zen Essence Unveiled", description: "Derailed overwhelming chaos into one beautifully clean agenda.", iconName: "Sparkles", colorClass: "text-slate-350 bg-slate-905 border-slate-705" }
    ]
  },
  space: {
    name: "Cosmic Journey",
    className: "theme-space",
    gradientAccent: "from-indigo-500 to-purple-500",
    sidebarActiveStyle: "bg-gradient-to-r from-indigo-500 to-purple-500 text-slate-950 font-bold shadow-lg shadow-indigo-500/25",
    glowShadow: "shadow-indigo-550/20 hover:shadow-indigo-500/50 hover:border-indigo-400",
    accentText: "text-indigo-400 font-mono",
    borderAccent: "border-indigo-500",
    borderAccentMuted: "border-indigo-500/25",
    pulsingRate: "animate-pulse duration-[2500ms]",
    bgGradient: "from-slate-950 via-indigo-950/15 to-slate-950",
    bgPatternOverlay: "space-nebula",
    ambientGlowColor: "bg-indigo-500/5",
    xpName: "Star Dust",
    xpShort: "XP",
    companionName: "Astro-AI",
    companionAvatarGreeting: "Greetings Captain, spatial telemetry locked. All systems initialized for deep cosmos exploration.",
    companionPersonalityPrompt: "You are Astro-AI, a serene intergalactic system computer. Speak in soft sci-fi nautical lines, referring to spacecraft navigation, orbit parameters, stellar clusters, starfields, gravitational shifts, hyperdrive preparation, and keeping focus through asteroid storms.",
    companionTips: [
      "Keep your scopes locked! External notifications are mere space debris.",
      "Engage your propulsion modules for an immersive 25-minute cruise.",
      "A quiet mind is the fastest path across the intellectual galaxy."
    ],
    motivationalCards: {
      heroTitle: "ORBITAL VECTOR // STARFIELD INTERACTIVE",
      heroSubtitle: "Propelling your academic trajectory across the celestial sphere.",
      adviceHeader: "✦ Cosmic Star-Mapping Tips ✦",
      adviceDescription: "Map out your study requirements like stars in a clear sky. Systematically navigate every milestone to maintain high-thrust speed.",
      quote: "The cosmos is within us. We are star-stuff learning about the stars.",
      tag: "✦ INTERGALACTIC CABIN ACTIVE ✦"
    },
    badges: [
      { id: "space-1", title: "Astral Navigator", description: "Successfully established a steady orbital track with no lateral drifting.", iconName: "Compass", colorClass: "text-indigo-400 bg-indigo-550/10 border-indigo-500/20" },
      { id: "space-2", title: "Supernova Intellect", description: "Burst through standard curriculum constraints via a high-velocity study run.", iconName: "Zap", colorClass: "text-indigo-400 bg-indigo-550/10 border-indigo-500/20" },
      { id: "space-3", title: "Absolute Zero Field", description: "Calibrated complex external audio signals into pure meditative peace.", iconName: "Shield", colorClass: "text-indigo-400 bg-indigo-550/10 border-indigo-500/20" }
    ]
  }
};
