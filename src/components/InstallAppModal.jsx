import { translate as t, useT } from '../i18n/index.jsx';
// src/components/InstallAppModal.jsx
import './InstallAppModal.css';

function detectPlatform() {
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isAndroid = /Android/.test(ua);
  return { isIOS, isAndroid };
}

export default function InstallAppModal({ onClose }) {
  const { lang } = useT();

  const { isIOS, isAndroid } = detectPlatform();
  return (
    <div className="install-overlay">
      <div className="install-panel">
        <div className="install-header">
          <h2>{lang === 'fr' ? '📲 Installer Sudoku Art' : '📲 Install Sudoku Art'}</h2>
          <button className="install-close" onClick={onClose}>✕</button>
        </div>

        <p className="install-intro">
          Ajoute llang === 'fr' ? 'appli sur ton écran d\'' : 'app on your home screen'accueil : elle s'ouvrira comme une
          vraie application, en plein écran, sans passer par le navigateur.
        </p>

        {isIOS && (
          <ol className="install-steps">
            <li>{t('install_ios1')}</li>
            <li>{t('install_ios2')}</li>
            <li>{t('install_ios3')}</li>
          </ol>
        )}

        {isAndroid && (
          <ol className="install-steps">
            <li>{t('install_android1')}</li>
            <li>{t('install_android2')}</li>
            <li>{t('install_android3')}</li>
          </ol>
        )}

        {!isIOS && !isAndroid && (
          <p className="install-desktop-note">
            Cette option est surtout utile sur téléphone. Sur ordinateur, tu
            peux simplement garder cette page en favori.
          </p>
        )}

        <button className="install-done-btn" onClick={onClose}>{lang === 'fr' ? 'Compris !' : 'Got it!'}</button>
      </div>
    </div>
  );
}
