// src/lib/adConsent.js
// Compatibilité : ce module gouvernait seul le consentement pub avant
// l'introduction du consentement catégorisé (src/lib/consent.js). Il ne
// stocke plus rien lui-même — il relaie la catégorie "advertising", pour
// que tous les appelants existants (App.jsx, AdSlot, LegalModal) continuent
// de fonctionner sans modification.
import { getConsent, setConsent } from './consent';

export function getAdConsent() {
  const { advertising } = getConsent();
  if (advertising === true) return 'accepted';
  if (advertising === false) return 'rejected';
  return null;
}

export function setAdConsent(value) {
  setConsent({ advertising: value === 'accepted' });
}
