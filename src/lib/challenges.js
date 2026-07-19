// src/lib/challenges.js
import { supabase } from './supabaseClient';
import { BUCKET } from './sharedPhoto';

const PENDING_KEY = 'sudoku-devoile:pendingChallengeId';
const DEVICE_TOKEN_KEY = 'sudoku-devoile:deviceToken';

// Identifiant aléatoire propre à ce navigateur, créé une seule fois et
// réutilisé pour tous les défis ouverts depuis cet appareil.
function getOrCreateDeviceToken() {
  try {
    let token = localStorage.getItem(DEVICE_TOKEN_KEY);
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem(DEVICE_TOKEN_KEY, token);
    }
    return token;
  } catch {
    return crypto.randomUUID(); // pas de stockage possible : token jetable
  }
}

// Tente de réclamer ce défi pour cet appareil. Si quelqu'un (un autre
// appareil) l'a déjà réclamé avant, la photo ne doit plus être montrée ici :
// c'est ce qui protège contre le transfert involontaire du lien.
// Retourne { granted: true } si cet appareil a (ou avait déjà) l'accès,
// { granted: false } si un autre appareil l'a réclamé en premier.
export async function claimChallengeToken(challengeId) {
  const deviceToken = getOrCreateDeviceToken();

  // On essaie d'abord de poser notre jeton, uniquement si aucun n'est encore posé.
  await supabase
    .from('challenges')
    .update({ claim_token: deviceToken })
    .eq('id', challengeId)
    .is('claim_token', null);

  // Quel que soit le résultat de la tentative, on relit l'état réel : si le
  // jeton enregistré est bien le nôtre, on a l'accès (qu'on vienne de le
  // poser, ou qu'on l'ait déjà posé lors d'une précédente ouverture).
  const { data } = await supabase
    .from('challenges')
    .select('claim_token')
    .eq('id', challengeId)
    .maybeSingle();

  return { granted: data?.claim_token === deviceToken };
}

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

// Une fois le défi terminé (réussi ou perdu), on supprime la photo du
// stockage et la ligne en base : la grille ne peut pas être rejouée.
export async function deleteChallenge(challengeId, photoPath) {
  if (photoPath) {
    await supabase.storage.from(BUCKET).remove([photoPath]);
  }
  await supabase.from('challenges').delete().eq('id', challengeId);
}
