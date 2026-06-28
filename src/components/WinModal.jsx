// src/components/WinModal.jsx
import { useState } from 'react';
import { TIER_LABELS } from '../data/imageLibrary';
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
  activeQuestStage,
  activeMathQuestStage,
  onSubmitMathAnswer,
  errorCount,
  elapsedSeconds,
  onReplay,
  onClose,
  onRequestRematch,
  onReturnToQuest,
  onReturnToMathQuest
}) {
  const [showSaveNotice, setShowSaveNotice] = useState(false);
  const [resultSent, setResultSent] = useState(false);
  const [rematchResultSent, setRematchResultSent] = useState(false);
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathFeedback, setMathFeedback] = useState(null); // null | 'wrong' | 'correct'

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

  const handleShare = async () => {
    if (!isMobileDevice()) {
      const text = 'Regarde la photo que j\'ai dévoilée en finissant mon Sudoku ! 🧩';
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      return;
    }

    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const file = new File([blob], 'sudoku-devoile-photo.jpg', { type: blob.type || 'image/jpeg' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Sudoku Art',
          text: 'Regarde la photo que j\'ai dévoilée en finissant mon Sudoku ! 🧩'
        });
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: 'Sudoku Art',
          text: 'Regarde la photo que j\'ai dévoilée en finissant mon Sudoku ! 🧩'
        });
        return;
      }
    } catch {
      // Le partage natif a échoué ou a été annulé : on retombe sur WhatsApp Web.
    }

    const text = encodeURIComponent('Regarde la photo que j\'ai dévoilée en finissant mon Sudoku ! 🧩');
    window.open(`https://wa.me/?text=${text}`, '_blank');
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

  const handleSubmitMathAnswer = (e) => {
    e.preventDefault();
    const correct = onSubmitMathAnswer(mathAnswer);
    setMathFeedback(correct ? 'correct' : 'wrong');
  };

  return (
    <div className="win-overlay">
      <div className="win-panel">
        <h2>Grille terminée ! 🎉</h2>
        <p className="win-difficulty">Difficulté : {DIFFICULTY_LABELS[difficulty] ?? difficulty}</p>

        {isChallengeGame && (
          <p className="win-challenge-stats">
            ❌ {errorCount} erreur{errorCount === 1 ? '' : 's'} — ⏱ {formatTime(elapsedSeconds)}
          </p>
        )}

        {activeQuestStage && (
          <div className="rematch-outcome">
            <p className="rematch-outcome-title">
              🏆 Étape {activeQuestStage.number} / 49 de la quête Sudokart terminée !
            </p>
            <button className="win-btn-secondary win-send-result-btn" onClick={onReturnToQuest}>
              Retour au parcours
            </button>
          </div>
        )}

        {activeMathQuestStage && (
          <div className="rematch-outcome">
            {mathFeedback === 'correct' ? (
              <>
                <p className="rematch-outcome-title">
                  🧠 Énigme résolue ! Étape {activeMathQuestStage.number} / 50 de Sudomath terminée !
                </p>
                <button className="win-btn-secondary win-send-result-btn" onClick={onReturnToMathQuest}>
                  Retour au parcours
                </button>
              </>
            ) : (
              <>
                <p className="rematch-outcome-title">
                  🧮 Pour valider cette étape, résous l'énigme :
                </p>
                <p className="hint-step-text">{activeMathQuestStage.riddle.question}</p>
                <form onSubmit={handleSubmitMathAnswer} className="math-answer-form">
                  <input
                    type="text"
                    className="challenge-name-input"
                    value={mathAnswer}
                    onChange={(e) => { setMathAnswer(e.target.value); setMathFeedback(null); }}
                    placeholder="Ta réponse"
                    autoFocus
                  />
                  <button type="submit" className="win-btn-primary">Valider</button>
                </form>
                {mathFeedback === 'wrong' && (
                  <p className="challenge-error-note">Pas tout à fait — réessaie !</p>
                )}
              </>
            )}
          </div>
        )}

        {rematchOutcome && (
          <div className="rematch-outcome">
            <p className="rematch-outcome-title">
              {rematchOutcome.winner === 'recipient' && '🏆 Tu as gagné ce défi !'}
              {rematchOutcome.winner === 'challenger' && '😅 Ton ami a fait mieux cette fois.'}
              {rematchOutcome.winner === 'tie' && '🤝 Égalité parfaite !'}
            </p>
            <table className="rematch-outcome-table">
              <thead>
                <tr><th></th><th>Erreurs</th><th>Temps</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>{rematchOutcome.challengerName || 'Ton ami'}</td>
                  <td>{rematchOutcome.challengerErrors}</td>
                  <td>{formatTime(rematchOutcome.challengerSeconds)}</td>
                </tr>
                <tr>
                  <td>Toi</td>
                  <td>{rematchOutcome.recipientErrors}</td>
                  <td>{formatTime(rematchOutcome.recipientSeconds)}</td>
                </tr>
              </tbody>
            </table>
            {!rematchOutcome.challengerHasAccount && (
              <button className="win-btn-secondary win-send-result-btn" onClick={handleSendRematchResult}>
                {rematchResultSent ? '✅ Résultat envoyé' : '📤 Envoyer le résultat par WhatsApp'}
              </button>
            )}
          </div>
        )}

        {isCustomGame ? (
          <>
            <p className="win-reward-label">Ta photo, entièrement dévoilée !</p>
            <img className="win-reward-image" src={photoUrl} alt="Photo personnelle dévoilée" />

            {isChallengeGame ? (
              <p className="win-challenge-note">
                Cette photo et ce défi vont maintenant être supprimés de nos serveurs.
              </p>
            ) : (
              <div className="win-photo-actions">
                <button className="win-btn-secondary" onClick={handleSaveClick}>
                  💾 Enregistrer la photo
                </button>
                <button className="win-btn-secondary" onClick={handleShare}>
                  📤 Envoyer à un ami
                </button>
              </div>
            )}
          </>
        ) : rewardImage ? (
          <>
            <p className="win-reward-label">
              Image débloquée — {TIER_LABELS[rewardImage.tier] ?? rewardImage.tier}
            </p>
            <img className="win-reward-image" src={rewardImage.path} alt={rewardImage.title ?? 'Récompense débloquée'} />

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
                  <p className="painting-observe">👀 À observer : {rewardImage.observe}</p>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="win-reward-label">
            Ajoute des images dans la bibliothèque pour débloquer des récompenses !
          </p>
        )}

        {isChallengeGame && challengeMeta.senderEmail && (
          <button className="win-btn-secondary win-send-result-btn" onClick={handleSendResult}>
            {resultSent ? '✅ Résultat envoyé' : `📤 Envoyer mon résultat à ${challengeMeta.senderEmail}`}
          </button>
        )}

        {!isChallengeGame && (
          <button className="win-btn-secondary win-send-result-btn" onClick={onRequestRematch}>
            🎯 Défier un ami avec cette grille
          </button>
        )}

        <div className="win-actions">
          <button className="win-btn-primary" onClick={onReplay}>Nouvelle partie</button>
          <button className="win-btn-secondary" onClick={onClose}>Fermer</button>
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
