// src/components/MathQuestMap.jsx
import { useEffect, useState } from 'react';
import { MATH_QUEST_STAGES, mathRankForCompletedCount } from '../data/mathQuestStages';
import { fetchMathQuestProgress } from '../lib/mathQuestProgress';
import { resolveImagePath } from '../data/imageLibrary';
import QuestPathMap from './QuestPathMap';

export default function MathQuestMap({ userId, onClose, onPlayStage }) {
  const [completedStages, setCompletedStages] = useState(null);

  useEffect(() => {
    fetchMathQuestProgress(userId).then(progress => {
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

  const stages = MATH_QUEST_STAGES.map(stage => ({
    number: stage.number,
    difficulty: stage.difficulty,
    image: {
      url: resolveImagePath('davinci', stage.finding, stage.finding.id),
      title: stage.finding.title
    },
    raw: stage
  }));

  const currentRank = mathRankForCompletedCount(completedStages.size);

  return (
    <QuestPathMap
      title="🧠 Quête Sudomath"
      stages={stages}
      completedStages={completedStages}
      currentRank={currentRank}
      trackKey="sudomath"
      onClose={onClose}
      onPlayStage={(stage) => onPlayStage(stage.raw)}
    />
  );
}
