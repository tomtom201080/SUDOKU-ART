import { useT } from '../i18n/index.jsx';
// src/components/InstallAppModal.jsx
import './InstallAppModal.css';

function detectPlatform() {
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isAndroid = /Android/.test(ua);
  return { isIOS, isAndroid };
}

export default function InstallAppModal({ onClose }) {
  const { t } = useT();

  const { isIOS, isAndroid } = detectPlatform();
  return (
    <div className="install-overlay">
      <div className="install-panel">
        <div className="install-header">
          <h2>{t('install_modal_title')}</h2>
          <button className="install-close" onClick={onClose}>✕</button>
        </div>

        <p className="install-intro">
          {t('install_intro_text')}
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
            {t('install_desktop_note')}
          </p>
        )}

        <button className="install-done-btn" onClick={onClose}>{t('install_done_btn')}</button>
      </div>
    </div>
  );
}
