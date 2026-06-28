// src/components/QuestMap.jsx
import { useEffect, useState } from 'react';
import { QUEST_STAGES, rankForCompletedCount } from '../data/questStages';
import { fetchQuestProgress } from '../lib/questProgress';
import { resolveImagePath } from '../data/imageLibrary';
import './QuestMap.css';

const DIFFICULTY_LABELS = {
  facile: 'Facile',
  moyen: 'Moyen',
  complique: 'Compliqué',
  enfer: 'Enfer'
};

export default function QuestMap({ userId, onClose, onPlayStage }) {
  const [completedStages, setCompletedStages] = useState(null);

  useEffect(() => {
    fetchQuestProgress(userId).then(progress => {
      setCompletedStages(new Set(progress.completed_stages));
    });
  }, [userId]);

  if (completedStages === null) {
    return (
      <div className="quest-overlay">
        <div className="quest-panel">
          <p>Chargement de ta quête…</p>
        </div>
      </div>
    );
  }

  const completedCount = completedStages.size;
  const currentRank = rankForCompletedCount(completedCount);
  // La prochaine étape jouable est la première non terminée du parcours.
  const nextStageNumber = QUEST_STAGES.find(s => !completedStages.has(s.number))?.number ?? null;

  return (
    <div className="quest-overlay">
      <div className="quest-panel">
        <div className="quest-header">
          <h2>🏆 Quête Sudokart</h2>
          <button className="quest-close" onClick={onClose}>✕</button>
        </div>

        <div className="quest-rank-banner">
          <span className="quest-rank-icon">{currentRank.icon}</span>
          <div>
            <p className="quest-rank-label">Rang actuel : {currentRank.label}</p>
            <p className="quest-rank-progress">{completedCount} / {QUEST_STAGES.length} étapes terminées</p>
          </div>
        </div>

        <div className="quest-path">
          {QUEST_STAGES.map(stage => {
            const isCompleted = completedStages.has(stage.number);
            const isNext = stage.number === nextStageNumber;
            const isLocked = !isCompleted && !isNext;

            return (
              <button
                key={stage.number}
                type="button"
                className={[
                  'quest-stage',
                  isCompleted ? 'is-completed' : '',
                  isNext ? 'is-next' : '',
                  isLocked ? 'is-locked' : ''
                ].join(' ').trim()}
                disabled={isLocked}
                onClick={() => onPlayStage(stage)}
              >
                <span className="quest-stage-number">{stage.number}</span>
                {isNext && <span className="quest-avatar">{currentRank.icon}</span>}
                <span className="quest-stage-thumb-wrapper">
                  {isCompleted ? (
                    <img
                      className="quest-stage-thumb"
                      src={resolveImagePath(stage.painting.tier, stage.painting, stage.painting.id)}
                      alt={stage.painting.title}
                    />
                  ) : (
                    <span className="quest-stage-mystery">?</span>
                  )}
                </span>
                <span className="quest-stage-difficulty">{DIFFICULTY_LABELS[stage.difficulty]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
