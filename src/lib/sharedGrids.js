// src/lib/sharedGrids.js
// QR code de partage sous la grille (voir ShareGridPanel.jsx) : deux types
// de lignes dans la table shared_grids, 'initial' (grille de départ, créée
// une seule fois par partie — dédoublonnage géré côté appelant, voir
// useGame.js) et 'snapshot' (état figé — "Appel à un ami"). Lecture
// publique par id, écriture uniquement via les RPC create_shared_grid()/
// increment_shared_grid_scan() (voir la migration 20261006183432), qui
// valident la forme du payload et appliquent une limite anti-abus par
// appareil — jamais d'insert/update direct sur la table depuis le client.
import { supabase } from './supabaseClient';
import { getOrCreateDeviceToken } from './deviceToken';

export async function createSharedGrid({
  type, puzzle, solution, userGrid, notesGrid, difficulty, paintingId = null, photoPath = null
}) {
  const { data, error } = await supabase.rpc('create_shared_grid', {
    p_type: type,
    p_puzzle: puzzle,
    p_solution: solution,
    p_user_grid: userGrid,
    p_notes_grid: notesGrid,
    p_difficulty: difficulty,
    p_painting_id: paintingId,
    p_photo_path: photoPath,
    p_device_token: getOrCreateDeviceToken()
  });

  if (error) throw error;
  return data;
}

export async function fetchSharedGrid(id) {
  const { data, error } = await supabase
    .from('shared_grids')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Fire-and-forget volontaire : un scan non compté n'a aucune conséquence
// pour le joueur, pas la peine de faire attendre le chargement de sa partie.
export function incrementScan(id) {
  supabase.rpc('increment_shared_grid_scan', { p_id: id }).then(() => {}, () => {});
}

export function buildSharedGridLink(id) {
  return `${window.location.origin}/g/${id}`;
}

const PATH_PATTERN = /^\/g\/([A-Za-z0-9]{4,32})\/?$/;

export function readSharedGridIdFromPath() {
  const match = window.location.pathname.match(PATH_PATTERN);
  return match ? match[1] : null;
}

// Revient à "/" une fois la grille partagée chargée, pour qu'un rechargement
// de page ne la relance pas sans arrêt — même esprit que
// clearRematchFromUrl()/clearChallengeFromUrl(), adapté à un vrai chemin.
export function clearSharedGridFromPath() {
  window.history.replaceState({}, '', '/');
}
