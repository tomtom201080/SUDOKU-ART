// src/components/AppActionsBar.jsx
// Barre "Installer l'application" + "Partager à un ami", affichée au même
// endroit (sous la grille / sous les vignettes de navigation) sur l'écran
// de jeu et sur l'écran d'accueil — voir App.jsx, deux emplacements,
// même composant, mêmes props pour garantir un rendu identique.
import { useState } from 'react';
import { useT } from '../i18n/index.jsx';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { isMobileDevice } from '../utils/device';
import './AppActionsBar.css';

const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://sudoku-art.vercel.app';

// onShowInstallInstructions : ouvre la modale d'instructions existante
// (InstallAppModal) — utilisée seulement en repli, quand le navigateur ne
// propose pas d'invite d'installation native (Safari/iOS notamment).
export default function AppActionsBar({ onShowInstallInstructions }) {
  const { t } = useT();
  // La détection "déjà installé" (display-mode standalone) s'est révélée peu
  // fiable sur certains navigateurs mobiles réels — mieux vaut toujours
  // montrer le bouton (clic sans effet gênant si déjà installé) que risquer
  // de le cacher à tort pour quelqu'un qui en a besoin.
  const { canPromptNative, promptInstall } = useInstallPrompt();
  const [justCopied, setJustCopied] = useState(false);

  const handleInstallClick = async () => {
    if (canPromptNative) {
      await promptInstall();
    } else {
      onShowInstallInstructions();
    }
  };

  const handleShareClick = async () => {
    const shareText = t('auth_share_text');
    if (isMobileDevice() && navigator.share) {
      try {
        await navigator.share({ title: 'Sudoku Art', text: shareText, url: APP_URL });
        return;
      } catch {
        // Partage annulé par l'utilisateur : rien à faire de plus, on ne
        // retombe pas sur le presse-papiers dans ce cas précis.
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText}${APP_URL}`);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible (permission refusée, contexte non
      // sécurisé...) : pas grave, l'utilisateur peut copier l'URL lui-même.
    }
  };

  return (
    <div className="app-actions-bar">
      <button className="app-action-btn" onClick={handleInstallClick}>
        📲 {t('app_install_btn')}
      </button>
      <button className="app-action-btn app-action-btn-secondary" onClick={handleShareClick}>
        {justCopied ? `✅ ${t('app_share_copied')}` : `🔗 ${t('app_share_btn')}`}
      </button>
    </div>
  );
}
