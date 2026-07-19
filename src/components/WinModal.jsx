import { useT } from '../i18n/index.jsx';
import { calcAdjustedScore, formatAdjustedScore } from '../lib/rematches';
// src/components/WinModal.jsx
import { useState } from 'react';
import { isMobileDevice, shareText } from '../utils/device';
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

export default function WinModal({
  difficulty,
  rewardImage,
  watermark,
  challengeMeta,
  rematchOutcome,
  errorCount,
  elapsedSeconds,
  onReplay,
  onClose,
  onRequestRematch,
}) {
  const { t } = useT();
  const [showSaveNotice, setShowSaveNotice] = useState(false);
  const [resultSent, setResultSent] = useState(false);
  const [rematchResultSent, setRematchResultSent] = useState(false);

  const isCustomGame = watermark?.isCustom;
  const photoUrl = isCustomGame ? watermark.path : null;
  const isChallengeGame = !!challengeMeta?.id;

  const handleSaveClick = () => {
    setShowSaveNotice(true);
  };

  const confirmSave = () => {
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = 'sudoku-devoile-photo.jpg';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setShowSaveNotice(false);
  };

  const shareAchievementText = () => {
    const diff = DIFFICULTY_LABELS[difficulty] ?? difficulty ?? '';
    const title = rewardImage?.title;
    const time = formatTime(elapsedSeconds);
    const errors = errorCount === 0 ? 'aucune erreur 🏆' : `${errorCount} erreur${errorCount > 1 ? 's' : ''}`;
    const painting = title ? `J'ai dévoilé "${title}" en finissant mon Sudoku Art ! 🎨\n` : '';
    return `${painting}Difficulté : ${diff} — ${time} — ${errors}\nJoue aussi : https://sudoku-art.vercel.app`;
  };

  const handleShare = async () => {
    const text = shareAchievementText();
    const rewardUrl = rewardImage?.path ?? photoUrl;

    if (isMobileDevice()) {
      try {
        if (rewardUrl) {
          const response = await fetch(rewardUrl);
          const blob = await response.blob();
          const file = new File([blob], 'sudoku-art.jpg', { type: blob.type || 'image/jpeg' });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: 'Sudoku Art', text });
            return;
          }
        }
        if (navigator.share) {
          await navigator.share({ title: 'Sudoku Art', url: 'https://sudoku-art.vercel.app', text });
          return;
        }
      } catch {
        // annulé ou non supporté — on retombe sur WhatsApp
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSendResult = async () => {
    const difficultyLabel = DIFFICULTY_LABELS[difficulty] ?? difficulty;
    const message =
      `🎉 J'ai réussi le défi Sudoku Art que tu m'as envoyé !\n` +
      `Difficulté : ${difficultyLabel} — Erreurs : ${errorCount} — Temps : ${formatTime(elapsedSeconds)}`;
    await shareText(message, 'Résultat du défi Sudoku Art');
    setResultSent(true);
  };

  const handleSendRematchResult = async () => {
    const name = rematchOutcome.challengerName ? `${rematchOutcome.challengerName}, ` : '';
    const verdict =
      rematchOutcome.winner === 'recipient' ? "J'ai gagné ! 🏆" :
      rematchOutcome.winner === 'challenger' ? 'Tu as gagné cette fois 😅' :
      'Égalité parfaite !';
    const message =
      `${name}voici le résultat de notre défi sur la même grille :\n` +
      `Toi : ${rematchOutcome.challengerErrors} erreur(s), ${formatTime(rematchOutcome.challengerSeconds)}\n` +
      `Moi : ${rematchOutcome.recipientErrors} erreur(s), ${formatTime(rematchOutcome.recipientSeconds)}\n` +
      verdict;
    await shareText(message, 'Résultat du défi Sudoku Art');
    setRematchResultSent(true);
  };

  return (
    <div className="win-overlay">
      <div className="win-panel">
        <h2>{t('win_title')}</h2>
        <p className="win-difficulty">Difficulté : {DIFFICULTY_LABELS[difficulty] ?? difficulty}</p>

        {isChallengeGame && (
          <p className="win-challenge-stats">
            ❌ {errorCount} erreur{errorCount === 1 ? '' : 's'} — ⏱ {formatTime(elapsedSeconds)}
          </p>
        )}

        {rematchOutcome && (
          <div className="rematch-outcome">
            <p className="rematch-outcome-title">
              {rematchOutcome.winner === 'recipient' && t('win_rematch_title_win')}
              {rematchOutcome.winner === 'challenger' && t('win_rematch_title_lose')}
              {rematchOutcome.winner === 'tie' && t('win_rematch_title_tie')}
            </p>
            <table className="rematch-outcome-table">
              <thead>
                <tr><th></th><th>❌</th><th>💡</th><th>⏱ Brut</th><th>🏁 Score</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>{rematchOutcome.challengerName || 'Ton ami'}</td>
                  <td>{rematchOutcome.challengerErrors}</td>
                  <td>{rematchOutcome.challengerHints ?? 0}</td>
                  <td>{formatTime(rematchOutcome.challengerSeconds)}</td>
                  <td><strong>{formatAdjustedScore(calcAdjustedScore({ seconds: rematchOutcome.challengerSeconds, errors: rematchOutcome.challengerErrors, hints: rematchOutcome.challengerHints ?? 0 }))}</strong></td>
                </tr>
                <tr>
                  <td>{t('win_me')}</td>
                  <td>{rematchOutcome.recipientErrors}</td>
                  <td>{rematchOutcome.recipientHints ?? 0}</td>
                  <td>{formatTime(rematchOutcome.recipientSeconds)}</td>
                  <td><strong>{formatAdjustedScore(calcAdjustedScore({ seconds: rematchOutcome.recipientSeconds, errors: rematchOutcome.recipientErrors, hints: rematchOutcome.recipientHints ?? 0 }))}</strong></td>
                </tr>
              </tbody>
            </table>
            <p className="rematch-scoring-note">⏱ +2 min par erreur · 💡 +2 min par indice</p>
            {!rematchOutcome.challengerHasAccount && (
              <button className="win-btn-secondary win-send-result-btn" onClick={handleSendRematchResult}>
                {rematchResultSent ? t('win_rematch_sent') : t('win_rematch_send')}
              </button>
            )}
          </div>
        )}

        {isCustomGame ? (
          <>
            <p className="win-reward-label">{t('win_photo_revealed')}</p>
            <img className="win-reward-image" src={photoUrl} alt="Photo personnelle dévoilée" />

            {isChallengeGame ? (
              <p className="win-challenge-note">
                {t('win_challenge_note')}
              </p>
            ) : (
              <div className="win-photo-actions">
                <button className="win-btn-secondary" onClick={handleSaveClick}>
                  {t('win_save_photo')}
                </button>
                <button className="win-btn-secondary" onClick={handleShare}>
                  {t('win_share')}
                </button>
              </div>
            )}
          </>
        ) : rewardImage ? (
          <>
            <img className="win-reward-image" src={rewardImage.path} alt={rewardImage.title ?? 'Tableau débloqué'} />

            {rewardImage.title && (
              <div className="painting-info">
                <p className="painting-title">{rewardImage.title}</p>
                <p className="painting-meta">
                  {rewardImage.artist}{rewardImage.year ? ` — ${rewardImage.year}` : ''}
                </p>
                {rewardImage.style && <p className="painting-meta">{rewardImage.style}</p>}
                {rewardImage.museum && (
                  <p className="painting-museum">
                    📍 {rewardImage.museum}
                    {rewardImage.city ? `, ${rewardImage.city}` : ''}
                    {rewardImage.country ? ` (${rewardImage.country})` : ''}
                  </p>
                )}
                {rewardImage.funFact && (
                  <p className="painting-fun-fact">💡 {rewardImage.funFact}</p>
                )}
                {rewardImage.observe && (
                  <p className="painting-observe">{t('painting_observe')}{rewardImage.observe}</p>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="win-score">
            ⏱ {formatTime(elapsedSeconds)} — ❌ {errorCount} erreur{errorCount !== 1 ? 's' : ''}
          </p>
        )}

        {isChallengeGame && challengeMeta.senderEmail && (
          <button className="win-btn-secondary win-send-result-btn" onClick={handleSendResult}>
            {resultSent ? t('win_rematch_sent') : `${t('win_send_result')}${challengeMeta.senderEmail}`}
          </button>
        )}

        {!isChallengeGame && (
          <button className="win-btn-secondary win-send-result-btn" onClick={onRequestRematch}>
            {t('win_challenge_friend')}
          </button>
        )}

        <div className="win-actions">
          <button className="win-btn-primary" onClick={onReplay}>Nouvelle partie</button>
          <button className="win-btn-secondary" onClick={onClose}>{t('win_close')}</button>
        </div>
      </div>

      {showSaveNotice && (
        <div className="save-notice-overlay">
          <div className="save-notice-panel">
            <h3>Enregistrer la photo</h3>
            <p>
              Cette photo sera supprimée d'ici un mois. Si tu veux la garder,
              enregistre-la maintenant sur ton téléphone ou ton ordinateur.
            </p>
            <div className="save-notice-actions">
              <button className="win-btn-primary" onClick={confirmSave}>Enregistrer maintenant</button>
              <button className="win-btn-secondary" onClick={() => setShowSaveNotice(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
