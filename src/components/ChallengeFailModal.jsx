// src/components/ChallengeFailModal.jsx
import './WinModal.css';

export default function ChallengeFailModal({ onReplay, onClose }) {
  return (
    <div className="win-overlay">
      <div className="win-panel">
        <h2>Défi échoué 😢</h2>
        <p className="win-difficulty">
          Trop d'erreurs ou temps écoulé — la photo ne sera pas dévoilée cette fois.
        </p>
        <div className="win-actions">
          <button className="win-btn-primary" onClick={onReplay}>Nouvelle partie</button>
          <button className="win-btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
