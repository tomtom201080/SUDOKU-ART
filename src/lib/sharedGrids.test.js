// @vitest-environment jsdom
// src/lib/sharedGrids.test.js
// Couvre le câblage client du QR de partage : la RPC create_shared_grid est
// bien appelée avec le jeton d'appareil et les champs attendus (p_* en
// snake_case, comme la RPC Postgres les attend), et le parsing de /g/<id>
// ne confond pas un chemin de grille avec une autre route de l'appli.
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./supabaseClient', () => ({ supabase: { rpc: vi.fn(), from: vi.fn() } }));
vi.mock('./deviceToken', () => ({ getOrCreateDeviceToken: () => 'device-token-123' }));

import { supabase } from './supabaseClient';
import {
  createSharedGrid, fetchSharedGrid, incrementScan,
  buildSharedGridLink, readSharedGridIdFromPath, clearSharedGridFromPath
} from './sharedGrids';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createSharedGrid', () => {
  it('appelle la RPC avec les champs attendus et le jeton d\'appareil', async () => {
    supabase.rpc.mockResolvedValue({ data: { id: 'abc12345' }, error: null });

    const result = await createSharedGrid({
      type: 'initial',
      puzzle: [[0]], solution: [[1]], userGrid: [[0]], notesGrid: [],
      difficulty: 'moyen', paintingId: 'la-joconde'
    });

    expect(supabase.rpc).toHaveBeenCalledWith('create_shared_grid', {
      p_type: 'initial',
      p_puzzle: [[0]],
      p_solution: [[1]],
      p_user_grid: [[0]],
      p_notes_grid: [],
      p_difficulty: 'moyen',
      p_painting_id: 'la-joconde',
      p_photo_path: null,
      p_device_token: 'device-token-123',
      p_media_id: null
    });
    expect(result).toEqual({ id: 'abc12345' });
  });

  it('propage une erreur RPC (ex. limite anti-abus atteinte)', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: new Error('rate limit exceeded') });
    await expect(createSharedGrid({
      type: 'snapshot', puzzle: [], solution: [], userGrid: [], notesGrid: [], difficulty: 'facile'
    })).rejects.toThrow('rate limit exceeded');
  });
});

describe('fetchSharedGrid', () => {
  it('lit la ligne par id', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { id: 'abc12345' }, error: null });
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    supabase.from.mockReturnValue({ select });

    const result = await fetchSharedGrid('abc12345');
    expect(supabase.from).toHaveBeenCalledWith('shared_grids');
    expect(eq).toHaveBeenCalledWith('id', 'abc12345');
    expect(result).toEqual({ id: 'abc12345' });
  });
});

describe('incrementScan', () => {
  it("appelle la RPC sans attendre (fire-and-forget)", () => {
    supabase.rpc.mockResolvedValue({ data: null, error: null });
    incrementScan('abc12345');
    expect(supabase.rpc).toHaveBeenCalledWith('increment_shared_grid_scan', { p_id: 'abc12345' });
  });
});

describe('buildSharedGridLink / readSharedGridIdFromPath', () => {
  it('construit un lien /g/<id> à partir de l\'origine courante', () => {
    const link = buildSharedGridLink('abc12345');
    expect(link).toBe(`${window.location.origin}/g/abc12345`);
  });

  it('lit un id valide depuis le chemin', () => {
    window.history.replaceState({}, '', '/g/abc12345');
    expect(readSharedGridIdFromPath()).toBe('abc12345');
  });

  it('ne confond pas une autre route avec une grille partagée', () => {
    window.history.replaceState({}, '', '/sudoku-facile');
    expect(readSharedGridIdFromPath()).toBeNull();
  });

  it('revient à "/" après lecture', () => {
    window.history.replaceState({}, '', '/g/abc12345');
    clearSharedGridFromPath();
    expect(window.location.pathname).toBe('/');
  });
});
