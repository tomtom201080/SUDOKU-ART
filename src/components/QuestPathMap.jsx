// src/components/QuestPathMap.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import './QuestPathMap.css';

const AMPLITUDE = 95;
const CENTER_X = 140;
const ROW_HEIGHT = 86;
const FREQUENCY = 0.7;
const NODE_RADIUS = 26;

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
  const steps = (stageCount - 1) * 10;
  for (let s = 0; s <= steps; s++) {
    const t = (s / 10);
    points.push(`${xForIndex(t).toFixed(1)},${yForIndex(t).toFixed(1)}`);
  }
  return `M ${points.join(' L ')}`;
}

export default function QuestPathMap({
  title,
  stages,
  completedStages,
  currentRank,
  trackKey,
  onPlayStage,
  onClose
}) {
  const containerRef = useRef(null);
  const avatarMemoryKey = `sudoku-devoile:questAvatarStage:${trackKey}`;

  const nextStageNumber = useMemo(
    () => stages.find(s => !completedStages.has(s.number))?.number ?? stages[stages.length - 1]?.number ?? 1,
    [stages, completedStages]
  );

  // Position de l'avatar : on le fait marcher depuis sa dernière position
  // mémorisée (sur cet appareil) jusqu'à l'étape actuelle, avec une petite
  // pause avant de partir et des étincelles à l'arrivée.
  const [avatarStage, setAvatarStage] = useState(nextStageNumber);
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
      const walkTimeout = setTimeout(() => {
        setAvatarStage(nextStageNumber);
        setTimeout(() => setShowSparkle(true), 900);
        setTimeout(() => setShowSparkle(false), 2100);
      }, 350);
      return () => clearTimeout(walkTimeout);
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
            <svg className="quest-path-svg" width="280" height={pathHeight} viewBox={`0 0 280 ${pathHeight}`}>
              <path d={curveD} className="quest-path-line" />
            </svg>

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
                  title={isLocked ? 'Étape verrouillée' : stage.image.title}
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
              className="quest-avatar-walker"
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
