import React from 'react';

/**
 * Detailed, animated vector scene for the hero: a modern home with a freshly
 * shingled pitched roof, sun, drifting clouds and a work ladder. Fully
 * self-contained SVG — no external image dependencies.
 */
export default function HeroScene({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 720 620"
      className={className}
      role="img"
      aria-label="Illustration of a house getting a new roof"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#dbeafe" />
        </linearGradient>
        <radialGradient id="dr-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff7cd" />
          <stop offset="0.5" stopColor="#fde047" />
          <stop offset="1" stopColor="#f59e0b" />
        </radialGradient>
        <linearGradient id="dr-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e40af" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="dr-roof-new" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="dr-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="dr-wall-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2e8f0" />
          <stop offset="1" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="dr-window" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
        <filter id="dr-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="24" floodColor="#1e3a8a" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Sky disc backdrop */}
      <circle cx="360" cy="300" r="300" fill="url(#dr-sky)" opacity="0.35" />

      {/* Sun */}
      <g className="dr-anim-sun">
        <circle cx="565" cy="140" r="52" fill="url(#dr-sun)" />
        <g stroke="#fbbf24" strokeWidth="7" strokeLinecap="round" opacity="0.8">
          <line x1="565" y1="52" x2="565" y2="30" />
          <line x1="641" y1="140" x2="663" y2="140" />
          <line x1="620" y1="85" x2="636" y2="69" />
          <line x1="620" y1="195" x2="636" y2="211" />
          <line x1="510" y1="85" x2="494" y2="69" />
        </g>
      </g>

      {/* Clouds */}
      <g fill="#ffffff" opacity="0.9">
        <g className="dr-anim-cloud">
          <ellipse cx="120" cy="120" rx="46" ry="26" />
          <ellipse cx="160" cy="128" rx="34" ry="22" />
          <ellipse cx="88" cy="132" rx="30" ry="18" />
        </g>
        <g className="dr-anim-cloud-2" opacity="0.8">
          <ellipse cx="300" cy="80" rx="38" ry="20" />
          <ellipse cx="332" cy="86" rx="26" ry="16" />
        </g>
      </g>

      {/* Ground */}
      <ellipse cx="360" cy="560" rx="330" ry="46" fill="#bbf7d0" opacity="0.7" />
      <ellipse cx="360" cy="566" rx="250" ry="30" fill="#86efac" opacity="0.7" />

      {/* House group */}
      <g filter="url(#dr-soft)">
        {/* Side wall (3D) */}
        <path d="M470 300 L560 250 L560 470 L470 500 Z" fill="url(#dr-wall-side)" />
        {/* Front wall */}
        <rect x="200" y="300" width="270" height="200" rx="6" fill="url(#dr-wall)" />

        {/* Roof — main pitched roof */}
        <path d="M170 320 L335 205 L500 320 Z" fill="url(#dr-roof)" />
        {/* Roof shingle rows */}
        <g stroke="#93c5fd" strokeWidth="3" opacity="0.55">
          <path d="M200 298 L335 205 L470 298" fill="none" />
          <path d="M228 278 L335 205 L442 278" fill="none" />
          <path d="M256 258 L335 205 L414 258" fill="none" />
        </g>
        {/* Freshly installed shingle patch (accent) */}
        <path d="M335 205 L500 320 L430 320 L335 254 Z" fill="url(#dr-roof-new)" opacity="0.95" />
        <g stroke="#fed7aa" strokeWidth="3" opacity="0.7">
          <path d="M360 248 L470 320" fill="none" />
          <path d="M388 268 L448 320" fill="none" />
        </g>
        {/* Side roof */}
        <path d="M500 320 L335 205 L425 158 L560 250 Z" fill="#1e3a8a" opacity="0.9" />

        {/* Chimney */}
        <rect x="430" y="180" width="34" height="70" fill="#475569" />
        <rect x="424" y="172" width="46" height="14" rx="3" fill="#334155" />

        {/* Door */}
        <rect x="316" y="400" width="60" height="100" rx="6" fill="#1d4ed8" />
        <circle cx="364" cy="452" r="4" fill="#fde68a" />

        {/* Windows */}
        <g>
          <rect x="232" y="350" width="58" height="58" rx="6" fill="url(#dr-window)" />
          <rect
            x="232"
            y="350"
            width="58"
            height="58"
            rx="6"
            fill="none"
            stroke="#ffffff"
            strokeWidth="6"
          />
          <line x1="261" y1="350" x2="261" y2="408" stroke="#ffffff" strokeWidth="4" />
          <line x1="232" y1="379" x2="290" y2="379" stroke="#ffffff" strokeWidth="4" />
        </g>
        <g>
          <rect x="392" y="350" width="58" height="58" rx="6" fill="url(#dr-window)" />
          <rect
            x="392"
            y="350"
            width="58"
            height="58"
            rx="6"
            fill="none"
            stroke="#ffffff"
            strokeWidth="6"
          />
          <line x1="421" y1="350" x2="421" y2="408" stroke="#ffffff" strokeWidth="4" />
          <line x1="392" y1="379" x2="450" y2="379" stroke="#ffffff" strokeWidth="4" />
        </g>
      </g>

      {/* Work ladder leaning on roof */}
      <g stroke="#f97316" strokeWidth="6" strokeLinecap="round" opacity="0.95">
        <line x1="486" y1="500" x2="452" y2="300" />
        <line x1="508" y1="500" x2="474" y2="300" />
        <line x1="480" y1="470" x2="500" y2="466" strokeWidth="5" />
        <line x1="474" y1="430" x2="494" y2="426" strokeWidth="5" />
        <line x1="468" y1="390" x2="488" y2="386" strokeWidth="5" />
        <line x1="462" y1="350" x2="482" y2="346" strokeWidth="5" />
      </g>

      {/* Floating tool / check badges within the scene */}
      <g className="dr-anim-float">
        <circle cx="140" cy="330" r="30" fill="#ffffff" />
        <path
          d="M128 330 l8 8 l16 -18"
          stroke="#16a34a"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
