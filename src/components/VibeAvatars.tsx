import React from "react";
import { StudyVibe } from "../types";

interface VibeVisualProps {
  vibe: StudyVibe;
  className?: string;
  isAnimated?: boolean;
}

// 1. STYLIZED CHARACTER-INSPIRED AVATARS (SVG CODES)
export const VibeAvatar: React.FC<VibeVisualProps> = ({ vibe, className = "w-16 h-16", isAnimated = true }) => {
  const rotationClass = isAnimated ? "animate-[spin_10s_linear_infinite]" : "";
  const pulseClass = isAnimated ? "animate-pulse" : "";

  switch (vibe) {
    case "anime":
      // Anime Glow: Beautiful manga-inspired study assistant with cyber headphones & soft blossom tones
      return (
        <svg viewBox="0 0 100 100" className={`${className} select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Glowing back circle */}
          <circle cx="50" cy="50" r="45" fill="url(#anime-grad-bg)" className={pulseClass} opacity="0.15" />
          <circle cx="50" cy="50" r="40" stroke="url(#anime-grad)" strokeWidth="1.5" className={pulseClass} />
          
          {/* Cyber Headset Behind/Around */}
          <rect x="20" y="38" width="8" height="24" rx="4" fill="#ff007a" opacity="0.8" />
          <rect x="72" y="38" width="8" height="24" rx="4" fill="#ff007a" opacity="0.8" />
          <path d="M24 40 C 24 20, 76 20, 76 40" stroke="#ff007a" strokeWidth="3" strokeLinecap="round" />
          
          {/* Anime Hair / Face Structure */}
          {/* Hair back */}
          <path d="M25 45 C 20 55, 30 80, 50 82 C 70 80, 80 55, 75 45 C 75 30, 25 30, 25 45 Z" fill="#2d122b" />
          {/* Face */}
          <path d="M30 46 C 30 65, 35 75, 50 78 C 65 75, 70 65, 70 46 C 70 38, 30 38, 30 46 Z" fill="#ffe0d3" />
          
          {/* Manga Cute Specs / Neon Glasses visor */}
          <rect x="28" y="47" width="18" height="10" rx="2" stroke="#00f0ff" strokeWidth="1.5" fill="#00f0ff" fillOpacity="0.1" />
          <rect x="54" y="47" width="18" height="10" rx="2" stroke="#00f0ff" strokeWidth="1.5" fill="#00f0ff" fillOpacity="0.1" />
          <line x1="46" y1="52" x2="54" y2="52" stroke="#00f0ff" strokeWidth="2" />
          
          {/* Sleek Hair Bangs */}
          <path d="M27 38 C 30 48, 40 45, 45 48 C 50 42, 48 38, 48 36" fill="#4a154b" />
          <path d="M73 38 C 70 48, 60 45, 55 48 C 50 42, 52 38, 52 36" fill="#4a154b" />
          <path d="M40 35 C 45 42, 55 42, 60 35" fill="#ff007a" opacity="0.25" />

          {/* Glowing Cyber Cheek details */}
          <line x1="32" y1="62" x2="38" y2="62" stroke="#ff007a" strokeWidth="1" strokeLinecap="round" />
          <line x1="62" y1="62" x2="68" y2="62" stroke="#ff007a" strokeWidth="1" strokeLinecap="round" />
          
          {/* Soft mouth */}
          <path d="M47 67 Q 50 69 53 67" stroke="#4a154b" strokeWidth="1.5" strokeLinecap="round" />

          {/* Sakura Pedals around */}
          <path d="M15 28 C 15 25, 18 25, 18 28 C 18 31, 15 31, 15 28 Z" fill="#ffb7d2" className={pulseClass} />
          <path d="M82 72 C 82 69, 85 69, 85 72 C 85 75, 82 75, 82 72 Z" fill="#ffb7d2" className={pulseClass} />

          {/* Definitions */}
          <defs>
            <linearGradient id="anime-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff007a" />
              <stop offset="100%" stopColor="#ffb7d2" />
            </linearGradient>
            <linearGradient id="anime-grad-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff007a" />
              <stop offset="100%" stopColor="#120215" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "cozy":
      // Cozy manga companion: Warm cute mug & lofi sleeping cat helper
      return (
        <svg viewBox="0 0 100 100" className={`${className} select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle warm halo background */}
          <circle cx="50" cy="50" r="45" fill="url(#cozy-warm-halo)" className={pulseClass} opacity="0.3" />
          <circle cx="50" cy="50" r="40" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,4" className={rotationClass} />
          
          {/* Illustrated Cute Mug of Tea */}
          <rect x="36" y="44" width="28" height="30" rx="6" fill="#d97706" stroke="#f59e0b" strokeWidth="2" />
          
          {/* Mug handle */}
          <path d="M64 50 C 72 50, 72 68, 64 68" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
          
          {/* Soft Steam Swirls rising up */}
          <path d="M42 34 Q 45 28 42 22" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" className={pulseClass}>
            <animate attributeName="stroke-dashoffset" values="0;10;0" dur="4s" repeatCount="indefinite" />
          </path>
          <path d="M50 32 Q 53 26 50 20" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" className={pulseClass}>
            <animate attributeName="stroke-dashoffset" values="5;15;5" dur="3s" repeatCount="indefinite" />
          </path>
          <path d="M58 35 Q 61 29 58 23" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" className={pulseClass}>
            <animate attributeName="stroke-dashoffset" values="2;12;2" dur="5s" repeatCount="indefinite" />
          </path>

          {/* Manga companion eyes drawn on the mug */}
          <circle cx="44" cy="56" r="2" fill="#451a03" />
          <circle cx="56" cy="56" r="2" fill="#451a03" />
          <path d="M48 60 Q 50 62 52 60" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" />
          {/* Cute pink cheeks on mug */}
          <circle cx="41" cy="59" r="1.5" fill="#f87171" />
          <circle cx="59" cy="59" r="1.5" fill="#f87171" />

          {/* Sleeping kitten curled around bottom of mug */}
          <path d="M26 74 C 26 68, 38 66, 44 68 C 48 69, 65 70, 72 74 C 76 77, 72 82, 50 82 C 32 82, 26 78, 26 74 Z" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
          {/* Kitten details */}
          <path d="M32 70 Q 30 65 28 72" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" /> {/* Ear */}
          <path d="M32 73 C33 73, 34 74, 35 74" stroke="#b45309" strokeWidth="1" /> {/* Eye */}
          <path d="M28 76 C 24 78, 26 80, 27 80" stroke="#b45309" strokeWidth="1" /> {/* Tail curve */}

          <defs>
            <radialGradient id="cozy-warm-halo" cx="50" cy="50" r="45">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      );

    case "gamer":
      // Gamer Mode: Holographic retro gaming assistant visor
      return (
        <svg viewBox="0 0 100 100" className={`${className} select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Cyber backplate grid lines */}
          <circle cx="50" cy="50" r="45" stroke="#a78bfa" strokeWidth="1" strokeDasharray="5,2" opacity="0.4" />
          <circle cx="50" cy="50" r="40" fill="url(#gamer-holo-grad)" className={pulseClass} opacity="0.1" />

          {/* Moving Tech Matrix Crosshairs */}
          <line x1="50" y1="5" x2="50" y2="95" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1="5" y1="50" x2="95" y2="50" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="2,2" />
          <circle cx="50" cy="50" r="22" stroke="#a78bfa" strokeWidth="1.5" className={rotationClass} strokeDasharray="30,10,15,5" />

          {/* Holographic Visor Design */}
          <path d="M24 45 L40 37 L60 37 L76 45 L72 65 L60 70 L40 70 L28 65 Z" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2.5" />
          
          {/* Visor glowing laser scanline */}
          <rect x="29" y="47" width="42" height="12" rx="2" fill="#06b6d4" fillOpacity="0.25" stroke="#00f0ff" strokeWidth="1.5" />
          <line x1="32" y1="53" x2="68" y2="53" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" className={pulseClass} />

          {/* Robotic antennas / horns */}
          <path d="M24 45 L15 32 L22 30" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="15" cy="32" r="3" fill="#00f0ff" className={pulseClass} />
          <path d="M76 45 L85 32 L78 30" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="85" cy="32" r="3" fill="#00f0ff" className={pulseClass} />

          {/* Hexagonal energy shield overlays */}
          <path d="M44 22 L50 18 L56 22 L56 28 L50 32 L44 28 Z" fill="#c084fc" fillOpacity="0.2" stroke="#c084fc" strokeWidth="1" className={pulseClass} />

          <defs>
            <radialGradient id="gamer-holo-grad" cx="50" cy="50" r="45">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      );

    case "scifi":
      // Cyberpunk Study Companion (Sleek tech student mascot/orb)
      return (
        <svg viewBox="0 0 100 100" className={`${className} select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Interlocking mainframe tech circles */}
          <circle cx="50" cy="50" r="46" stroke="#00f0ff" strokeWidth="1" strokeDasharray="2,6" className={rotationClass} />
          <circle cx="50" cy="50" r="42" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="30,20" />
          <circle cx="50" cy="50" r="34" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />

          {/* Advanced Robotic Core Lens */}
          <circle cx="50" cy="50" r="22" fill="url(#scifi-lens-metal)" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="50" cy="50" r="16" fill="url(#scifi-glow-inner)" className={pulseClass} />
          
          {/* Cybernetic eye aperture lines */}
          <line x1="38" y1="50" x2="62" y2="50" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="50" y1="38" x2="50" y2="62" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="6" fill="#ffffff" />
          {/* Hologram reflection flare */}
          <circle cx="47" cy="47" r="2" fill="#00f0ff" />

          {/* Surrounding binary/circuit pathways */}
          <path d="M12 50 L25 50" stroke="#00f0ff" strokeWidth="2" />
          <circle cx="10" cy="50" r="2" fill="#00f0ff" />
          <path d="M88 50 L75 50" stroke="#3b82f6" strokeWidth="2" />
          <circle cx="90" cy="50" r="2" fill="#3b82f6" />
          <path d="M50 12 L50 25" stroke="#3b82f6" strokeWidth="2" />
          <path d="M50 88 L50 75" stroke="#00f0ff" strokeWidth="2" />

          <defs>
            <linearGradient id="scifi-lens-metal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <radialGradient id="scifi-glow-inner" cx="50" cy="50" r="16">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="60%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#1e40af" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      );

    case "space":
      // Space Mode: Astroid-AI futuristic spacesuit helmet/companion with nebula reflections
      return (
        <svg viewBox="0 0 100 100" className={`${className} select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Deep space orbital path rings */}
          <circle cx="50" cy="50" r="45" stroke="#6366f1" strokeWidth="0.75" />
          <ellipse cx="50" cy="50" rx="46" ry="18" stroke="#818cf8" strokeWidth="1" className={rotationClass} strokeDasharray="20,10,5,10" />

          {/* Spacesuit helmet exterior */}
          <circle cx="50" cy="52" r="32" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="36" y="78" width="28" height="12" rx="4" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
          
          {/* Glass Visor with glowing nebula gradient inside */}
          <path d="M26 48 C 26 34, 74 34, 74 48 C 74 65, 26 65, 26 48 Z" fill="url(#space-visor-grad)" stroke="#4f46e5" strokeWidth="2" />
          
          {/* Twinkling stars reflected in visor */}
          <circle cx="36" cy="42" r="1.5" fill="#ffffff" className={pulseClass} />
          <circle cx="62" cy="44" r="1" fill="#ffffff" />
          <circle cx="48" cy="55" r="1.5" fill="#a5b4fc" className={pulseClass} />
          
          {/* Visor shine flare curve */}
          <path d="M32 42 C 38 38, 56 38, 68 42" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

          {/* Helmet communication mic */}
          <rect x="23" y="58" width="5" height="5" rx="1" fill="#ff007a" className={pulseClass} />

          <defs>
            <linearGradient id="space-visor-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="40%" stopColor="#311054" />
              <stop offset="75%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "superhero":
      // Heroic Resolve: Glowing commander study mask/badge crest
      return (
        <svg viewBox="0 0 100 100" className={`${className} select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shield backplate glow */}
          <polygon points="50,5 92,26 92,62 50,95 8,62 8,26" fill="url(#hero-shield-grad)" className={pulseClass} opacity="0.15" />
          <polygon points="50,10 88,29 88,60 50,90 12,60 12,29" stroke="url(#hero-shield-border)" strokeWidth="2.5" />

          {/* Tactical Ruby Eye Visor/Mask */}
          <path d="M22 36 L44 42 L50 38 L56 42 L78 36 L72 55 L58 52 L50 58 L42 52 L28 55 Z" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" />
          <path d="M26 39 L43 44 C 43 44, 50 49, 50 49 C 50 49, 57 44, 57 44 L74 39 C74 39, 70 51, 50 53 C 30 51, 26 39, 26 39 Z" fill="#f87171" />
          
          {/* Glowing Ruby pulse lasers */}
          <line x1="28" y1="43" x2="44" y2="43" stroke="#ff0000" strokeWidth="1.5" className={pulseClass} />
          <line x1="56" y1="43" x2="72" y2="43" stroke="#ff0000" strokeWidth="1.5" className={pulseClass} />

          {/* Golden Star Emblem above visor */}
          <polygon points="50,14 53,20 60,20 55,24 57,30 50,26 43,30 45,24 40,20 47,20" fill="#fbbf24" stroke="#d97706" strokeWidth="1" className={pulseClass} />

          {/* Energy wings accents of resolve */}
          <path d="M16 29 C 4 35, 12 55, 18 53" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M84 29 C 96 35, 88 55, 82 53" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />

          <defs>
            <linearGradient id="hero-shield-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="hero-shield-border" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "minimalist":
    default:
      // Zen Mind Concentration: Monocircle of tranquil essence & concentric ripples
      return (
        <svg viewBox="0 0 100 100" className={`${className} select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="42" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="2,4" />
          
          {/* Perfect floating clean metallic sphere */}
          <circle cx="50" cy="50" r="24" fill="url(#minimalist-sphere)" stroke="#e2e8f0" strokeWidth="1" />
          
          {/* Concentric ripples radiating outward */}
          <circle cx="50" cy="50" r="32" stroke="#64748b" strokeWidth="0.75" className={pulseClass} opacity="0.4" />
          <circle cx="50" cy="50" r="38" stroke="#cbd5e1" strokeWidth="0.5" className={pulseClass} opacity="0.2">
            <animate attributeName="r" values="24;46;24" dur="8s" repeatCount="indefinite" />
          </circle>

          {/* Golden ratio geometric balance markings */}
          <line x1="50" y1="15" x2="50" y2="85" stroke="#475569" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="15" y1="50" x2="85" y2="50" stroke="#475569" strokeWidth="0.5" strokeOpacity="0.3" />

          <defs>
            <linearGradient id="minimalist-sphere" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>
        </svg>
      );
  }
};


// 2. PREMIUM THEME BACKGROUND & LANDSCAPE ARTWORK (SVG)
export const VibeArtwork: React.FC<VibeVisualProps> = ({ vibe, className = "w-full h-full", isAnimated = true }) => {
  const pulseClass = isAnimated ? "animate-pulse" : "";

  switch (vibe) {
    case "cozy":
      // Cozy study room illustration: Warm mug, stack of books, falling rain behind window pane, desk lamp casting light
      return (
        <svg viewBox="0 0 400 180" className={`${className} select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Wall backing */}
          <rect width="400" height="180" fill="#1c110a" />
          
          {/* Window showing rain outside */}
          <rect x="25" y="20" width="100" height="110" fill="#0c1d24" rx="4" stroke="#453227" strokeWidth="4" />
          {/* Window pane lines */}
          <line x1="75" y1="20" x2="75" y2="130" stroke="#453227" strokeWidth="3" />
          <line x1="25" y1="75" x2="125" y2="75" stroke="#453227" strokeWidth="3" />
          
          {/* Drooping tree branches outside window */}
          <path d="M30 30 Q 55 45 80 35 Q 100 50 120 40" stroke="#064e3b" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
          
          {/* Rain streaks sliding on pane */}
          <line x1="45" y1="35" x2="40" y2="55" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" opacity="0.3" className={pulseClass} />
          <line x1="95" y1="40" x2="90" y2="60" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" opacity="0.3" className={pulseClass} />
          <line x1="60" y1="85" x2="55" y2="105" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" opacity="0.3" className={pulseClass} />
          <line x1="110" y1="80" x2="105" y2="100" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" opacity="0.3" className={pulseClass} />

          {/* Wooden Study Desk shelf */}
          <rect x="0" y="130" width="400" height="50" fill="#451a03" />
          <rect x="0" y="130" width="400" height="6" fill="#f59e0b" opacity="0.15" />

          {/* Floating Warm Desk Lamp casting a cozy yellow triangle of light */}
          <path d="M260 40 L245 60 L275 60 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" /> {/* Lamp Shade */}
          <path d="M260 40 L240 135" stroke="#d97706" strokeWidth="3" fill="none" /> {/* Neck */}
          <ellipse cx="240" cy="135" rx="14" ry="4" fill="#78350f" /> {/* Base */}
          
          {/* Glowing Ambient light cone cast from the lamp shadow */}
          <polygon points="260,54 130,180 390,180" fill="url(#lamp-light-cone)" opacity="0.25" />

          {/* Pile of warm retro schoolbooks on desk */}
          <rect x="180" y="112" width="42" height="18" rx="2" fill="#d97706" stroke="#92400e" strokeWidth="1" /> {/* Book 1 */}
          <rect x="184" y="115" width="34" height="2" fill="#fef3c7" /> {/* Pages strip */}
          <rect x="175" y="98" width="48" height="14" rx="2" fill="#1e3a8a" stroke="#172554" strokeWidth="1" /> {/* Book 2 */}
          <rect x="178" y="101" width="42" height="2" fill="#eff6ff" />

          {/* Potted study plant dropping leafy branches */}
          <ellipse cx="335" cy="115" rx="12" ry="16" fill="#065f46" stroke="#047857" strokeWidth="1.5" /> {/* Leaf bundle */}
          <path d="M335 131 L335 138" stroke="#047857" strokeWidth="2" />
          <rect x="325" y="138" width="20" height="16" rx="2" fill="#7c2d12" stroke="#541907" strokeWidth="1.5" /> {/* Clay Pot */}

          {/* Cup of hot coffee emitting lofi steam */}
          <rect x="145" y="118" width="16" height="12" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
          <path d="M161 121 C 165 121, 165 127, 161 127" stroke="#cbd5e1" strokeWidth="1.2" fill="none" />
          <path d="M149 112 Q 151 106 149 100" stroke="#f59e0b" strokeWidth="1" opacity="0.6" className={pulseClass} />
          <path d="M154 114 Q 156 108 154 102" stroke="#f59e0b" strokeWidth="1" opacity="0.6" className={pulseClass} />

          <defs>
            <linearGradient id="lamp-light-cone" x1="260" y1="54" x2="260" y2="180">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "anime":
      // Anime glow: Tokyo neon tower, sakura falling petals, starry mount fuji sky, neon grids
      return (
        <svg viewBox="0 0 400 180" className={`${className} select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Cyberpunk twilight sunset sky */}
          <rect width="400" height="180" fill="url(#anime-sky-grad)" />

          {/* Starfield */}
          <circle cx="20" cy="20" r="0.75" fill="#ffffff" opacity="0.7" className={pulseClass} />
          <circle cx="150" cy="15" r="1.25" fill="#ffd6e8" opacity="0.8" className={pulseClass} />
          <circle cx="360" cy="40" r="1" fill="#ffffff" />
          <circle cx="280" cy="28" r="0.75" fill="#ffffff" opacity="0.5" />

          {/* Mount Fuji shape in deep violet backguard */}
          <polygon points="200,60 130,160 270,160" fill="#2e1035" opacity="0.9" />
          <polygon points="200,60 186,80 214,80" fill="#fbcfe8" /> {/* Snowcap */}

          {/* Stylized Electric Neon Tokyo grids in background */}
          <line x1="0" y1="160" x2="400" y2="160" stroke="#ff007a" strokeWidth="2.5" />
          <line x1="50" y1="160" x2="0" y2="180" stroke="#9d174d" strokeWidth="1" />
          <line x1="150" y1="160" x2="100" y2="180" stroke="#9d174d" strokeWidth="1" />
          <line x1="250" y1="160" x2="300" y2="180" stroke="#9d174d" strokeWidth="1" />
          <line x1="350" y1="160" x2="400" y2="180" stroke="#9d174d" strokeWidth="1" />

          {/* Glowing City Towers silhouettes */}
          <rect x="20" y="80" width="30" height="80" fill="#1e0b36" stroke="#4c1d95" />
          <rect x="25" y="90" width="5" height="10" fill="#fbcfe8" opacity="0.4" className={pulseClass} />
          <rect x="38" y="110" width="5" height="10" fill="#67e8f9" opacity="0.3" />
          
          <rect x="330" y="70" width="45" height="90" fill="#1e0b36" stroke="#4c1d95" />
          <rect x="340" y="85" width="8" height="15" fill="#67e8f9" opacity="0.4" />
          <rect x="355" y="120" width="8" height="15" fill="#fbcfe8" opacity="0.3" className={pulseClass} />

          {/* Cyberpunk Gateway Arch / Torii Gate in glow magenta */}
          <path d="M280 160 L280 110 L305 110 L305 110 L305 160" stroke="#ff007a" strokeWidth="4" fill="none" className={pulseClass} />
          <line x1="272" y1="110" x2="313" y2="110" stroke="#ff007a" strokeWidth="5" strokeLinecap="round" />
          <line x1="276" y1="118" x2="309" y2="118" stroke="#ff007a" strokeWidth="2" />

          {/* Falling sakura petal loops */}
          <g fill="#fba3cb" className={pulseClass}>
            <circle cx="80" cy="40" r="3.5" />
            <circle cx="110" cy="65" r="2.5" />
            <circle cx="60" cy="95" r="3" />
            <circle cx="230" cy="115" r="2" />
            <circle cx="250" cy="55" r="4" />
          </g>

          <defs>
            <linearGradient id="anime-sky-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e0a29" />
              <stop offset="60%" stopColor="#310c3b" />
              <stop offset="100%" stopColor="#ff007a" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "gamer":
      // Gamer Mode: Holographic grid dashboard representation
      return (
        <svg viewBox="0 0 400 180" className={`${className} select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Black arcade backing */}
          <rect width="400" height="180" fill="#030712" />

          {/* Glowing neon retro grid projecting into depthperspective */}
          <line x1="0" y1="130" x2="400" y2="130" stroke="#a855f7" strokeWidth="2" className={pulseClass} />
          {/* Vanishing point projection lines */}
          <line x1="200" y1="60" x2="-200" y2="180" stroke="#10b981" strokeWidth="0.75" />
          <line x1="200" y1="60" x2="0" y2="180" stroke="#10b981" strokeWidth="0.75" />
          <line x1="200" y1="60" x2="150" y2="180" stroke="#06b6d4" strokeWidth="0.75" />
          <line x1="200" y1="60" x2="250" y2="180" stroke="#06b6d4" strokeWidth="0.75" />
          <line x1="200" y1="60" x2="400" y2="180" stroke="#10b981" strokeWidth="0.75" />
          <line x1="200" y1="60" x2="600" y2="180" stroke="#10b981" strokeWidth="0.75" />

          {/* Synthesizer synth wave horizontal grid rings */}
          <line x1="0" y1="145" x2="400" y2="145" stroke="#06b6d4" strokeWidth="1" />
          <line x1="0" y1="162" x2="400" y2="162" stroke="#10b981" strokeWidth="1.5" />
          
          {/* Sun emblem rising over synth horizon */}
          <ellipse cx="200" cy="115" rx="65" ry="35" fill="url(#gamer-sun-grad)" />
          {/* Synth slice bars into the sun */}
          <rect x="130" y="105" width="140" height="2" fill="#030712" />
          <rect x="130" y="113" width="140" height="3" fill="#030712" />
          <rect x="130" y="122" width="140" height="4" fill="#030712" />

          {/* Retro Hologram interface details */}
          <rect x="15" y="15" width="120" height="45" rx="3" stroke="#06b6d4" strokeWidth="1" fill="#0891b2" fillOpacity="0.05" />
          <text x="25" y="32" fill="#22d3ee" fontSize="7" fontFamily="monospace">SYSTEM METRIC CONFIG</text>
          <text x="25" y="45" fill="#a78bfa" fontSize="6" fontFamily="monospace" className={pulseClass}>PINGS: 0.03MS // LEVEL UP</text>

          <rect x="265" y="15" width="120" height="45" rx="3" stroke="#a855f7" strokeWidth="1" fill="#6b21a8" fillOpacity="0.05" />
          <text x="275" y="32" fill="#c084fc" fontSize="7" fontFamily="monospace">QUEST MATRIX CHANNELS</text>
          <line x1="275" y1="42" x2="350" y2="42" stroke="#a855f7" strokeWidth="2" />
          <circle cx="360" cy="42" r="3" fill="#00f0ff" className={pulseClass} />

          <defs>
            <linearGradient id="gamer-sun-grad" x1="200" y1="80" x2="200" y2="130">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="60%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "space":
      // Space: Beautiful galaxy orbital view, spaceship window frame looking at a planetary nebula
      return (
        <svg viewBox="0 0 400 180" className={`${className} select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="180" fill="#02020a" />
          
          {/* Deep space stellar nebula backglow */}
          <circle cx="210" cy="90" r="100" fill="url(#space-neb-backglow)" opacity="0.6" className={pulseClass} />

          {/* Sparkles stars */}
          <circle cx="70" cy="30" r="1.5" fill="#ffffff" className={pulseClass} />
          <polygon points="320,40 322,44 326,45 322,46 320,50 318,46 314,45 318,44" fill="#67e8f9" className={pulseClass} />
          <circle cx="180" cy="150" r="1" fill="#ffffff" />
          <circle cx="350" cy="140" r="2" fill="#ffd59a" className={pulseClass} />

          {/* Gorgeous colored gas rings / galaxy trails */}
          <ellipse cx="200" cy="90" rx="140" ry="25" stroke="#6366f1" strokeWidth="2.5" transform="rotate(-15 200 90)" opacity="0.7" />
          <ellipse cx="200" cy="90" rx="155" ry="32" stroke="#ec4899" strokeWidth="1" transform="rotate(-15 200 90)" opacity="0.4" strokeDasharray="10,12" />

          {/* Beautiful glowing alien planet */}
          <circle cx="220" cy="85" r="28" fill="url(#planet-grad)" />
          <circle cx="210" cy="75" r="28" fill="#1e1e4f" opacity="0.15" /> {/* Shadow Overlay on planet */}

          {/* Curved spacesuit cabin windshield border framing bottom edges */}
          <path d="M0 135 C 100 160, 300 160, 400 135 L400 180 L0 180 Z" fill="#0f172a" />
          <path d="M0 135 C 100 160, 300 160, 400 135" stroke="#475569" strokeWidth="2.5" fill="none" />

          {/* Ship flight diagnostic telemetry text overlays */}
          <text x="35" y="166" fill="#818cf8" fontSize="6.5" fontFamily="monospace">SHIP LATITUDE: ORBIT READY</text>
          <text x="285" y="166" fill="#34d399" fontSize="6.5" fontFamily="monospace" className={pulseClass}>✦ WARP ENGINE CHARGE: 98.7%</text>

          <defs>
            <radialGradient id="space-neb-backglow" cx="210" cy="90" r="100">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#db2777" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="planet-grad" x1="192" y1="57" x2="248" y2="113">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "scifi":
      // Cyberpunk database blueprint structure: Rotating cyber grid paths and futuristic circuits
      return (
        <svg viewBox="0 0 400 180" className={`${className} select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="180" fill="#050b14" />
          
          {/* Binary backdrop matrix matrix rows */}
          <g opacity="0.08" className={pulseClass} fill="#00f0ff" fontSize="6" fontFamily="monospace">
            <text x="15" y="20">10110001 01101001 11001011 00011011 11100011</text>
            <text x="15" y="35">01101110 11001010 10101111 00110011 01010101</text>
            <text x="15" y="50">11100101 11011011 01011101 11001110 10001001</text>
            <text x="15" y="65">00011011 01101100 11001010 01001111 11100011</text>
          </g>

          {/* Dynamic glowing neural matrix node connections */}
          <circle cx="200" cy="90" r="4" fill="#00f0ff" className={pulseClass} />
          <circle cx="120" cy="60" r="3" fill="#3b82f6" />
          <circle cx="140" cy="120" r="3" fill="#3b82f6" />
          <circle cx="280" cy="70" r="3.5" fill="#a855f7" className={pulseClass} />
          <circle cx="260" cy="125" r="3" fill="#00f0ff" />

          {/* Linking paths */}
          <line x1="120" y1="60" x2="200" y2="90" stroke="#1e3a8a" strokeWidth="1.5" />
          <line x1="140" y1="120" x2="200" y2="90" stroke="#1e3a8a" strokeWidth="1.5" />
          <line x1="280" y1="70" x2="200" y2="90" stroke="#581c87" strokeWidth="1.5" />
          <line x1="260" y1="125" x2="200" y2="90" stroke="#1e3a8a" strokeWidth="1.5" />
          
          {/* Cyber scanner sweep line across the matrix blueprint */}
          <line x1="0" y1="10" x2="400" y2="10" stroke="#00f0ff" strokeWidth="1.5" opacity="0.30" className={pulseClass}>
            <animate attributeName="y1" values="10;170;10" dur="6s" repeatCount="indefinite" />
            <animate attributeName="y2" values="10;170;10" dur="6s" repeatCount="indefinite" />
          </line>

          {/* Neon side rails */}
          <rect x="12" y="12" width="376" height="156" rx="6" stroke="#0891b2" strokeWidth="1" strokeDasharray="30,10,12,10" opacity="0.3" />
          
          <defs>
            <linearGradient id="cyber-beam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "superhero":
      // Heroic resolve: Epic sky sunrise, towering neon city skyscrapers under glowing resolve rays
      return (
        <svg viewBox="0 0 400 180" className={`${className} select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="180" fill="url(#hero-sky)" />
          
          {/* Energy rays shooting from center horizon representing resolute force */}
          <polygon points="200,180 -100,-50 100,-50" fill="#fbcfe8" fillOpacity="0.06" className={pulseClass} />
          <polygon points="200,180 150,-50 250,-50" fill="#fef08a" fillOpacity="0.08" />
          <polygon points="200,180 300,-50 500,-50" fill="#fbcfe8" fillOpacity="0.06" className={pulseClass} />

          {/* Towering city silhouette in high contrast */}
          <path d="M0 180 L0 100 L30 100 L30 110 L60 110 L60 80 L90 80 L90 120 L130 120 L130 60 L160 60 L160 130 L220 130 L220 50 L250 50 L250 120 L310 120 L310 90 L340 90 L340 180 Z" fill="#1e1b4b" opacity="0.95" />
          
          {/* Glowing windows on skyscrapers representing active students */}
          <rect x="14" y="110" width="4" height="6" fill="#fef08a" opacity="0.4" />
          <rect x="74" y="95" width="4" height="6" fill="#fde047" opacity="0.5" className={pulseClass} />
          <rect x="145" y="80" width="4" height="6" fill="#fef08a" opacity="0.3" />
          <rect x="235" y="70" width="4" height="10" fill="#ef4444" opacity="0.6" className={pulseClass} />

          {/* Huge golden/ruby sun setting behind the city */}
          <circle cx="200" cy="140" r="34" fill="#f97316" filter="blur(2px)" />

          {/* Force field glow ring protector */}
          <path d="M100 180 C 130 110, 270 110, 300 180" stroke="#f43f5e" strokeWidth="2.5" fill="none" className={pulseClass} />

          <defs>
            <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2e1065" />
              <stop offset="50%" stopColor="#4c1d95" />
              <stop offset="100%" stopColor="#db2777" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "minimalist":
    default:
      // Zen silence: Absolute simple layered mountains in fog with a crisp circle sun
      return (
        <svg viewBox="0 0 400 180" className={`${className} select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Clean gradient light background */}
          <rect width="400" height="180" fill="url(#minimalist-wall)" />
          
          {/* Concentric meditation curves behind */}
          <circle cx="200" cy="110" r="50" stroke="#e2e8f0" strokeWidth="0.75" />
          <circle cx="200" cy="110" r="70" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="4,4" />

          {/* Simple sun */}
          <circle cx="200" cy="110" r="16" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" className={pulseClass} />

          {/* Layered simple minimalist gravel zen mounds */}
          <path d="M0 160 Q 110 140 220 160 Q 310 150 400 170 L400 180 L0 180 Z" fill="#e2e8f0" />
          <path d="M120 180 Q 230 155 350 180" stroke="#94a3b8" strokeWidth="1" fill="none" />
          <path d="M50 180 Q 140 165 240 180" stroke="#cbd5e1" strokeWidth="1.2" fill="none" />

          <defs>
            <linearGradient id="minimalist-wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fafafa" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
          </defs>
        </svg>
      );
  }
};


// 3. MASCOT CHARACTER INFO DIRECTORY
interface MascotInfo {
  name: string;
  role: string;
  specialty: string;
  avatarPrompt: string;
}

export const VIBE_MASCOT_INFO: Record<StudyVibe, MascotInfo> = {
  anime: {
    name: "Sensei-AI",
    role: "Unstoppable Shonen Tutor",
    specialty: "Leveling student stats & breaking study limit caps",
    avatarPrompt: "Manga-inspired neon anime study assistant with pink cyber-headphones"
  },
  cozy: {
    name: "Lofi Companion",
    role: "Gentle Tea & Chamomile Guide",
    specialty: "Draining neural anxiety and organizing beautiful step sequences",
    avatarPrompt: "Warm illustrated cozy room aesthetic with cute warm tea companion"
  },
  gamer: {
    name: "GameMaster Core",
    role: "Elite Multi-Tasking Raid Leader",
    specialty: "Dismantling heavy homework blockages as easy boss fights",
    avatarPrompt: "Holographic retro esports gaming headset guide avatar"
  },
  scifi: {
    name: "OmniMind AI",
    role: "High-Frequency System Compiler",
    specialty: "Aggregating complex analytical maps and cyber blue arrays",
    avatarPrompt: "Sleek robotic compiler orb with rotating tech ring optics"
  },
  space: {
    name: "Astro-AI",
    role: "Planetary Telemetry Navigator",
    specialty: "Safeguarding smooth study orbits through hard meteor storms",
    avatarPrompt: "Sleek helmet-reflected space exploration astronaut avatar"
  },
  superhero: {
    name: "Commander AI",
    role: "Metropolitan Force General",
    specialty: "Vanquishing distraction villain clusters and protecting study speeds",
    avatarPrompt: "Tactical crimson superhero resolve crest advisor avatar"
  },
  minimalist: {
    name: "Mono AI",
    role: "Quiet Space Zen Coordinator",
    specialty: "Calm geometric balance and absolute noise reduction",
    avatarPrompt: "Concentric golden-ratio clean zen balance circles"
  }
};
