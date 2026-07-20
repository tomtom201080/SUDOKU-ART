import { useT } from '../i18n/index.jsx';
// src/components/QuestPathMap.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { resolveIcon } from './questIcons/index.js';
import './QuestPathMap.css';

const AMPLITUDE = 90;
const CENTER_X = 210;
const ROW_HEIGHT = 150; // chemin allongé entre deux étapes
const FREQUENCY = 0.7;
const NODE_RADIUS = 26;
const CANVAS_WIDTH = 420;

function xForIndex(index) {
  return CENTER_X + AMPLITUDE * Math.sin(index * FREQUENCY);
}

function yForIndex(index) {
  return 60 + index * ROW_HEIGHT;
}

// Échantillonne la courbe sinusoïdale en continu (pas seulement aux étapes)
// pour dessiner un vrai trait sinueux et lisse derrière les étapes.
function buildCurvePath(stageCount) {
  const points = [];
  const steps = (stageCount - 1) * 14;
  for (let s = 0; s <= steps; s++) {
    const t = (s / 14);
    points.push(`${xForIndex(t).toFixed(1)},${yForIndex(t).toFixed(1)}`);
  }
  return `M ${points.join(' L ')}`;
}

// Petite fonction déterministe "pseudo-aléatoire" (toujours le même résultat
// pour un même index), pour répartir le décor sans qu'il bouge à chaque rendu.
function seeded(index, salt = 0) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Construit le décor (illustrations SVG) placé entre les étapes, alterné de
// part et d'autre du chemin pour ne jamais recouvrir les ronds d'étape.
function buildDecorations(stageCount, icons) {
  if (!icons || icons.length === 0) return [];
  const decorations = [];
  for (let i = 0; i < stageCount - 1; i++) {
    const t = i + 0.5; // entre deux étapes
    const baseX = xForIndex(t);
    const baseY = yForIndex(t);
    const side = i % 2 === 0 ? 1 : -1;
    const offset = 55 + seeded(i, 1) * 15;
    const Icon = icons[Math.floor(seeded(i, 2) * icons.length)];
    const rotation = Math.round((seeded(i, 3) - 0.5) * 24);
    const size = Math.round(54 + seeded(i, 4) * 18);
    decorations.push({
      key: `deco-${i}`,
      Icon,
      x: baseX + side * offset,
      y: baseY + (seeded(i, 5) - 0.5) * 50,
      rotation,
      size
    });
  }
  return decorations;
}

