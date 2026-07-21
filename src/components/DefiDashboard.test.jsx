// @vitest-environment jsdom
// src/components/DefiDashboard.test.jsx
// Couvre la régression corrigée ici : une ligne de défi de groupe créée
// sans score initial (challenger_result_seconds = 0, jamais "completed")
// doit rester cliquable et afficher le classement réel — plutôt que de
// rester bloquée sur "Pas encore joué" quel que soit qui a effectivement
// joué (l'expéditeur via son propre lien, ou n'importe quel participant).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { LangProvider } from '../i18n/index.jsx';
import DefiDashboard from './DefiDashboard';

vi.mock('../lib/rematches', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchSentRematches: vi.fn(),
    fetchReceivedRematches: vi.fn(async () => []),
    fetchGroupResults: vi.fn(),
    hideRematch: vi.fn(),
    getHiddenRematchIds: vi.fn(() => [])
  };
});

import { fetchSentRematches, fetchGroupResults } from '../lib/rematches';

function groupRematch(overrides = {}) {
  return {
    id: 'r1',
    group_mode: true,
    completed: false,
    challenger_result_seconds: 0,
    challenger_result_errors: 0,
    challenger_result_hints: 0,
    challenger_name: 'Moi',
    challenger_user_id: 'user-1',
    difficulty: 'facile',
    hints_limit: null,
    created_at: '2026-01-01T10:00:00.000Z',
    ...overrides
  };
}

async function renderDashboardAndOpenRow() {
  const { container } = render(
    <LangProvider>
      <DefiDashboard userId="user-1" onClose={() => {}} onCreateDefi={() => {}} onRegenerateDefi={() => {}} />
    </LangProvider>
  );
  const row = await waitFor(() => {
    const el = container.querySelector('.defi-row');
    if (!el) throw new Error('row not rendered yet');
    return el;
  });
  fireEvent.click(row);
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem('sudoku-devoile:lang', 'fr');
});

afterEach(cleanup);

describe('DefiDashboard — défi de groupe sans score initial du challenger', () => {
  it('reste cliquable et affiche "personne n\'a encore joué" quand rematch_results est vide', async () => {
    fetchSentRematches.mockResolvedValue([groupRematch()]);
    fetchGroupResults.mockResolvedValue([]);

    await renderDashboardAndOpenRow();

    await waitFor(() => {
      expect(screen.getByText('Personne n\'a encore joué.')).toBeTruthy();
    });
  });

  it("affiche le résultat de l'expéditeur quand il a joué via son propre lien (rematch_results contient sa ligne)", async () => {
    fetchSentRematches.mockResolvedValue([groupRematch()]);
    fetchGroupResults.mockResolvedValue([
      { id: 'res1', rematch_id: 'r1', player_name: 'Moi', player_user_id: 'user-1', errors: 1, seconds: 42, hints: 0 }
    ]);

    await renderDashboardAndOpenRow();

    await waitFor(() => {
      expect(screen.getAllByText('Moi').length).toBeGreaterThan(0);
    });
    expect(screen.queryByText('Personne n\'a encore joué.')).toBeNull();
  });

  it('affiche aussi un participant tiers (ami ou candidat libre) aux côtés du résultat de l\'expéditeur', async () => {
    fetchSentRematches.mockResolvedValue([groupRematch()]);
    fetchGroupResults.mockResolvedValue([
      { id: 'res1', rematch_id: 'r1', player_name: 'Moi', player_user_id: 'user-1', errors: 1, seconds: 42, hints: 0 },
      { id: 'res2', rematch_id: 'r1', player_name: 'Alice', player_user_id: null, errors: 0, seconds: 30, hints: 1 }
    ]);

    await renderDashboardAndOpenRow();

    await waitFor(() => {
      expect(screen.getAllByText('Moi').length).toBeGreaterThan(0);
      expect(screen.getByText('Alice')).toBeTruthy();
    });
  });
});
