import { useT } from '../i18n/index.jsx';
// src/components/QuestMap.jsx
import { useEffect, useState } from 'react';
import { QUEST_STAGES, rankForCompletedCount } from '../data/questStages';
import { fetchQuestProgress } from '../lib/questProgress';
import { resolveImagePath } from '../data/imageLibrary';
import { ART_ICONS, ART_CHAPTERS } from './questIcons/index.js';
import QuestPathMap from './QuestPathMap';

export default function QuestMap({ userId, onClose, onPlayStage }) {
  const { t } = useT();
  const [completedStages, setCompletedStages] = useState(null);

  useEffect(() => {
    fetchQuestProgress(userId).then(progress => {
      setCompletedStages(new Set(progress.completed_stages));
    });
  }, [userId]);

  if (completedStages === null) {
    return (
      <div className="quest-overlay">
        <div className="quest-panel"><p>{t('_chargement_de_ta_qu_te')}</p></div>
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
      title=t('_qu_te_sudokart')
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
