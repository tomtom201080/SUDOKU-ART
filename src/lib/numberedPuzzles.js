// src/lib/numberedPuzzles.js
// Catalogue de grilles numérotées (table numbered_puzzles, voir la migration
// 20260904090000) : permet de figer une grille + une œuvre sous un numéro
// stable, pour un lien du type sudokuart.com/?grille=128 imprimable sur un
// visuel teaser — n'importe qui l'ouvre et démarre la même grille depuis le
// début. Écriture réservée à l'admin côté base (RLS), lecture publique.
import { supabase } from './supabaseClient';

// Crée une nouvelle grille numérotée pour l'œuvre et la difficulté données.
// Le puzzle est fourni tout fait (généré par l'appelant via
// src/sudoku/generator.js) pour rester cohérent avec le reste de l'appli, qui
// génère toujours ses grilles côté client.
export async function saveNumberedPuzzle({ puzzle, solution, difficulty, paintingId }) {
  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('numbered_puzzles')
    .insert({
      puzzle: JSON.stringify(puzzle),
      solution: JSON.stringify(solution),
      difficulty,
      painting_id: paintingId,
      created_by: userData?.user?.id ?? null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchNumberedPuzzle(number) {
  const { data, error } = await supabase
    .from('numbered_puzzles')
    .select('*')
    .eq('number', number)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export function buildNumberedPuzzleLink(number) {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('grille', String(number));
  return url.toString();
}

export function readNumberedPuzzleFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('grille');
  if (!raw) return null;
  const number = Number(raw);
  return Number.isInteger(number) && number > 0 ? number : null;
}

export function clearNumberedPuzzleFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('grille');
  window.history.replaceState({}, '', url.toString());
}
