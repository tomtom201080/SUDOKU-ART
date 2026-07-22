// src/lib/tracking/ga4.js
// Chargement et envoi d'événements Google Analytics 4. Ne jamais importer
// ce fichier directement depuis un composant : passe par
// src/lib/tracking/index.js (trackXxx()).
let loaded = false;
let initialized = false;

export function getMeasurementId() {
  return import.meta.env.VITE_GA_MEASUREMENT_ID || null;
}

function loadScript(measurementId) {
  if (loaded) return;
  loaded = true;

  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line no-inner-declarations
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  const script = document.createElement('script');
  script.async = true;
  // Sans crossorigin, une erreur interne à ce script tiers remonte à
  // window.onerror sous la forme générique "Script error." (aucun message,
  // aucune pile) — ce qui la rend indiscernable d'un vrai bug de l'app dans
  // le suivi d'erreurs (trackGameError) comme pour l'utilisateur.
  script.crossOrigin = 'anonymous';
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

// Initialise GA4 : chargement du script (une seule fois), configuration
// sans page_view automatique (on envoie nous-mêmes exactement un
// page_view virtuel via trackHomeViewed, pour éviter les doublons dans
// cette SPA sans routeur).
export function initGA4() {
  const measurementId = getMeasurementId();
  if (!measurementId || initialized) return;
  initialized = true;

  loadScript(measurementId);
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false,
    anonymize_ip: true
  });
}

export function isGA4Ready() {
  return initialized && typeof window.gtag === 'function';
}

export function sendGA4Event(eventName, params) {
  if (!isGA4Ready()) return;
  window.gtag('event', eventName, params ?? {});
}
