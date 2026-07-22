// src/lib/tracking/clarity.js
// Chargement et tags Microsoft Clarity. Ne jamais importer ce fichier
// directement depuis un composant : passe par src/lib/tracking/index.js.
let loaded = false;
let initialized = false;

export function getClarityProjectId() {
  return import.meta.env.VITE_CLARITY_PROJECT_ID || null;
}

function loadScript(projectId) {
  if (loaded) return;
  loaded = true;

  (function (c, l, a, r, i) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    const t = l.createElement(r);
    t.async = 1;
    // Sans crossorigin, une erreur interne à ce script tiers remonte à
    // window.onerror sous la forme générique "Script error." (aucun
    // message, aucune pile) — voir le même correctif dans ga4.js.
    t.crossOrigin = 'anonymous';
    t.src = `https://www.clarity.ms/tag/${i}`;
    const y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', projectId);
}

// Initialise Clarity une seule fois, seulement si un identifiant projet est
// configuré. Appeler uniquement après consentement "mesure d'audience".
export function initClarity() {
  const projectId = getClarityProjectId();
  if (!projectId || initialized) return;
  initialized = true;
  loadScript(projectId);
}

export function isClarityReady() {
  return initialized && typeof window.clarity === 'function';
}

// Tag de filtrage (ex: clarityTag('language', 'fr')) — jamais de donnée
// personnelle : uniquement des valeurs techniques prédéfinies (langue,
// difficulté, type de contenu, appareil, statut de partie...).
export function clarityTag(key, value) {
  if (!isClarityReady()) return;
  window.clarity('set', key, String(value));
}

export function clarityEvent(eventName) {
  if (!isClarityReady()) return;
  window.clarity('event', eventName);
}

// Masque un élément du DOM dans les enregistrements de session (utile pour
// les zones affichant une photo personnelle). Voir CSS class "clarity-mask"
// appliquée directement dans les composants concernés — Clarity détecte
// aussi automatiquement les champs de formulaire sensibles par défaut.
export const CLARITY_MASK_CLASS = 'clarity-mask';