export default function QuestPathMap({
  title,
  stages,
  completedStages,
  currentRank,
  trackKey,
  decorationIcons,
  chapters,
  onPlayStage,
  onClose
}) {
  const { t } = useT();
  const containerRef = useRef(null);
  const avatarMemoryKey = `sudoku-devoile:questAvatarStage:${trackKey}`;

  const nextStageNumber = useMemo(
    () => stages.find(s => !completedStages.has(s.number))?.number ?? stages[stages.length - 1]?.number ?? 1,
    [stages, completedStages]
  );

  // Position de l'avatar : on le fait marcher depuis sa dernière position
  // mémorisée (sur cet appareil) jusqu'à l'étape actuelle, avec une petite
  // pause avant de partir, un rebond de marche pendant le trajet, et des
  // étincelles à l'arrivée.
  const [avatarStage, setAvatarStage] = useState(nextStageNumber);
  const [isWalking, setIsWalking] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);

  useEffect(() => {
    let lastSeen = nextStageNumber;
    try {
      const stored = localStorage.getItem(avatarMemoryKey);
      if (stored) lastSeen = parseInt(stored, 10);
    } catch {
      // pas grave, on part directement de la position actuelle
    }

    if (lastSeen !== nextStageNumber && lastSeen >= 1) {
      setAvatarStage(lastSeen);
      const startWalkTimeout = setTimeout(() => {
        setIsWalking(true);
        setAvatarStage(nextStageNumber);
      }, 350);
      const stopWalkTimeout = setTimeout(() => {
        setIsWalking(false);
        setShowSparkle(true);
      }, 350 + 1300);
      const hideSparkleTimeout = setTimeout(() => setShowSparkle(false), 350 + 2500);
      return () => {
        clearTimeout(startWalkTimeout);
        clearTimeout(stopWalkTimeout);
        clearTimeout(hideSparkleTimeout);
      };
    }

    setAvatarStage(nextStageNumber);

    try {
      localStorage.setItem(avatarMemoryKey, String(nextStageNumber));
    } catch {
      // stockage indisponible, tant pis
    }
  }, [nextStageNumber, avatarMemoryKey]);

  // On centre la vue sur l'avatar à l'ouverture du parcours.
  useEffect(() => {
    if (!containerRef.current) return;
    const idx = stages.findIndex(s => s.number === nextStageNumber);
    const targetY = yForIndex(idx >= 0 ? idx : 0);
    containerRef.current.scrollTop = Math.max(0, targetY - 220);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pathHeight = yForIndex(stages.length - 1) + 80;
  const curveD = useMemo(() => buildCurvePath(stages.length), [stages.length]);
  const decorations = useMemo(
    () => buildDecorations(stages.length, decorationIcons),
    [stages.length, decorationIcons]
  );
  const avatarIndex = stages.findIndex(s => s.number === avatarStage);
  const avatarX = xForIndex(avatarIndex >= 0 ? avatarIndex : 0);
  const avatarY = yForIndex(avatarIndex >= 0 ? avatarIndex : 0);

  return (
    <div className="quest-overlay">
      <div className="quest-panel">
        <div className="quest-header">
          <h2>{title}</h2>
          <button className="quest-close" onClick={onClose}>✕</button>
        </div>

        <div className="quest-rank-banner">
          <span className="quest-rank-icon">{currentRank.icon}</span>
          <div>
            <p className="quest-rank-label">Rang actuel : {currentRank.label}</p>
            <p className="quest-rank-progress">{completedStages.size} / {stages.length} étapes terminées</p>
          </div>
        </div>

        <div className="quest-path-scroll" ref={containerRef}>
          <div className="quest-path-canvas" style={{ height: pathHeight }}>

            {/* Bandes de chapitre en arrière-plan, chacune avec son ambiance
                de couleur et son gros motif signature semi-transparent. */}
            {(chapters ?? []).map(chapter => {
              const fromY = yForIndex((stages.length - 1) * chapter.from);
              const toY = yForIndex((stages.length - 1) * Math.min(chapter.to, 1));
              const MotifIcon = resolveIcon(chapter.motif);
              const midY = (fromY + toY) / 2;
              return (
                <div
                  key={chapter.label}
                  className="quest-chapter-band"
                  style={{
                    top: fromY,
                    height: toY - fromY,
                    background: `linear-gradient(180deg, ${chapter.colorTop}, ${chapter.colorBottom})`
                  }}
                >
                  <span className="quest-chapter-label">{chapter.label}</span>
                  {MotifIcon && (
                    <div className="quest-chapter-motif" style={{ top: midY - fromY }}>
                      <MotifIcon size={190} />
                    </div>
                  )}
                </div>
              );
            })}

            <svg className="quest-path-svg" width={CANVAS_WIDTH} height={pathHeight} viewBox={`0 0 ${CANVAS_WIDTH} ${pathHeight}`}>
              <path d={curveD} className="quest-path-line-shadow" />
              <path d={curveD} className="quest-path-line" />
            </svg>

            {decorations.map(deco => {
              const Icon = deco.Icon;
              return (
                <div
                  key={deco.key}
                  className="quest-decoration"
                  style={{
                    left: deco.x,
                    top: deco.y,
                    transform: `translate(-50%, -50%) rotate(${deco.rotation}deg)`
                  }}
                  aria-hidden="true"
                >
                  <Icon size={deco.size} />
                </div>
              );
            })}

            {stages.map((stage, index) => {
              const isCompleted = completedStages.has(stage.number);
              const isNext = stage.number === nextStageNumber;
              const isLocked = !isCompleted && !isNext;
              const x = xForIndex(index);
              const y = yForIndex(index);

              return (
                <button
                  key={stage.number}
                  type="button"
                  className={[
                    'quest-node',
                    isCompleted ? 'is-completed' : '',
                    isNext ? 'is-next' : '',
                    isLocked ? 'is-locked' : ''
                  ].join(' ').trim()}
                  style={{ left: x - NODE_RADIUS, top: y - NODE_RADIUS }}
                  disabled={isLocked}
                  onClick={() => onPlayStage(stage)}
                  title={isLocked ? t('_tape_verrouill_e') : stage.image.title}
                >
                  {isCompleted ? (
                    <img className="quest-node-thumb" src={stage.image.url} alt={stage.image.title} />
                  ) : (
                    <span className="quest-node-number">{stage.number}</span>
                  )}
                </button>
              );
            })}

            <div
              className={`quest-avatar-walker ${isWalking ? 'is-walking' : ''}`}
              style={{ left: avatarX - 16, top: avatarY - 48 }}
            >
              <span className="quest-avatar-icon">{currentRank.icon}</span>
              {showSparkle && <span className="quest-avatar-sparkle">✨</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
