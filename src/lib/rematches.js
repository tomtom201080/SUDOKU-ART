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
  hintsLimit = null, groupMode = false, classicMode = false, label = null
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
      group_mode: groupMode,
      classic_mode: classicMode,
      label: label ?? null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Recrée un défi à partir d'un défi existant (même grille, même
// difficulté, même limite d'indices, même score du challenger déjà
// enregistré) sous la forme d'une TOUTE NOUVELLE ligne — l'ancien défi
// n'est jamais modifié ni supprimé, il reste intact dans l'historique.
// Permet de changer le mode (perso/groupe) et l'image par rapport à
// l'original.
export async function regenerateRematch(original, { groupMode, classicMode, photoPath, challengerName, challengerUserId, label }) {
  const puzzle   = typeof original.puzzle   === 'string' ? JSON.parse(original.puzzle)   : original.puzzle;
  const solution = typeof original.solution === 'string' ? JSON.parse(original.solution) : original.solution;

  return createRematch({
    puzzle,
    solution,
    difficulty: original.difficulty,
    photoPath,
    challengerName,
    challengerUserId,
    challengerErrors: original.challenger_result_errors ?? 0,
    challengerSeconds: original.challenger_result_seconds ?? 0,
    challengerHints: original.challenger_result_hints ?? 0,
    hintsLimit: original.hints_limit ?? null,
    groupMode,
    classicMode,
    label: label !== undefined ? label : (original.label ?? null)
  });
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

// Mode perso (1v1) : quand le CRÉATEUR joue lui-même son propre défi (via
// "Jouer maintenant" juste après l'avoir créé, ou en rouvrant son propre
// lien) avant qu'un ami ne l'ait fait, son score doit devenir la vraie
// référence du challenger — pas un score de "destinataire" comparé à tort
// au 0/0 fictif posé à la création. Met à jour la même ligne, ne consomme
// jamais la place du destinataire (recipient_*, "premier arrivé" reste
// intact pour un ami qui jouerait ensuite).
export async function updateChallengerBaseline(id, { errors, seconds, hints = 0 }) {
  await supabase
    .from('rematches')
    .update({
      challenger_result_errors: errors,
      challenger_result_seconds: seconds,
      challenger_result_hints: hints
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

// En mode groupe : soumet le résultat du joueur dans rematch_results.
// Un participant CONNECTÉ (l'expéditeur qui rejoue son propre lien, ou un
// ami invité) ne doit avoir qu'UNE seule entrée par défi : une nouvelle
// tentative remplace la précédente, même règle "la dernière tentative
// écrase" que submitRematchResult en mode perso. Un candidat libre non
// connecté (userId absent) reste géré par pseudo, sans changement.
export async function submitGroupResult(rematchId, { errors, seconds, hints = 0, userId, playerName }) {
  const name = playerName ?? 'Anonyme';

  if (userId) {
    const { data: existing } = await supabase
      .from('rematch_results')
      .select('id')
      .eq('rematch_id', rematchId)
      .eq('player_user_id', userId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('rematch_results')
        .update({ player_name: name, errors, seconds, hints })
        .eq('id', existing.id);
      if (error) throw error;
      return;
    }
  }

  const { error } = await supabase
    .from('rematch_results')
    .insert({
      rematch_id:    rematchId,
      player_name:   name,
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

// Fusionne le résultat du challenger (stocké sur la ligne `rematches`, il a
// joué en créant le défi) avec les résultats des autres participants
// (`rematch_results`), triés par score ajusté croissant (meilleur en
// premier). Logique partagée entre le classement de "Mes défis envoyés" et
// celui affiché en fin de partie.
export function mergeAndSortGroupResults(rematch, results) {
  const rows = [...results];
  if (rematch.challenger_result_seconds > 0) {
    rows.unshift({
      id: 'challenger',
      player_name: rematch.challenger_name || null,
      player_user_id: rematch.challenger_user_id ?? null,
      errors: rematch.challenger_result_errors ?? 0,
      seconds: rematch.challenger_result_seconds ?? 0,
      hints: rematch.challenger_result_hints ?? 0,
      isChallenger: true
    });
  }
  return rows.sort((a, b) =>
    calcAdjustedScore({ seconds: a.seconds, errors: a.errors, hints: a.hints ?? 0 }) -
    calcAdjustedScore({ seconds: b.seconds, errors: b.errors, hints: b.hints ?? 0 })
  );
}

// Rattache au compte qui vient de se connecter/s'inscrire le résultat qu'il
// a joué en "candidat libre" (sans compte) sur ce défi de groupe. Le pseudo
// est déjà garanti unique par défi (voir checkPseudoAvailableForDefi dans
// IncomingDefiModal), donc rematch_id + player_name identifie sans ambiguïté
// LA ligne à rattacher — pas besoin de jeton d'appareil supplémentaire. Le
// filtre player_user_id IS NULL protège contre un double-rattachement.
export async function claimGroupResult(rematchId, { playerName, userId }) {
  const { error } = await supabase
    .from('rematch_results')
    .update({ player_user_id: userId })
    .eq('rematch_id', rematchId)
    .eq('player_name', playerName)
    .is('player_user_id', null);
  if (error) throw error;
}

// Supprime un défi de la vue de l'utilisateur (soft delete via un champ hidden)
// On ne supprime pas vraiment la row car l'autre joueur en a peut-être besoin.
export async function hideRematch(rematchId, userId) {
  // On stocke les IDs masqués dans localStorage côté client — simple et sans
  // nécessiter de colonne supplémentaire en base.
  try {
    const key = `sudoku-devoile:hiddenRematches:${userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    if (!existing.includes(rematchId)) {
      existing.push(rematchId);
      localStorage.setItem(key, JSON.stringify(existing));
    }
  } catch {}
}

export function getHiddenRematchIds(userId) {
  try {
    const key = `sudoku-devoile:hiddenRematches:${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch { return []; }
}
