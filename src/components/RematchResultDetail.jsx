import { useT } from '../i18n/index.jsx';
// src/components/RematchResultDetail.jsx
import '../components/WinModal.css';
import './PaintingDetailModal.css';

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// isSent : true si l'utilisateur courant est l'expéditeur (challenger) de ce
// défi, false s'il en est le destinataire (recipient) — inverse "moi" et
// "mon ami" dans l'affichage en conséquence. Par défaut à true (comportement
// historique : ce composant n'était utilisé que depuis la bannière d'accueil,
// toujours du point de vue de l'expéditeur).
export default function RematchResultDetail({ rematch, winner, isSent = true, onClose }) {
  const { t } = useT();
  if (!rematch) return null;

  const tie = winner === 'tie';
  const iWon = (isSent && winner === 'challenger') || (!isSent && winner === 'recipient');

  const meErrors = isSent ? rematch.challenger_result_errors : rematch.recipient_result_errors;
  const meSeconds = isSent ? rematch.challenger_result_seconds : rematch.recipient_result_seconds;
  const friendErrors = isSent ? rematch.recipient_result_errors : rematch.challenger_result_errors;
  const friendSeconds = isSent ? rematch.recipient_result_seconds : rematch.challenger_result_seconds;
  const friendName = (isSent ? rematch.recipient_name : rematch.challenger_name) || t('rrd_friend');

  return (
    <div className="painting-detail-overlay" onClick={onClose}>
      <div className="painting-detail-panel" onClick={(e) => e.stopPropagation()}>
        <button className="painting-detail-close" onClick={onClose}>✕</button>

        <div className="rematch-outcome">
          <p className="rematch-outcome-title">
            {tie ? t('rematch_perfect_tie') : iWon ? t('win_rematch_title_win') : t('rrd_friend_better')}
          </p>
          <table className="rematch-outcome-table">
            <thead>
              <tr><th></th><th>{t('rrd_errors')}</th><th>{t('rrd_time')}</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>{t('rrd_me')}</td>
                <td>{meErrors}</td>
                <td>{formatTime(meSeconds)}</td>
              </tr>
              <tr>
                <td>{friendName}</td>
                <td>{friendErrors}</td>
                <td>{formatTime(friendSeconds)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
