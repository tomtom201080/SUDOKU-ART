// @vitest-environment jsdom
// src/hooks/useGameAnalytics.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGameAnalytics } from './useGameAnalytics';
import * as tracking from '../lib/tracking';

vi.mock('../lib/tracking', () => ({
  generateGameSessionId: vi.fn(() => `id-${Math.random().toString(36).slice(2)}`),
  startGameSession: vi.fn(),
  updateGameSessionSnapshot: vi.fn(),
  clearGameSession: vi.fn(),
  trackGameStarted: vi.fn(),
  trackFirstMove: vi.fn(),
  trackGameProgress: vi.fn(),
  trackMistakeMade: vi.fn(),
  trackGameCompleted: vi.fn(),
  trackRevealViewed: vi.fn(),
  trackGameAbandoned: vi.fn()
}));

function makeGame(overrides = {}) {
  return {
    puzzleData: null,
    difficulty: null,
    moveCount: 0,
    errorCount: 0,
    revealProgress: 0,
    hintsUsed: 0,
    elapsedSeconds: 0,
    isComplete: false,
    ...overrides
  };
}

const ctx = { language: 'fr', contentType: 'artwork', puzzleId: 'p1', isCustomGame: false };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useGameAnalytics — game_started', () => {
  it('ne part pas tant qu\'aucune partie n\'a démarré (puzzleData null)', () => {
    renderHook(({ game }) => useGameAnalytics(game, ctx), { initialProps: { game: makeGame() } });
    expect(tracking.trackGameStarted).not.toHaveBeenCalled();
  });

  it('part exactement une fois au démarrage, jamais aux re-rendus suivants', () => {
    const puzzleA = { id: 'a' };
    const { rerender } = renderHook(({ game }) => useGameAnalytics(game, ctx), {
      initialProps: { game: makeGame() }
    });
    rerender({ game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen' }) });
    expect(tracking.trackGameStarted).toHaveBeenCalledTimes(1);

    // Re-rendu avec la même grille (même référence) : aucun nouvel envoi.
    rerender({ game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen', moveCount: 1 }) });
    rerender({ game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen', moveCount: 2 }) });
    expect(tracking.trackGameStarted).toHaveBeenCalledTimes(1);
  });

  it('une nouvelle partie (grille différente) redéclenche game_started', () => {
    const puzzleA = { id: 'a' };
    const puzzleB = { id: 'b' };
    const { rerender } = renderHook(({ game }) => useGameAnalytics(game, ctx), {
      initialProps: { game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen' }) }
    });
    expect(tracking.trackGameStarted).toHaveBeenCalledTimes(1);
    rerender({ game: makeGame({ puzzleData: puzzleB, difficulty: 'enfer' }) });
    expect(tracking.trackGameStarted).toHaveBeenCalledTimes(2);
  });
});

describe('useGameAnalytics — first_move', () => {
  it('part exactement une fois, au premier coup joué', () => {
    const puzzleA = { id: 'a' };
    const { rerender } = renderHook(({ game }) => useGameAnalytics(game, ctx), {
      initialProps: { game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen' }) }
    });
    expect(tracking.trackFirstMove).not.toHaveBeenCalled();

    rerender({ game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen', moveCount: 1 }) });
    expect(tracking.trackFirstMove).toHaveBeenCalledTimes(1);

    rerender({ game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen', moveCount: 2 }) });
    rerender({ game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen', moveCount: 3 }) });
    expect(tracking.trackFirstMove).toHaveBeenCalledTimes(1);
  });

  it('une nouvelle partie réinitialise le suivi (first_move repart à zéro)', () => {
    const puzzleA = { id: 'a' };
    const puzzleB = { id: 'b' };
    const { rerender } = renderHook(({ game }) => useGameAnalytics(game, ctx), {
      initialProps: { game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen' }) }
    });
    rerender({ game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen', moveCount: 1 }) });
    expect(tracking.trackFirstMove).toHaveBeenCalledTimes(1);

    rerender({ game: makeGame({ puzzleData: puzzleB, difficulty: 'moyen' }) }); // nouvelle partie, moveCount repart à 0
    rerender({ game: makeGame({ puzzleData: puzzleB, difficulty: 'moyen', moveCount: 1 }) });
    expect(tracking.trackFirstMove).toHaveBeenCalledTimes(2);
  });
});

describe('useGameAnalytics — game_progress (seuils)', () => {
  it('chaque seuil franchi part une seule fois, jamais deux fois', () => {
    const puzzleA = { id: 'a' };
    const { rerender } = renderHook(({ game }) => useGameAnalytics(game, ctx), {
      initialProps: { game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen', revealProgress: 0 }) }
    });

    rerender({ game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen', revealProgress: 0.12 }) }); // 10%
    rerender({ game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen', revealProgress: 0.30 }) }); // 10%, 25%
    rerender({ game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen', revealProgress: 0.30 }) }); // pas de nouveau seuil
    rerender({ game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen', revealProgress: 0.95 }) }); // 50%, 75%, 90%

    // 5 seuils (10/25/50/75/90), un seul envoi chacun.
    expect(tracking.trackGameProgress).toHaveBeenCalledTimes(5);
    const percents = tracking.trackGameProgress.mock.calls.map(c => c[0].progressPercent).sort((a, b) => a - b);
    expect(percents).toEqual([10, 25, 50, 75, 90]);
  });
});

describe('useGameAnalytics — game_completed / reveal_viewed', () => {
  it('partent chacun exactement une fois quand isComplete passe à true', () => {
    const puzzleA = { id: 'a' };
    const { rerender } = renderHook(({ game }) => useGameAnalytics(game, ctx), {
      initialProps: { game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen' }) }
    });

    rerender({ game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen', isComplete: true, revealProgress: 1 }) });
    expect(tracking.trackGameCompleted).toHaveBeenCalledTimes(1);
    expect(tracking.trackRevealViewed).toHaveBeenCalledTimes(1);

    // Re-rendus supplémentaires pendant que isComplete reste true (ex: la
    // popup de victoire s'ouvre 3s après) : aucun nouvel envoi.
    rerender({ game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen', isComplete: true, revealProgress: 1 }) });
    expect(tracking.trackGameCompleted).toHaveBeenCalledTimes(1);
    expect(tracking.trackRevealViewed).toHaveBeenCalledTimes(1);
  });

  it('une partie terminée n\'est jamais ensuite comptée comme abandonnée', () => {
    const puzzleA = { id: 'a' };
    const puzzleB = { id: 'b' };
    const { rerender } = renderHook(({ game }) => useGameAnalytics(game, ctx), {
      initialProps: { game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen' }) }
    });
    rerender({ game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen', isComplete: true, revealProgress: 1 }) });
    expect(tracking.trackGameCompleted).toHaveBeenCalledTimes(1);

    // Nouvelle partie enchaînée après la victoire : ce n'est pas un abandon.
    rerender({ game: makeGame({ puzzleData: puzzleB, difficulty: 'moyen' }) });
    expect(tracking.trackGameAbandoned).not.toHaveBeenCalled();
  });

  it('une partie non terminée qui enchaîne sur une nouvelle grille est comptée comme abandon', () => {
    const puzzleA = { id: 'a' };
    const puzzleB = { id: 'b' };
    const { rerender } = renderHook(({ game }) => useGameAnalytics(game, ctx), {
      initialProps: { game: makeGame({ puzzleData: puzzleA, difficulty: 'moyen' }) }
    });
    rerender({ game: makeGame({ puzzleData: puzzleB, difficulty: 'moyen' }) }); // pas de isComplete avant de changer
    expect(tracking.trackGameAbandoned).toHaveBeenCalledTimes(1);
  });
});
