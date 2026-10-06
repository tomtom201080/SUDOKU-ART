// @vitest-environment jsdom
// src/lib/pendingWrites.test.js
// Couvre le bug corrigé : le résultat d'un défi/rematch terminé hors ligne
// disparaissait purement et simplement (écriture fire-and-forget jamais
// retentée) — l'expéditeur ne le voyait jamais. writeOrQueue()/
// flushPendingWrites() doivent mémoriser puis retenter ces écritures.
// Couvre aussi le cas 'shared_grid_create' (QR "Appel à un ami") : il doit
// diffuser un évènement 'sharedgridresolved' quand la création en attente
// réussit enfin, pour que ShareGridPanel.jsx puisse rafraîchir son QR.
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./challenges', () => ({ markChallengeCompleted: vi.fn() }));
vi.mock('./rematches', () => ({
  submitRematchResult: vi.fn(),
  submitGroupResult: vi.fn(),
  updateChallengerBaseline: vi.fn()
}));
vi.mock('./sharedGrids', () => ({ createSharedGrid: vi.fn() }));

import { markChallengeCompleted } from './challenges';
import { submitGroupResult } from './rematches';
import { createSharedGrid } from './sharedGrids';
import { writeOrQueue, flushPendingWrites, getPendingWritesCount, enqueuePendingWrite } from './pendingWrites';

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k)
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('localStorage', createMemoryStorage());
});

describe('writeOrQueue', () => {
  it("n'ajoute rien à la file quand l'écriture réussit tout de suite", async () => {
    markChallengeCompleted.mockResolvedValue(undefined);
    const ok = await writeOrQueue('challenge_completed', { challengeId: 'c1', result: 'won' });
    expect(ok).toBe(true);
    expect(getPendingWritesCount()).toBe(0);
  });

  it("met en file quand l'écriture échoue (ex. hors ligne)", async () => {
    markChallengeCompleted.mockRejectedValue(new Error('network error'));
    const ok = await writeOrQueue('challenge_completed', { challengeId: 'c1', result: 'won' });
    expect(ok).toBe(false);
    expect(getPendingWritesCount()).toBe(1);
  });
});

describe('flushPendingWrites', () => {
  it('retire de la file une écriture qui réussit au nouvel essai', async () => {
    markChallengeCompleted.mockRejectedValueOnce(new Error('offline'));
    await writeOrQueue('challenge_completed', { challengeId: 'c1', result: 'won' });
    expect(getPendingWritesCount()).toBe(1);

    markChallengeCompleted.mockResolvedValue(undefined);
    await flushPendingWrites();

    expect(getPendingWritesCount()).toBe(0);
    expect(markChallengeCompleted).toHaveBeenCalledWith('c1', 'won');
  });

  it('garde en file (avec un essai de plus) une écriture qui échoue encore', async () => {
    submitGroupResult.mockRejectedValue(new Error('still offline'));
    await writeOrQueue('group_result', { rematchId: 'r1', data: { errors: 0, seconds: 42 } });
    expect(getPendingWritesCount()).toBe(1);

    await flushPendingWrites();
    await flushPendingWrites();

    expect(getPendingWritesCount()).toBe(1); // toujours en attente
    expect(submitGroupResult).toHaveBeenCalledTimes(3); // 1 (writeOrQueue) + 2 (flush)
  });

  it('abandonne une écriture après trop de tentatives infructueuses', async () => {
    submitGroupResult.mockRejectedValue(new Error('permanently offline'));
    await writeOrQueue('group_result', { rematchId: 'r1', data: {} });

    for (let i = 0; i < 25; i++) {
      await flushPendingWrites();
    }

    expect(getPendingWritesCount()).toBe(0);
  });

  it("ne fait rien quand la file est vide", async () => {
    await flushPendingWrites();
    expect(markChallengeCompleted).not.toHaveBeenCalled();
  });

  it("diffuse 'sharedgridresolved' quand une création de grille partagée en attente réussit", async () => {
    enqueuePendingWrite('shared_grid_create', { clientRequestId: 'local-1', type: 'snapshot', puzzle: [] });
    expect(getPendingWritesCount()).toBe(1);

    const createdRow = { id: 'abc12345', type: 'snapshot' };
    createSharedGrid.mockResolvedValue(createdRow);

    const handler = vi.fn();
    window.addEventListener('sharedgridresolved', handler);
    await flushPendingWrites();
    window.removeEventListener('sharedgridresolved', handler);

    expect(getPendingWritesCount()).toBe(0);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({ clientRequestId: 'local-1', grid: createdRow });
  });
});

describe('enqueuePendingWrite', () => {
  it("met en file sans tenter l'écriture", () => {
    enqueuePendingWrite('shared_grid_create', { clientRequestId: 'local-2' });
    expect(createSharedGrid).not.toHaveBeenCalled();
    expect(getPendingWritesCount()).toBe(1);
  });
});
