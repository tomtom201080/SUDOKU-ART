// src/components/QuestMap.jsx
import { useEffect, useState } from 'react';
import { QUEST_STAGES, rankForCompletedCount } from '../data/questStages';
import { fetchQuestProgress } from '../lib/questProgress';
import { resolveImagePath } from '../data/imageLibrary';
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
        <div className="quest-panel"><p>Chargement de ta quête…</p></div>
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

  // Petit décor inspiré des grands courants artistiques (Dalí, Picasso,
  // surréalisme...) disséminé tout le long du chemin.
  const decorationIcons = ['🎨', '🖼️', '🕰️', '🌀', '👁️', '♟️', '🗿', '🕊️', '🖌️', '🎭'];

  return (
    <QuestPathMap
      title="🏆 Quête Sudokart"
      stages={stages}
      completedStages={completedStages}
      currentRank={currentRank}
      trackKey="sudokart"
      decorationIcons={decorationIcons}
      onClose={onClose}
      onPlayStage={(stage) => onPlayStage(stage.raw)}
    />
  );
}
