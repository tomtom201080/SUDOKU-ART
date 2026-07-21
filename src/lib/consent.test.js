// src/lib/consent.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getConsent, setConsent, hasDecided } from './consent';

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k)
  };
}

beforeEach(() => {
  vi.stubGlobal('localStorage', createMemoryStorage());
  vi.stubGlobal('window', { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} });
  vi.stubGlobal('CustomEvent', class CustomEvent {
    constructor(type, opts) { this.type = type; this.detail = opts?.detail; }
  });
});

describe('getConsent (état initial)', () => {
  it('ne considère rien comme décidé par défaut', () => {
    const consent = getConsent();
    expect(consent.necessary).toBe(true);
    expect(consent.measurement).toBeNull();
    expect(consent.advertising).toBeNull();
    expect(hasDecided()).toBe(false);
  });

  it('reprend l\'ancien choix ads-only (sudoku-devoile:adConsent) si présent', () => {
    localStorage.setItem('sudoku-devoile:adConsent', 'accepted');
    const consent = getConsent();
    expect(consent.advertising).toBe(true);
    expect(consent.measurement).toBeNull(); // la mesure reste à décider
  });
});

describe('setConsent', () => {
  it('persiste chaque catégorie indépendamment', () => {
    setConsent({ measurement: true });
    expect(getConsent().measurement).toBe(true);
    expect(getConsent().advertising).toBeNull();

    setConsent({ advertising: false });
    expect(getConsent().measurement).toBe(true); // pas écrasé
    expect(getConsent().advertising).toBe(false);
  });

  it('marque hasDecided() true une fois les deux catégories choisies', () => {
    setConsent({ measurement: false, advertising: false });
    expect(hasDecided()).toBe(true);
  });

  it('le refus des deux catégories ne lève aucune erreur', () => {
    expect(() => setConsent({ measurement: false, advertising: false })).not.toThrow();
  });
});
