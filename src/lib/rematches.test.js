// src/lib/rematches.test.js
// Couvre la règle "dernière tentative écrase" ajoutée à submitGroupResult
// pour les participants connectés (expéditeur qui rejoue son propre lien,
// ou ami invité) — sans elle, chaque nouvelle tentative dupliquait une ligne
// dans rematch_results au lieu de remplacer la précédente.
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./supabaseClient', () => ({ supabase: { from: vi.fn() } }));

import { supabase } from './supabaseClient';
import { submitGroupResult } from './rematches';

function chainable(finalResult) {
  const obj = {};
  const self = () => obj;
  obj.select = vi.fn(self);
  obj.eq = vi.fn(self);
  obj.is = vi.fn(self);
  obj.update = vi.fn(self);
  obj.insert = vi.fn(self);
  obj.maybeSingle = vi.fn(() => Promise.resolve(finalResult));
  obj.then = (resolve, reject) => Promise.resolve(finalResult).then(resolve, reject);
  return obj;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('submitGroupResult', () => {
  it("insère une nouvelle ligne pour un participant connecté qui joue pour la première fois", async () => {
    const lookup = chainable({ data: null, error: null });
    const insert = chainable({ error: null });
    supabase.from.mockReturnValueOnce(lookup).mockReturnValueOnce(insert);

    await submitGroupResult('rematch-1', { errors: 0, seconds: 42, hints: 0, userId: 'user-1', playerName: 'Moi' });

    expect(lookup.eq).toHaveBeenCalledWith('rematch_id', 'rematch-1');
    expect(lookup.eq).toHaveBeenCalledWith('player_user_id', 'user-1');
    expect(insert.insert).toHaveBeenCalledWith(expect.objectContaining({
      rematch_id: 'rematch-1', player_user_id: 'user-1', player_name: 'Moi', errors: 0, seconds: 42, hints: 0
    }));
  });

  it("remplace la ligne existante (dernière tentative écrase) quand ce participant a déjà joué ce défi", async () => {
    const lookup = chainable({ data: { id: 'existing-row' }, error: null });
    const update = chainable({ error: null });
    supabase.from.mockReturnValueOnce(lookup).mockReturnValueOnce(update);

    await submitGroupResult('rematch-1', { errors: 2, seconds: 10, hints: 1, userId: 'user-1', playerName: 'Moi' });

    expect(update.update).toHaveBeenCalledWith({ player_name: 'Moi', errors: 2, seconds: 10, hints: 1 });
    expect(update.eq).toHaveBeenCalledWith('id', 'existing-row');
    expect(update.insert).not.toHaveBeenCalled();
  });

  it("insère toujours une nouvelle ligne pour un candidat libre non connecté, sans recherche préalable", async () => {
    const insert = chainable({ error: null });
    supabase.from.mockReturnValueOnce(insert);

    await submitGroupResult('rematch-1', { errors: 0, seconds: 30, hints: 0, userId: null, playerName: 'Alice' });

    expect(supabase.from).toHaveBeenCalledTimes(1);
    expect(insert.insert).toHaveBeenCalledWith(expect.objectContaining({
      rematch_id: 'rematch-1', player_user_id: null, player_name: 'Alice'
    }));
  });
});
