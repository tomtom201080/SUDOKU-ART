// src/lib/tracking/debug.js
// Mode debug console, actif par défaut en développement (désactivable via
// VITE_ANALYTICS_DEBUG=false), inactif par défaut en production. N'affecte
// jamais l'envoi réel des événements : c'est un log en plus, jamais une
// condition d'envoi.
function readFlag(value, fallback) {
  if (value === undefined) return fallback;
  return value === 'true' || value === true;
}

export function isDebugEnabled() {
  return readFlag(import.meta.env.VITE_ANALYTICS_DEBUG, import.meta.env.DEV === true);
}

export function debugLog(eventName, params) {
  if (!isDebugEnabled()) return;
  // eslint-disable-next-line no-console
  console.log(`[Analytics Debug] ${eventName}`, params ?? {});
}
