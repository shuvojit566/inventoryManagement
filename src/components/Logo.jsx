export default function Logo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B" stopOpacity="1" />
          <stop offset="100%" stopColor="#FF8E72" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ECDC4" stopOpacity="1" />
          <stop offset="100%" stopColor="#44B78B" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD93D" stopOpacity="1" />
          <stop offset="100%" stopColor="#FFA500" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6C5CE7" stopOpacity="1" />
          <stop offset="100%" stopColor="#5F27CD" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Main box/container with 3D effect */}
      <path d="M 25 35 L 50 20 L 75 35 L 75 70 L 50 85 L 25 70 Z" fill="url(#grad1)" />
      <path d="M 50 20 L 75 35 L 75 70 L 50 85 Z" fill="#E63946" opacity="0.7" />
      <path d="M 25 35 L 50 20 L 50 85 L 25 70 Z" fill="#FF9E64" opacity="0.5" />

      {/* Shelves/layers inside box */}
      <rect x="28" y="40" width="44" height="3" fill="white" opacity="0.8" />
      <rect x="28" y="52" width="44" height="3" fill="white" opacity="0.6" />
      <rect x="28" y="64" width="44" height="3" fill="white" opacity="0.4" />

      {/* Left gear (teal/green) */}
      <circle cx="18" cy="65" r="12" fill="url(#grad2)" />
      <circle cx="18" cy="65" r="6" fill="white" />
      
      {/* Gear teeth */}
      <g fill="url(#grad2)">
        <rect x="16" y="50" width="4" height="5" rx="1" />
        <rect x="16" y="77" width="4" height="5" rx="1" />
        <rect x="3" y="63" width="5" height="4" rx="1" />
        <rect x="28" y="63" width="5" height="4" rx="1" />
      </g>

      {/* Right checklist (purple/blue) */}
      <rect x="75" y="50" width="22" height="28" rx="2" fill="url(#grad4)" />
      <line x1="80" y1="54" x2="92" y2="54" stroke="white" strokeWidth="1.5" opacity="0.7" />
      
      {/* Checkmarks */}
      <g stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="78,62 81,65 86,60" />
        <polyline points="78,72 81,75 86,70" />
      </g>

      {/* Decorative star accents */}
      <g fill="url(#grad3)">
        <circle cx="88" cy="35" r="3" />
        <circle cx="15" cy="25" r="2.5" opacity="0.7" />
      </g>
    </svg>
  )
}
