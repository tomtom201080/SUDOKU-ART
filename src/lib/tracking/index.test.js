// src/lib/tracking/index.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  trackHomeViewed,
  trackGameSelected,
  trackGameStarted,
  trackFirstMove,
  trackGameProgress,
  trackMistakeMade,
  trackHintUsed,
  trackGameCompleted,
  trackRevealViewed,
  trackShareClicked,
  trackShareCompleted,
  trackNewGameClicked,
  trackFeedbackOpened,
  trackFeedbackSubmitted,
  trackGameError,
  normalizeErrorCode,
  firstComponentFromStack
} from './index';

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
  vi.stubGlobal('window', {
    dispatchEvent: () => {},
    addEventListener: () => {},
    removeEventListener: () => {}
  });
});

// Sans VITE_GA_MEASUREMENT_ID / VITE_CLARITY_PROJECT_ID ni consentement
// accordé (l'état par défaut de ce projet de test), et en environnement de
// développement sans VITE_ANALYTICS_FORCE_LOCAL : aucune de ces fonctions ne
// doit lever d'erreur, quel que soit l'ordre ou la fréquence des appels.
describe('trackXxx — ne plante jamais, même sans identifiants ni consentement', () => {
  it('home / sélection / démarrage', () => {
    expect(() => trackHomeViewed({ language: 'fr', deviceType: 'mobile', referrerType: 'direct' })).not.toThrow();
    expect(() => trackGameSelected({ difficulty: 'moyen', contentType: 'artwork', puzzleId: null, language: 'fr' })).not.toThrow();
    expect(() => trackGameStarted({ difficulty: 'moyen', contentType: 'artwork', puzzleId: 'p1', language: 'fr', isCustomGame: false })).not.toThrow();
  });

  it('déroulé de partie', () => {
    expect(() => trackFirstMove({ difficulty: 'moyen', elapsedSeconds: 3, inputMethod: 'number_pad' })).not.toThrow();
    expect(() => trackGameProgress({ progressPercent: 25, elapsedSeconds: 30, difficulty: 'moyen', mistakeCount: 0, hintCount: 0, puzzleId: 'p1', contentType: 'artwork' })).not.toThrow();
    expect(() => trackMistakeMade({ mistakeNumber: 1, elapsedSeconds: 10, difficulty: 'moyen', progressPercent: 10 })).not.toThrow();
    expect(() => trackHintUsed({ hintNumber: 1, elapsedSeconds: 20, difficulty: 'moyen', progressPercent: 15 })).not.toThrow();
  });

  it('fin de partie et révélation', () => {
    expect(() => trackGameCompleted({
      completionTimeSeconds: 120, difficulty: 'moyen', mistakeCount: 1, hintCount: 0,
      puzzleId: 'p1', contentType: 'artwork', language: 'fr', wasResumed: false, imageFullyRevealed: true
    })).not.toThrow();
    expect(() => trackRevealViewed({ contentType: 'artwork', puzzleId: 'p1', difficulty: 'moyen', completionTimeSeconds: 120 })).not.toThrow();
  });

  it('partage, nouvelle partie, feedback', () => {
    expect(() => trackShareClicked({ shareMethod: 'native_share', difficulty: 'moyen', contentType: 'artwork', puzzleId: 'p1', completionTimeSeconds: 120 })).not.toThrow();
    expect(() => trackShareCompleted({ shareMethod: 'native_share', puzzleId: 'p1' })).not.toThrow();
    expect(() => trackNewGameClicked({ previousProgressPercent: 40, previousCompleted: false, previousDifficulty: 'moyen' })).not.toThrow();
    expect(() => trackFeedbackOpened({ feedbackContext: 'menu', progressPercent: null, difficulty: null })).not.toThrow();
    expect(() => trackFeedbackSubmitted({ feedbackType: 'bug', feedbackContext: 'menu', progressPercent: null, difficulty: null })).not.toThrow();
  });

  it('erreurs applicatives', () => {
    expect(() => trackGameError({
      errorType: 'js_error', errorLocation: 'window', errorCode: 'type_error', fatal: false, gameInProgress: true, progressPercent: 50
    })).not.toThrow();
  });

  it('contenu personnel : content_type = personal_image n\'empêche jamais l\'envoi (puzzle_id est simplement omis)', () => {
    expect(() => trackGameStarted({ difficulty: 'moyen', contentType: 'personal_image', puzzleId: 'ne-devrait-jamais-sortir', language: 'fr', isCustomGame: true })).not.toThrow();
  });
});

describe('normalizeErrorCode', () => {
  it('dérive un code stable à partir du nom de l\'erreur, jamais du message', () => {
    expect(normalizeErrorCode(new TypeError('contient un secret ou une URL sensible'))).toBe('typeerror');
    expect(normalizeErrorCode(new RangeError('x'))).toBe('rangeerror');
  });

  it('renvoie "unknown" pour une valeur non-Error', () => {
    expect(normalizeErrorCode(null)).toBe('unknown');
    expect(normalizeErrorCode(undefined)).toBe('unknown');
  });
});

describe('firstComponentFromStack', () => {
  it('isole le premier nom de composant d\'une trace React', () => {
    const stack = '\n    in WinModal (created by App)\n    in App';
    expect(firstComponentFromStack(stack)).toBe('WinModal');
  });

  it('renvoie "unknown" sans trace', () => {
    expect(firstComponentFromStack(null)).toBe('unknown');
    expect(firstComponentFromStack('')).toBe('unknown');
  });
});
