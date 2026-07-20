// src/components/questIcons/davinciIcons.jsx
// Petites illustrations vectorielles dessinées à la main, dans l'esprit des
// carnets de Léonard de Vinci, pour décorer le parcours Sudomath.

function GearShape({ cx, cy, r, teeth = 8, fill, stroke }) {
  const points = [];
  for (let i = 0; i < teeth * 2; i++) {
    const angle = (i / (teeth * 2)) * Math.PI * 2;
    const radius = i % 2 === 0 ? r : r * 0.78;
    points.push(`${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`);
  }
  return <polygon points={points.join(' ')} fill={fill} stroke={stroke} strokeWidth="2" />;
}

export function GearClusterIcon({ size = 70 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <GearShape cx="38" cy="55" r="26" teeth={9} fill="#C9A24B" stroke="#5C4423" />
      <circle cx="38" cy="55" r="9" fill="#FBF3DE" stroke="#5C4423" strokeWidth="2" />
      <GearShape cx="70" cy="32" r="17" teeth={7} fill="#A98B52" stroke="#5C4423" />
      <circle cx="70" cy="32" r="6" fill="#FBF3DE" stroke="#5C4423" strokeWidth="2" />
    </svg>
  );
}

export function FlyingMachineIcon({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d="M5 45 Q 35 30, 50 48 Q 65 30, 95 45 Q 65 50, 50 58 Q 35 50, 5 45 Z"
        fill="#E3D5B8" stroke="#5C4423" strokeWidth="2.5" />
      <line x1="50" y1="48" x2="50" y2="75" stroke="#5C4423" strokeWidth="3" />
      <path d="M38 75 H62 L58 85 H42 Z" fill="#A98B52" stroke="#5C4423" strokeWidth="2" />
      <line x1="20" y1="42" x2="20" y2="50" stroke="#5C4423" strokeWidth="1.5" />
      <line x1="35" y1="38" x2="35" y2="50" stroke="#5C4423" strokeWidth="1.5" />
      <line x1="80" y1="42" x2="80" y2="50" stroke="#5C4423" strokeWidth="1.5" />
      <line x1="65" y1="38" x2="65" y2="50" stroke="#5C4423" strokeWidth="1.5" />
    </svg>
  );
}

export function QuillScrollIcon({ size = 65 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d="M15 85 Q 10 50, 30 25 L 80 8 Q 70 25, 50 40 Q 35 52, 28 70 Z"
        fill="#E3D5B8" stroke="#5C4423" strokeWidth="2.5" />
      <path d="M78 10 L 82 18" stroke="#5C4423" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 85 Q 30 80, 35 65" fill="none" stroke="#7A5C2E" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

export function CompassIcon({ size = 65 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="20" r="6" fill="#A98B52" stroke="#5C4423" strokeWidth="2" />
      <line x1="50" y1="22" x2="22" y2="88" stroke="#5C4423" strokeWidth="4" strokeLinecap="round" />
      <line x1="50" y1="22" x2="78" y2="88" stroke="#5C4423" strokeWidth="4" strokeLinecap="round" />
      <circle cx="22" cy="90" r="3.5" fill="#5C4423" />
      <circle cx="78" cy="90" r="3.5" fill="#5C4423" />
      <path d="M35 60 Q 50 65, 65 60" fill="none" stroke="#A98B52" strokeWidth="2" />
    </svg>
  );
}

export function VitruvianMotifIcon({ size = 75 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="42" fill="none" stroke="#5C4423" strokeWidth="2.5" opacity="0.8" />
      <rect x="18" y="18" width="64" height="64" fill="none" stroke="#5C4423" strokeWidth="2" opacity="0.6" />
      <circle cx="50" cy="33" r="8" fill="#E3D5B8" stroke="#5C4423" strokeWidth="2" />
      <line x1="50" y1="41" x2="50" y2="68" stroke="#5C4423" strokeWidth="3" />
      <line x1="20" y1="50" x2="80" y2="50" stroke="#5C4423" strokeWidth="3" />
      <line x1="50" y1="68" x2="32" y2="92" stroke="#5C4423" strokeWidth="2.5" />
      <line x1="50" y1="68" x2="68" y2="92" stroke="#5C4423" strokeWidth="2.5" />
    </svg>
  );
}

export function CastleTowerIcon({ size = 70 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="30" y="35" width="40" height="55" fill="#C9B88F" stroke="#5C4423" strokeWidth="2.5" />
      <polygon points="25,35 75,35 70,20 30,20" fill="#A98B52" stroke="#5C4423" strokeWidth="2" />
      <rect x="42" y="60" width="16" height="30" fill="#5C4423" />
      <rect x="35" y="42" width="8" height="10" fill="#5C4423" />
      <rect x="57" y="42" width="8" height="10" fill="#5C4423" />
    </svg>
  );
}

export const DAVINCI_ICONS = [
  GearClusterIcon,
  FlyingMachineIcon,
  QuillScrollIcon,
  CompassIcon,
  VitruvianMotifIcon,
  CastleTowerIcon
];
