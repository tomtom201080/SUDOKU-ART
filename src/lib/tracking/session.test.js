// src/lib/tracking/session.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateGameSessionId,
  startGameSession,
  updateGameSessionSnapshot,
  getActiveGameSession,
  clearGameSession,
  consumeUnfinishedPreviousSession,
  consumeActiveSessionForAbandon
} from './session';

// Vitest tourne en environnement Node par défaut (pas de jsdom) : on fournit
// un localStorage minimal en mémoire, suffisant pour ces tests.
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
});

describe('generateGameSessionId', () => {
  it('génère un identifiant différent à chaque appel', () => {
    const a = generateGameSessionId();
    const b = generateGameSessionId();
    expect(a).not.toBe(b);
    expect(typeof a).toBe('string');
    expect(a.length).toBeGreaterThan(0);
  });
});

describe('startGameSession / getActiveGameSession', () => {
  it('stocke un instantané récupérable avec les valeurs de départ', () => {
    startGameSession({ sessionId: 's1', difficulty: 'moyen', contentType: 'artwork', puzzleId: 'p1' });
    const snap = getActiveGameSession();
    expect(snap).toMatchObject({
      sessionId: 's1',
      difficulty: 'moyen',
      contentType: 'artwork',
      puzzleId: 'p1',
      elapsedSeconds: 0,
      progressPercent: 0,
      mistakeCount: 0,
      hintCount: 0
    });
  });
});

describe('updateGameSessionSnapshot', () => {
  it('fusionne les nouvelles valeurs sans écraser le reste', () => {
    startGameSession({ sessionId: 's1', difficulty: 'moyen', contentType: 'artwork', puzzleId: 'p1' });
    updateGameSessionSnapshot({ elapsedSeconds: 42, mistakeCount: 2 });
    const snap = getActiveGameSession();
    expect(snap.elapsedSeconds).toBe(42);
    expect(snap.mistakeCount).toBe(2);
    expect(snap.difficulty).toBe('moyen'); // inchangé
  });

  it('ne fait rien si aucune session active', () => {
    updateGameSessionSnapshot({ elapsedSeconds: 42 });
    expect(getActiveGameSession()).toBeNull();
  });
});

describe('clearGameSession', () => {
  it('efface la session seulement si le sessionId correspond', () => {
    startGameSession({ sessionId: 's1', difficulty: 'moyen' });
    clearGameSession('autre-id');
    expect(getActiveGameSession()).not.toBeNull(); // pas effacée : mauvais id

    clearGameSession('s1');
    expect(getActiveGameSession()).toBeNull();
  });
});

describe('consumeUnfinishedPreviousSession', () => {
  it('renvoie et efface un instantané laissé par une session précédente', () => {
    startGameSession({ sessionId: 's1', difficulty: 'enfer' });
    const consumed = consumeUnfinishedPreviousSession();
    expect(consumed.sessionId).toBe('s1');
    expect(getActiveGameSession()).toBeNull();
  });

  it('renvoie null si aucune session laissée', () => {
    expect(consumeUnfinishedPreviousSession()).toBeNull();
  });

  it('ne renvoie jamais deux fois le même abandon (idempotent après un premier appel)', () => {
    startGameSession({ sessionId: 's1', difficulty: 'enfer' });
    const first = consumeUnfinishedPreviousSession();
    const second = consumeUnfinishedPreviousSession();
    expect(first).not.toBeNull();
    expect(second).toBeNull();
  });
});

describe('consumeActiveSessionForAbandon', () => {
  it('renvoie l\'instantané pour le bon sessionId et l\'efface', () => {
    startGameSession({ sessionId: 's1', difficulty: 'complique' });
    updateGameSessionSnapshot({ elapsedSeconds: 10, progressPercent: 25 });
    const snap = consumeActiveSessionForAbandon('s1');
    expect(snap).toMatchObject({ sessionId: 's1', elapsedSeconds: 10, progressPercent: 25 });
    expect(getActiveGameSession()).toBeNull();
  });

  it('renvoie null pour un sessionId qui ne correspond pas (évite un faux abandon)', () => {
    startGameSession({ sessionId: 's1', difficulty: 'complique' });
    const snap = consumeActiveSessionForAbandon('s2');
    expect(snap).toBeNull();
    expect(getActiveGameSession()).not.toBeNull(); // session s1 toujours active
  });

  it('ne compte jamais deux fois le même abandon', () => {
    startGameSession({ sessionId: 's1', difficulty: 'complique' });
    const first = consumeActiveSessionForAbandon('s1');
    const second = consumeActiveSessionForAbandon('s1');
    expect(first).not.toBeNull();
    expect(second).toBeNull();
  });
});
