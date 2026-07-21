// src/lib/consent.js
// Consentement catégorisé (RGPD-friendly) : trois catégories indépendantes.
// "necessary" n'est jamais désactivable (session de jeu, choix de langue) et
// n'est pas stockée : elle n'a pas besoin d'un consentement explicite.
// "measurement" gouverne GA4 + Microsoft Clarity.
// "advertising" gouverne AdSense (remplace l'ancienne clé binaire de
// src/lib/adConsent.js, qui redirige maintenant vers ce module).
const CONSENT_KEY = 'sudoku-art:consent';

const DEFAULT_CONSENT = {
  measurement: null, // null = pas encore décidé, true = accepté, false = refusé
  advertising: null
};

function readStoredConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Reprend l'ancien choix ads-only (sudoku-devoile:adConsent) s'il existe et
// qu'aucun choix catégorisé n'a encore été fait, pour ne pas re-solliciter
// un utilisateur qui avait déjà répondu au bandeau précédent.
function readLegacyAdConsent() {
  try {
    const legacy = localStorage.getItem('sudoku-devoile:adConsent');
    if (legacy === 'accepted') return true;
    if (legacy === 'rejected') return false;
    return null;
  } catch {
    return null;
  }
}

export function getConsent() {
  const stored = readStoredConsent();
  if (stored) {
    return { necessary: true, measurement: stored.measurement ?? null, advertising: stored.advertising ?? null };
  }
  const legacyAdvertising = readLegacyAdConsent();
  return { necessary: true, measurement: null, advertising: legacyAdvertising };
}

// value: { measurement?: boolean, advertising?: boolean }
export function setConsent(value) {
  const current = getConsent();
  const next = {
    measurement: value.measurement ?? current.measurement,
    advertising: value.advertising ?? current.advertising
  };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
  } catch {
    // stockage indisponible : le choix ne persistera pas, tant pis
  }
  window.dispatchEvent(new CustomEvent('consentchange', { detail: getConsent() }));
}

export function hasDecided() {
  const c = getConsent();
  return c.measurement !== null && c.advertising !== null;
}

export function onConsentChange(callback) {
  const handler = (e) => callback(e.detail);
  window.addEventListener('consentchange', handler);
  return () => window.removeEventListener('consentchange', handler);
}
