// src/components/QuitConfirmModal.jsx
import { useT } from '../i18n/index.jsx';
import './QuitConfirmModal.css';

export default function QuitConfirmModal({ onContinue, onLogin, onQuit }) {
  const { t } = useT();
  return (
    <div className="quit-overlay">
      <div className="quit-panel">
        <p className="quit-icon">⚠️</p>
        <h2 className="quit-title">{t('quit_title')}</h2>
        <p className="quit-desc">{t('quit_desc')}</p>
        <div className="quit-actions">
          <button className="quit-btn-primary" onClick={onContinue}>{t('quit_continue')}</button>
          <button className="quit-btn-login" onClick={onLogin}>{t('quit_login')}</button>
          <button className="quit-btn-quit" onClick={onQuit}>{t('quit_anyway')}</button>
        </div>
      </div>
    </div>
  );
}
