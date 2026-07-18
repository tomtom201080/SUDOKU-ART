// src/components/QuitConfirmModal.jsx
import './QuitConfirmModal.css';

export default function QuitConfirmModal({ onContinue, onLogin, onQuit }) {
  return (
    <div className="quit-overlay">
      <div className="quit-panel">
        <p className="quit-icon">⚠️</p>
        <h2 className="quit-title">Quitter la partie ?</h2>
        <p className="quit-desc">
          Ta progression sera perdue. Connecte-toi pour la sauvegarder
          et retrouver ta galerie sur tous tes appareils.
        </p>

        <div className="quit-actions">
          <button className="quit-btn-primary" onClick={onContinue}>
            ▶ Continuer à jouer
          </button>
          <button className="quit-btn-login" onClick={onLogin}>
            👤 Se connecter / S'inscrire
          </button>
          <button className="quit-btn-quit" onClick={onQuit}>
            Quitter sans sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
