import React from "react";

interface LogoProps {
  className?: string;
  isAnimated?: boolean;
}

export const NeuroVerseBrandLogo: React.FC<LogoProps> = ({ className = "w-24 h-24", isAnimated = true }) => {
  const rotationClass = isAnimated ? "animate-[spin_12s_linear_infinite]" : "";
  const pulseClass = isAnimated ? "animate-pulse" : "";

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none`}
    >
      <defs>
        {/* Core tech colors / gradients */}
        <linearGradient id="logo-body-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan */}
          <stop offset="50%" stopColor="#3b82f6" /> {/* Electric Blue */}
          <stop offset="100%" stopColor="#8b5cf6" /> {/* Cosmic Purple */}
        </linearGradient>

        <linearGradient id="orbit-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
        </linearGradient>

        <radialGradient id="brain-glow" cx="65" cy="45" r="30">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>

        {/* Filter for cyber-glow intensity */}
        <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 1. Deep space backdrop orbits indicating the "NeuroVerse" dimensions */}
      <circle
        cx="60"
        cy="60"
        r="54"
        stroke="url(#orbit-grad)"
        strokeWidth="0.75"
        strokeDasharray="4,8"
        className={rotationClass}
      />
      <circle
        cx="60"
        cy="60"
        r="48"
        stroke="#8b5cf6"
        strokeWidth="0.5"
        opacity="0.2"
      />
      
      {/* Dynamic planetary tilt ring */}
      <ellipse
        cx="60"
        cy="60"
        rx="56"
        ry="16"
        stroke="url(#logo-body-grad)"
        strokeWidth="1.2"
        opacity="0.45"
        transform="rotate(-28 60 60)"
        className={pulseClass}
      />

      {/* 2. Soft neural background core glow centered at the brain/insight coordinate */}
      <circle cx="68" cy="48" r="22" fill="url(#brain-glow)" className={pulseClass} />

      {/* 3. High-Contrast Premium Silhouette of the Futuristic Boy (looking slightly upward) */}
      {/* Masterfully structured vector profile with modern cyberpunk hair spiked, looking to the right */}
      <path
        d="M26 102 
           C 28 92, 34 82, 42 78 
           C 48 75, 52 76, 54 70 
           C 54.5 68, 52 64, 51 61 
           C 50 58, 46 54, 46 45 
           C 46 32, 53 22, 68 20 
           C 82 18, 92 28, 94 44 
           C 95 52, 92 56, 92 58 
           C 92 59, 93.5 59.5, 94.5 60.5 
           C 96 62, 96.5 63, 94 64.5 
           C 91 66.5, 87 67, 85 68 
           C 82.5 69.2, 82 71.5, 83.5 74.5 
           C 85 77.5, 88 88, 91 102
           "
        fill="#020617"
        stroke="url(#logo-body-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow-effect)"
      />

      {/* Dynamic Futuristic Hair overlay structure */}
      <path
        d="M48 40 
           C 44 32, 50 20, 58 16 
           C 62 21, 64 24, 63 26 
           C 70 17, 78 18, 83 22 
           C 85 24, 84 27, 82 28 
           C 89 25, 96 28, 95 36 
           C 93 36, 91 35, 90 35
           C 94 38, 93.5 42, 92.5 44"
        fill="url(#logo-body-grad)"
        opacity="0.25"
      />

      {/* 4. Elegant Neural-Constellation Pathways Overlaying the Heart of the Character */}
      {/* These coordinates map clean cerebral networks and node connectors */}
      <g stroke="#22d3ee" strokeWidth="1" opacity="0.85">
        {/* Connection networks */}
        <line x1="68" y1="36" x2="80" y2="34" className={pulseClass} />
        <line x1="68" y1="36" x2="62" y2="46" />
        <line x1="80" y1="34" x2="84" y2="44" />
        <line x1="62" y1="46" x2="74" y2="48" />
        <line x1="84" y1="44" x2="74" y2="48" className={pulseClass} />
        <line x1="74" y1="48" x2="70" y2="60" />
        <line x1="62" y1="46" x2="56" y2="56" />
        <line x1="56" y1="56" x2="70" y2="60" className={pulseClass} />
      </g>

      {/* Glowing Constellation star vertices */}
      <g fill="#ffffff" filter="url(#glow-effect)">
        {/* Star 1 - Visionary Mind */}
        <circle cx="68" cy="36" r="2.5 animate-pulse" fill="#22d3ee">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        
        {/* Star 2 - Logic Center */}
        <circle cx="80" cy="34" r="2" fill="#a855f7" />

        {/* Star 3 - Insight Core */}
        <circle cx="84" cy="44" r="3" fill="#22d3ee" className={pulseClass}>
          <animate attributeName="r" values="2;3.2;2" dur="3.5s" repeatCount="indefinite" />
        </circle>

        {/* Star 4 - Cognitive Focal Point */}
        <circle cx="74" cy="48" r="2.5" fill="#3b82f6" />

        {/* Star 5 - Intuition Base */}
        <circle cx="62" cy="46" r="2" fill="#22d3ee" />

        {/* Star 6 - Emotional Intelligence Root */}
        <circle cx="70" cy="60" r="3" fill="#a855f7" className={pulseClass} />

        {/* Star 7 - Academic Resolve Vertex */}
        <circle cx="56" cy="56" r="2" fill="#22d3ee" />
      </g>

      {/* Floating Sparkles in the outer atmosphere representing memory nodes */}
      <circle cx="28" cy="34" r="1" fill="#22d3ee" className={pulseClass} />
      <circle cx="102" cy="85" r="1.5" fill="#a855f7" />
      <circle cx="94" cy="24" r="1.2" fill="#ffffff" className={pulseClass} />
      <polygon
        points="40,22 41.5,25 44,25.5 41.5,26 40,29 38.5,26 36,25.5 38.5,25"
        fill="#22d3ee"
        opacity="0.7"
        className={pulseClass}
      />
    </svg>
  );
};
