// src/components/IncomingDefiModal.jsx
import './QuitConfirmModal.css';
import './IncomingDefiModal.css';

export default function IncomingDefiModal({ rematch, onLogin, onPlayFree }) {
  const diff = {
    facile: 'Facile', moyen: 'Moyen', complique: 'Compliqué', enfer: 'Enfer'
  }[rematch?.difficulty] ?? rematch?.difficulty ?? '';

  const challengerName = rematch?.challenger_name ?? 'Un ami';
  const hasPhoto = !!rematch?.photo_path;
  const hintsLimit = rematch?.hints_limit;

  return (
    <div className="quit-overlay">
      <div className="quit-panel">
        <p className="quit-icon">🎯</p>
        <h2 className="quit-title">{challengerName} te défie !</h2>
        <div className="incoming-defi-info">
          <span>🎮 {diff}</span>
          {hasPhoto && <span>📷 Photo cachée</span>}
          {hintsLimit != null && <span>💡 Max {hintsLimit} indice{hintsLimit > 1 ? 's' : ''}</span>}
          <span>⏱ +2 min par erreur ou indice</span>
        </div>
        <p className="incoming-defi-note">
          Connecte-toi pour que ton score soit rattaché à ton compte et que {challengerName} voie le résultat.
        </p>
        <div className="quit-actions">
          <button className="quit-btn-primary" onClick={onLogin}>
            👤 Se connecter / S'inscrire
          </button>
          <button className="quit-btn-login" onClick={onPlayFree}>
            🎮 Jouer en participation libre
          </button>
        </div>
      </div>
    </div>
  );
}
