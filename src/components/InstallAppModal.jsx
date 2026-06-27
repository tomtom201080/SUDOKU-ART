// src/components/InstallAppModal.jsx
import './InstallAppModal.css';

function detectPlatform() {
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isAndroid = /Android/.test(ua);
  return { isIOS, isAndroid };
}

export default function InstallAppModal({ onClose }) {
  const { isIOS, isAndroid } = detectPlatform();

  return (
    <div className="install-overlay">
      <div className="install-panel">
        <div className="install-header">
          <h2>📲 Installer Sudoku Art</h2>
          <button className="install-close" onClick={onClose}>✕</button>
        </div>

        <p className="install-intro">
          Ajoute l'appli sur ton écran d'accueil : elle s'ouvrira comme une
          vraie application, en plein écran, sans passer par le navigateur.
        </p>

        {isIOS && (
          <ol className="install-steps">
            <li>Appuie sur le bouton <strong>Partager</strong> ⬆️ en bas de l'écran (Safari)</li>
            <li>Fais défiler et choisis <strong>"Sur l'écran d'accueil"</strong></li>
            <li>Appuie sur <strong>"Ajouter"</strong> en haut à droite</li>
          </ol>
        )}

        {isAndroid && (
          <ol className="install-steps">
            <li>Appuie sur le menu <strong>⋮</strong> (3 points) en haut à droite de Chrome</li>
            <li>Choisis <strong>"Installer l'application"</strong> ou <strong>"Ajouter à l'écran d'accueil"</strong></li>
            <li>Confirme l'ajout</li>
          </ol>
        )}

        {!isIOS && !isAndroid && (
          <p className="install-desktop-note">
            Cette option est surtout utile sur téléphone. Sur ordinateur, tu
            peux simplement garder cette page en favori.
          </p>
        )}

        <button className="install-done-btn" onClick={onClose}>Compris !</button>
      </div>
    </div>
  );
}
