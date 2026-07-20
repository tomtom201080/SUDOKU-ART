// src/lib/adConsent.js
const CONSENT_KEY = 'sudoku-devoile:adConsent'; // 'accepted' | 'rejected'

export function getAdConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

export function setAdConsent(value) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // stockage indisponible : le bandeau réapparaîtra, tant pis
  }
}
