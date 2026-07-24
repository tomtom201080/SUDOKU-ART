import { useT } from '../i18n/index.jsx';
import { calcAdjustedScore, formatAdjustedScore, fetchRematch, fetchGroupResults } from '../lib/rematches';
// src/components/WinModal.jsx
import { useState, useEffect } from 'react';
import { isMobileDevice, shareText } from '../utils/device';
import { trackShareClicked, trackShareCompleted } from '../lib/tracking';
import GroupResultsList from './GroupResultsList';
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
  challengerBaselineJustSet,
  activeRematch,
  userId,
  errorCount,
  elapsedSeconds,
  onReplay,
  onClose,
  onRequestRematch,
  onLoginToClaim }) {
  const { t, lang } = useT();
  const DIFFICULTY_KEYS = { facile: 'diff_facile', moyen: 'diff_moyen', complique: 'diff_complique', enfer: 'diff_enfer' };
  const diffLabel = (d) => (DIFFICULTY_KEYS[d] ? t(DIFFICULTY_KEYS[d]) : d);
  const [showSaveNotice, setShowSaveNotice] = useState(false);
  const [resultSent, setResultSent] = useState(false);
  const [rematchResultSent, setRematchResultSent] = useState(false);
  const [groupRematch, setGroupRematch] = useState(null);
  const [groupResults, setGroupResults] = useState(null);

  const isGroupRematch = !!activeRematch?.groupMode;
  // "Candidat libre" non connecté : le seul chemin vers un défi de groupe
  // sans session est celui du pseudo (IncomingDefiModal → onPlayFree), donc
  // playerPseudo est systématiquement renseigné dans ce cas précis.
  const isFreeAgentNotSignedIn = isGroupRematch && !userId && activeRematch.playerPseudo != null;

  useEffect(() => {
    if (!isGroupRematch) return;
    let cancelled = false;
    setGroupRematch(null);
    setGroupResults(null);
    Promise.all([fetchRematch(activeRematch.id), fetchGroupResults(activeRematch.id)]).then(([rematch, results]) => {
      if (cancelled) return;
      setGroupRematch(rematch);
      setGroupResults(results);
    });
    return () => { cancelled = true; };
  }, [isGroupRematch, activeRematch?.id]);

  const isMyGroupResult = (r) => {
    if (userId) return r.player_user_id === userId;
    return activeRematch?.playerPseudo != null && r.player_name === activeRematch.playerPseudo && r.player_user_id == null;
  };

  const isCustomGame = watermark?.isCustom;
  const photoUrl = isCustomGame ? watermark.path : null;
  const isChallengeGame = !!challengeMeta?.id;
  const contentType = isCustomGame ? 'personal_image' : (rewardImage ? 'artwork' : 'classic');
  const puzzleId = rewardImage?.id ?? watermark?.id ?? null;

  const handleSaveClick = () => {
    setShowSaveNotice(true);
  };

  const confirmSave = () => {
    trackShareClicked({ shareMethod: 'download_image', difficulty, contentType, puzzleId, completionTimeSeconds: elapsedSeconds });
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
    const canNativeShare = isMobileDevice() && !!navigator.share;
    trackShareClicked({
      shareMethod: canNativeShare ? 'native_share' : 'whatsapp',
      difficulty,
      contentType,
      puzzleId,
      completionTimeSeconds: elapsedSeconds
    });
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
            trackShareCompleted({ shareMethod: 'native_share', puzzleId });
            return;
          }
        }
        if (navigator.share) {
          await navigator.share({ title: 'Sudoku Art', url: 'https://sudokuart.com', text });
          trackShareCompleted({ shareMethod: 'native_share', puzzleId });
          return;
        }
      } catch {
        // annulé ou non supporté — on retombe sur WhatsApp
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSendResult = async () => {
    trackShareClicked({
      shareMethod: (isMobileDevice() && navigator.share) ? 'native_share' : 'whatsapp',
      difficulty, contentType, puzzleId, completionTimeSeconds: elapsedSeconds
    });
    const difficultyLabel = diffLabel(difficulty) ?? difficulty;
    const message =
      t('win_result_share_intro') +
      t('win_result_msg', { diff: difficultyLabel, errors: errorCount, time: formatTime(elapsedSeconds) });
    await shareText(message, t('fail_share_title'));
    setResultSent(true);
  };

  const handleSendRematchResult = async () => {
    trackShareClicked({
      shareMethod: (isMobileDevice() && navigator.share) ? 'native_share' : 'whatsapp',
      difficulty, contentType, puzzleId, completionTimeSeconds: elapsedSeconds
    });
    const name = rematchOutcome.challengerName ? `${rematchOutcome.challengerName}, ` : '';
    const verdict =
      rematchOutcome.winner === 'recipient' ? t('win_rematch_verdict_recipient') :
      rematchOutcome.winner === 'challenger' ? t('rematch_won_this_time') :
      t('rematch_perfect_tie');
    const message =
      t('win_rematch_share_intro', { name }) +
      t('rrd_me_line', { label: t('rrd_me'), errors: rematchOutcome.challengerErrors, time: formatTime(rematchOutcome.challengerSeconds) }) +
      t('rrd_me_line', { label: rematchOutcome.recipientName || t('rrd_friend'), errors: rematchOutcome.recipientErrors, time: formatTime(rematchOutcome.recipientSeconds) }) +
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

        {challengerBaselineJustSet && (
          <div className="rematch-outcome">
            <p className="rematch-outcome-title">{t('win_baseline_set_title')}</p>
            <p className="rematch-scoring-note">{t('win_baseline_set_desc')}</p>
          </div>
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

        {isGroupRematch && (
          <div className="rematch-outcome">
            <p className="rematch-outcome-title">{t('group_results_title')}</p>
            <GroupResultsList rematch={groupRematch} results={groupResults} isMe={isMyGroupResult} />
            <p className="rematch-scoring-note">{t('dd_scoring')}</p>

            {isFreeAgentNotSignedIn && (
              <div className="group-claim-box">
                <p className="group-claim-title">{t('group_claim_title')}</p>
                <p className="group-claim-desc">{t('group_claim_desc')}</p>
                <button className="win-btn-primary" onClick={onLoginToClaim}>{t('group_claim_btn')}</button>
              </div>
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
