// src/components/questIcons/artIcons.jsx
// Petites illustrations vectorielles dessinées à la main (pas des emoji),
// inspirées des grands courants artistiques, pour décorer le parcours Sudokart.

export function MeltingClockIcon({ size = 70 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="40" rx="30" ry="22" fill="#E8D9B5" stroke="#8B6F3A" strokeWidth="3" />
      <path d="M20 40 Q 25 75, 15 88 Q 30 85, 35 70" fill="#E8D9B5" stroke="#8B6F3A" strokeWidth="2.5" />
      <path d="M80 40 Q 78 70, 90 80 Q 75 78, 68 62" fill="#E8D9B5" stroke="#8B6F3A" strokeWidth="2.5" />
      <circle cx="50" cy="40" r="16" fill="#FBF3DE" stroke="#5C4423" strokeWidth="2" />
      <line x1="50" y1="40" x2="50" y2="29" stroke="#5C4423" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="40" x2="58" y2="44" stroke="#5C4423" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SurrealEyeIcon({ size = 70 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d="M5 50 Q 50 15, 95 50 Q 50 85, 5 50 Z" fill="#F4E9D8" stroke="#7A5C2E" strokeWidth="3" />
      <circle cx="50" cy="50" r="20" fill="#3E6E8C" />
      <circle cx="50" cy="50" r="10" fill="#1B2A33" />
      <circle cx="45" cy="45" r="3" fill="#fff" opacity="0.8" />
    </svg>
  );
}

export function PaletteIcon({ size = 70 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d="M50 8 C20 8 5 30 5 52 C5 72 20 85 38 85 C42 85 42 78 38 75 C34 72 36 66 42 66 H68 C85 66 95 52 95 38 C95 18 75 8 50 8 Z"
        fill="#F0E6D2" stroke="#6B4F2A" strokeWidth="3" />
      <circle cx="28" cy="35" r="7" fill="#D9534F" />
      <circle cx="50" cy="25" r="7" fill="#E8C547" />
      <circle cx="72" cy="35" r="7" fill="#4A90D9" />
      <circle cx="78" cy="55" r="7" fill="#5CB85C" />
    </svg>
  );
}

export function PicassoFaceIcon({ size = 70 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <polygon points="50,8 90,35 78,90 22,90 10,35" fill="#E3CBA5" stroke="#5C4423" strokeWidth="3" />
      <polygon points="30,40 48,30 48,55 28,60" fill="#D9534F" opacity="0.85" />
      <polygon points="52,30 72,42 74,62 52,55" fill="#4A90D9" opacity="0.85" />
      <circle cx="38" cy="44" r="5" fill="#222" />
      <circle cx="63" cy="48" r="5" fill="#222" />
      <polygon points="40,72 60,72 50,82" fill="#5C4423" />
    </svg>
  );
}

export function FrameIcon({ size = 70 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="8" y="8" width="84" height="84" rx="3" fill="#C9A24B" stroke="#6B4F2A" strokeWidth="4" />
      <rect x="20" y="20" width="60" height="60" fill="#EAF1F4" stroke="#6B4F2A" strokeWidth="2" />
      <path d="M22 70 L40 45 L52 58 L65 38 L78 70 Z" fill="#7BA6B5" />
      <circle cx="68" cy="30" r="6" fill="#E8C547" />
    </svg>
  );
}

export function DoveIcon({ size = 60 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d="M10 55 Q 35 20, 55 35 Q 70 22, 92 30 Q 75 38, 70 48 Q 85 48, 95 58 Q 78 56, 68 62 Q 60 80, 38 78 Q 50 65, 42 55 Q 25 60, 10 55 Z"
        fill="#F5F5F0" stroke="#8B8B7A" strokeWidth="2.5" />
      <circle cx="58" cy="38" r="3" fill="#333" />
    </svg>
  );
}

export const ART_ICONS = [
  MeltingClockIcon,
  SurrealEyeIcon,
  PaletteIcon,
  PicassoFaceIcon,
  FrameIcon,
  DoveIcon
];
