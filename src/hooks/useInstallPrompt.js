// src/hooks/useInstallPrompt.js
// Capture l'événement natif beforeinstallprompt (Chrome/Edge/Android) pour
// pouvoir déclencher l'invite d'installation PWA directement au clic, sans
// passer par les instructions manuelles (InstallAppModal) quand ce n'est
// pas nécessaire. Détecte aussi si l'app tourne déjà en mode standalone
// (déjà installée), pour masquer le bouton dans ce cas.
import { useEffect, useState } from 'react';

function isStandalone() {
  if (typeof window === 'undefined') return false;
  const viaMediaQuery = window.matchMedia?.('(display-mode: standalone)').matches;
  // navigator.standalone : propriété non standard, spécifique à iOS Safari.
  const viaIosSafari = window.navigator?.standalone === true;
  return !!(viaMediaQuery || viaIosSafari);
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      // Empêche la mini-infobar automatique du navigateur : on déclenche
      // nous-mêmes l'invite, au clic sur notre propre bouton.
      event.preventDefault();
      setDeferredPrompt(event);
    }
    function handleAppInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // true si l'invite native du navigateur peut être déclenchée directement
  // (Chrome/Edge/Android notamment) — false sur Safari/iOS, qui ne l'envoie
  // jamais : dans ce cas l'appelant doit retomber sur des instructions.
  const canPromptNative = !!deferredPrompt;

  const promptInstall = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice.catch(() => null);
    setDeferredPrompt(null);
    return choice?.outcome === 'accepted';
  };

  return { installed, canPromptNative, promptInstall };
}
