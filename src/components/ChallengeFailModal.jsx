import { useT } from '../i18n/index.jsx';
// src/components/ChallengeFailModal.jsx
import { useState } from 'react';
import { shareText } from '../utils/device';
import './WinModal.css';

const DIFFICULTY_LABELS = {
  moyen: 'Moyen',
  complique: 'Compliqué',
  enfer: 'Enfer'
};

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function ChallengeFailModal({
  difficulty,
  challengeMeta,
  errorCount,
  elapsedSeconds,
  onReplay,
  onClose
}) {
  const [resultSent, setResultSent] = useState(false);

  const handleSendResult = async () => {
    const difficultyLabel = DIFFICULTY_LABELS[difficulty] ?? difficulty;
    const message =
      `😢 J'ai perdu le défi Sudoku Art que tu m'as envoyé...\n` +
      `Difficulté : ${difficultyLabel} — Erreurs : ${errorCount} — Temps : ${formatTime(elapsedSeconds)}`;
    await shareText(message, t('fail_share_title'));
    setResultSent(true);
  };

  return (
    <div className="win-overlay">
      <div className="win-panel">
        <h2>{t('fail_title')}</h2>
        <p className="win-difficulty">
          {t('fail_too_many')}
        </p>

        {challengeMeta?.id && (
          <p className="win-challenge-stats">
            ❌ {errorCount} erreur{errorCount === 1 ? '' : 's'} — ⏱ {formatTime(elapsedSeconds)}
          </p>
        )}

        {challengeMeta?.id && (
          <p className="win-challenge-note">
            Cette photo et ce défi vont maintenant être supprimés de nos serveurs.
          </p>
        )}

        {challengeMeta?.senderEmail && (
          <button className="win-btn-secondary win-send-result-btn" onClick={handleSendResult}>
            {resultSent ? t('fail_result_sent') : t('fail_send_result', { email: challengeMeta.senderEmail })}
          </button>
        )}

        <div className="win-actions">
          <button className="win-btn-primary" onClick={onReplay}>{t('fail_new_game')}</button>
          <button className="win-btn-secondary" onClick={onClose}>{t('fail_close')}</button>
        </div>
      </div>
    </div>
  );
}
