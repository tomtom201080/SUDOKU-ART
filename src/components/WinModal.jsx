import { useT } from '../i18n/index.jsx';
import { calcAdjustedScore, formatAdjustedScore } from '../lib/rematches';
// src/components/WinModal.jsx
import { useState } from 'react';
import { isMobileDevice, shareText } from '../utils/device';
import './WinModal.css';


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
  onRequestRematch }) {
  const { t, lang } = useT();
  const DIFFICULTY_KEYS = { facile: 'diff_facile', moyen: 'diff_moyen', complique: 'diff_complique', enfer: 'diff_enfer' };
  const diffLabel = (d) => (DIFFICULTY_KEYS[d] ? t(DIFFICULTY_KEYS[d]) : d);
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
    const diff = diffLabel(difficulty) ?? difficulty ?? '';
    const title = rewardImage?.title;
    const time = formatTime(elapsedSeconds);
    const errors = errorCount === 0 ? t('win_no_error') : t('win_share_errors_count', { n: errorCount, s: errorCount > 1 ? 's' : '' });
    const painting = title ? t('win_share_intro_painting', { title }) : '';
    return t('win_share_text', { painting, diff, time, errors });
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
    const difficultyLabel = diffLabel(difficulty) ?? difficulty;
    const message =
      t('win_result_share_intro') +
      t('win_result_msg', { diff: difficultyLabel, errors: errorCount, time: formatTime(elapsedSeconds) });
    await shareText(message, t('fail_share_title'));
    setResultSent(true);
  };

  const handleSendRematchResult = async () => {
    const name = rematchOutcome.challengerName ? `${rematchOutcome.challengerName}, ` : '';
    const verdict =
      rematchOutcome.winner === 'recipient' ? t('win_rematch_verdict_recipient') :
      rematchOutcome.winner === 'challenger' ? t('rematch_won_this_time') :
      t('rematch_perfect_tie');
    const message =
      t('win_rematch_share_intro', { name }) +
      t('rrd_me_line', { label: t('rrd_me'), errors: rematchOutcome.challengerErrors, time: formatTime(rematchOutcome.challengerSeconds) }) +
      t('rrd_me_line', { label: t('rrd_friend'), errors: rematchOutcome.recipientErrors, time: formatTime(rematchOutcome.recipientSeconds) }) +
      verdict;
    await shareText(message, t('fail_share_title'));
    setRematchResultSent(true);
  };

  return (
    <div className="win-overlay">
      <div className="win-panel">
        <h2>{t('win_title')}</h2>
        <p className="win-difficulty">{t('win_difficulty_label')}{diffLabel(difficulty) ?? difficulty}</p>

        {isChallengeGame && (
          <p className="win-challenge-stats">
            {t('win_stats_row', { errors: errorCount, s: errorCount === 1 ? '' : 's', time: formatTime(elapsedSeconds) })}
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
                <tr><th></th><th>❌</th><th>💡</th><th>{t('win_table_raw')}</th><th>{t('win_table_score')}</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>{rematchOutcome.challengerName || t('win_a_friend')}</td>
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
            <p className="rematch-scoring-note">{t('scoring_note')}</p>
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
            <img className="win-reward-image" src={photoUrl} alt={t('win_personal_photo_alt')} />

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
            <img className="win-reward-image" src={rewardImage.path} alt={rewardImage.title ?? t('painting_unlocked_alt')} />

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
            {t('win_score', { time: formatTime(elapsedSeconds), errors: errorCount, s: errorCount !== 1 ? 's' : '' })}
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
          <button className="win-btn-primary" onClick={onReplay}>{t('win_new_game')}</button>
          <button className="win-btn-secondary" onClick={onClose}>{t('win_close')}</button>
        </div>
      </div>

      {showSaveNotice && (
        <div className="save-notice-overlay">
          <div className="save-notice-panel">
            <h3>{t('win_save_title')}</h3>
            <p>
              {t('win_save_notice_body')}
            </p>
            <div className="save-notice-actions">
              <button className="win-btn-primary" onClick={confirmSave}>{t('win_save_now')}</button>
              <button className="win-btn-secondary" onClick={() => setShowSaveNotice(false)}>{t('win_cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
