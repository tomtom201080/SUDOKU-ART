// src/lib/rematches.js
import { supabase } from './supabaseClient';

const DEVICE_TOKEN_KEY = 'sudoku-devoile:deviceToken';
const STARTED_REMATCHES_KEY = 'sudoku-devoile:startedRematchIds';

function getOrCreateDeviceToken() {
  try {
    let token = localStorage.getItem(DEVICE_TOKEN_KEY);
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem(DEVICE_TOKEN_KEY, token);
    }
    return token;
  } catch {
    return crypto.randomUUID();
  }
}

// Empêche de rouvrir le lien pour relancer la grille à zéro (et retenter
// indéfiniment jusqu'à avoir un bon score) : une fois qu'un défi a été
// démarré sur cet appareil, on ne le redémarre plus jamais, même si le lien
// est rouvert avant d'avoir fini.
export function hasRematchAlreadyStarted(id) {
  try {
    const list = JSON.parse(localStorage.getItem(STARTED_REMATCHES_KEY) || '[]');
    return list.includes(id);
  } catch {
    return false;
  }
}

export function markRematchAsStarted(id) {
  try {
    const list = JSON.parse(localStorage.getItem(STARTED_REMATCHES_KEY) || '[]');
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(STARTED_REMATCHES_KEY, JSON.stringify(list));
    }
  } catch {
    // stockage indisponible : on ne peut pas mémoriser, tant pis
  }
}

// Crée un défi "même grille" : la grille jouée vient d'être terminée par le
// challenger, on enregistre son résultat et la grille elle-même pour que le
// destinataire joue exactement la même.
export async function createRematch({
  puzzle, solution, difficulty, photoPath,
  challengerName, challengerUserId,
  challengerErrors, challengerSeconds, challengerHints = 0,
  hintsLimit = null, groupMode = false
}) {
  const { data, error } = await supabase
    .from('rematches')
    .insert({
      puzzle: JSON.stringify(puzzle),
      solution: JSON.stringify(solution),
      difficulty,
      photo_path: photoPath ?? null,
      challenger_name: challengerName ?? null,
      challenger_user_id: challengerUserId ?? null,
      challenger_result_errors: challengerErrors,
      challenger_result_seconds: challengerSeconds,
      challenger_result_hints: challengerHints,
      hints_limit: hintsLimit ?? null,
      group_mode: groupMode
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function buildRematchLink(rematchId) {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('rematch', rematchId);
  return url.toString();
}

export function readRematchIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('rematch');
}

export function clearRematchFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('rematch');
  window.history.replaceState({}, '', url.toString());
}

export async function fetchRematch(id) {
  const { data, error } = await supabase
    .from('rematches')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Même logique anti-transfert que pour les défis classiques : seul le
// premier appareil à ouvrir le lien garde l'accès à la grille et à la photo.
export async function claimRematchToken(id) {
  const deviceToken = getOrCreateDeviceToken();

  await supabase
    .from('rematches')
    .update({ claim_token: deviceToken })
    .eq('id', id)
    .is('claim_token', null);

  const { data } = await supabase
    .from('rematches')
    .select('claim_token')
    .eq('id', id)
    .maybeSingle();

  return { granted: data?.claim_token === deviceToken };
}

// Enregistre le résultat du destinataire une fois sa partie terminée.
export async function submitRematchResult(id, { errors, seconds, hints = 0, userId }) {
  await supabase
    .from('rematches')
    .update({
      recipient_result_errors: errors,
      recipient_result_seconds: seconds,
      recipient_result_hints: hints,
      recipient_user_id: userId ?? null,
      completed: true
    })
    .eq('id', id);
}

// Liste les défis envoyés par ce compte dont le destinataire vient de
// terminer, et qui n'ont pas encore été vus par le challenger.
export async function fetchUnnotifiedRematchResults(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('rematches')
    .select('*')
    .eq('challenger_user_id', userId)
    .eq('completed', true)
    .eq('notified', false)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function markRematchNotified(id) {
  await supabase.from('rematches').update({ notified: true }).eq('id', id);
}

// Règle du gagnant : celui qui a fait le moins d'erreurs gagne. À erreurs
// égales, celui qui a été le plus rapide gagne. Si tout est identique,
// égalité.
const PENALTY_SECONDS = 120; // +2 minutes par erreur ou par indice utilisé

// Calcule le score ajusté (temps réel + pénalités).
// Plus petit = meilleur.
export function calcAdjustedScore({ seconds, errors, hints = 0 }) {
  if (seconds == null) return Infinity;
  return seconds + (errors ?? 0) * PENALTY_SECONDS + (hints ?? 0) * PENALTY_SECONDS;
}

// Formate un score ajusté en mm:ss pour affichage.
export function formatAdjustedScore(score) {
  if (!isFinite(score)) return '—';
  const s = Math.round(score);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function determineRematchWinner({
  challengerErrors, challengerSeconds, challengerHints = 0,
  recipientErrors,  recipientSeconds,  recipientHints  = 0
}) {
  const cs = calcAdjustedScore({ seconds: challengerSeconds, errors: challengerErrors, hints: challengerHints });
  const rs = calcAdjustedScore({ seconds: recipientSeconds,  errors: recipientErrors,  hints: recipientHints  });
  if (rs < cs) return 'recipient';
  if (cs < rs) return 'challenger';
  return 'tie';
}

// Récupère tous les défis envoyés par cet utilisateur
export async function fetchSentRematches(userId) {
  if (!userId) return [];
  const { data } = await supabase
    .from('rematches')
    .select('*')
    .eq('challenger_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  return data ?? [];
}

// Récupère tous les défis reçus et joués par cet utilisateur
export async function fetchReceivedRematches(userId) {
  if (!userId) return [];
  const { data } = await supabase
    .from('rematches')
    .select('*')
    .eq('recipient_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  return data ?? [];
}

// En mode groupe : soumet le résultat du joueur dans rematch_results
export async function submitGroupResult(rematchId, { errors, seconds, hints = 0, userId, playerName }) {
  const { error } = await supabase
    .from('rematch_results')
    .insert({
      rematch_id:    rematchId,
      player_name:   playerName ?? 'Anonyme',
      player_user_id: userId ?? null,
      errors,
      seconds,
      hints
    });
  if (error) throw error;
}

// Récupère tous les résultats d'un défi de groupe
export async function fetchGroupResults(rematchId) {
  const { data } = await supabase
    .from('rematch_results')
    .select('*')
    .eq('rematch_id', rematchId)
    .order('seconds', { ascending: true });
  return data ?? [];
}
