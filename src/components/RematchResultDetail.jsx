// src/components/RematchResultDetail.jsx
import '../components/WinModal.css';
import './PaintingDetailModal.css';

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function RematchResultDetail({ rematch, winner, onClose }) {
  if (!rematch) return null;

  return (
    <div className="painting-detail-overlay" onClick={onClose}>
      <div className="painting-detail-panel" onClick={(e) => e.stopPropagation()}>
        <button className="painting-detail-close" onClick={onClose}>✕</button>

        <div className="rematch-outcome">
          <p className="rematch-outcome-title">
            {winner === 'challenger' && '🏆 Tu as gagné ce défi !'}
            {winner === 'recipient' && "😅 Ton ami a fait mieux que toi cette fois."}
            {winner === 'tie' && '🤝 Égalité parfaite !'}
          </p>
          <table className="rematch-outcome-table">
            <thead>
              <tr><th></th><th>Erreurs</th><th>Temps</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Toi</td>
                <td>{rematch.challenger_result_errors}</td>
                <td>{formatTime(rematch.challenger_result_seconds)}</td>
              </tr>
              <tr>
                <td>Ton ami</td>
                <td>{rematch.recipient_result_errors}</td>
                <td>{formatTime(rematch.recipient_result_seconds)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
