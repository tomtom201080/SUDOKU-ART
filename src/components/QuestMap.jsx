// src/components/QuestMap.jsx
import { useEffect, useState } from 'react';
import { QUEST_STAGES, rankForCompletedCount } from '../data/questStages';
import { fetchQuestProgress } from '../lib/questProgress';
import { resolveImagePath } from '../data/imageLibrary';
import { ART_ICONS, ART_CHAPTERS } from './questIcons/index.js';
import QuestPathMap from './QuestPathMap';

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
        <div className="quest-panel"><p>{lang === 'fr' ? 'Chargement de ta quête…' : 'Loading your quest…'}</p></div>
      </div>
    );
  }

  const stages = QUEST_STAGES.map(stage => ({
    number: stage.number,
    difficulty: stage.difficulty,
    image: {
      url: resolveImagePath(stage.painting.tier, stage.painting, stage.painting.id),
      title: stage.painting.title
    },
    raw: stage
  }));

  const currentRank = rankForCompletedCount(completedStages.size);

  return (
    <QuestPathMap
      title="🏆 Quête Sudokart"
      stages={stages}
      completedStages={completedStages}
      currentRank={currentRank}
      trackKey="sudokart"
      decorationIcons={ART_ICONS}
      chapters={ART_CHAPTERS}
      onClose={onClose}
      onPlayStage={(stage) => onPlayStage(stage.raw)}
    />
  );
}
