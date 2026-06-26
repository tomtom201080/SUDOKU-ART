// src/lib/challenges.js
import { supabase } from './supabaseClient';

const PENDING_KEY = 'sudoku-devoile:pendingChallengeId';

// Crée un défi en base : photo déjà téléversée (photoPath), paramètres de
// difficulté/erreurs/temps choisis par l'expéditeur. Retourne la ligne créée
// (avec son id, utilisé pour construire le lien).
export async function createChallenge({ photoPath, difficultyMode, maxErrors, timeLimitMinutes }) {
  const { data: userData } = await supabase.auth.getUser();
  const senderEmail = userData?.user?.email ?? 'un ami';

  const { data, error } = await supabase
    .from('challenges')
    .insert({
      sender_email: senderEmail,
      photo_path: photoPath,
      difficulty_mode: difficultyMode,
      max_errors: maxErrors,
      time_limit_minutes: timeLimitMinutes
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function buildChallengeLink(challengeId) {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('defi', challengeId);
  return url.toString();
}

export function readChallengeIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('defi');
}

export function clearChallengeFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('defi');
  window.history.replaceState({}, '', url.toString());
}

// Le défi en attente est mémorisé dans localStorage (pas seulement dans
// l'URL), pour survivre à un passage par la création de compte / confirmation
// email, qui ouvre souvent une page différente sans le paramètre d'origine.
export function rememberPendingChallengeId(challengeId) {
  try {
    localStorage.setItem(PENDING_KEY, challengeId);
  } catch {
    // stockage indisponible, on ignore simplement la persistance
  }
}

export function getRememberedChallengeId() {
  try {
    return localStorage.getItem(PENDING_KEY);
  } catch {
    return null;
  }
}

export function forgetPendingChallengeId() {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    // stockage indisponible, on ignore simplement la persistance
  }
}

export async function fetchChallenge(challengeId) {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', challengeId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Rattache le défi au compte de la personne qui vient d'ouvrir le lien
// (uniquement si personne ne l'a encore réclamé).
export async function claimChallenge(challengeId) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return null;

  await supabase
    .from('challenges')
    .update({ claimed_by: userId })
    .eq('id', challengeId)
    .is('claimed_by', null);

  return fetchChallenge(challengeId);
}

// Liste tous les défis reçus par l'utilisateur connecté, pas encore terminés.
export async function fetchPendingChallenges() {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('claimed_by', userId)
    .eq('completed', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function markChallengeCompleted(challengeId, result) {
  await supabase
    .from('challenges')
    .update({ completed: true, result })
    .eq('id', challengeId);
}