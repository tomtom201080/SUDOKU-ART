// src/lib/analytics.js
import { supabase } from './supabaseClient';

// Toutes les fonctions ci-dessous sont "fire-and-forget" : un échec
// d'enregistrement ne doit jamais perturber le jeu lui-même.

export function logGameStart({ difficulty, userId, isCustomPhoto, isChallenge }) {
  supabase.from('game_events').insert({
    event_type: 'start',
    difficulty,
    user_id: userId ?? null,
    is_custom_photo: !!isCustomPhoto,
    is_challenge: !!isChallenge
  }).then(() => {}, () => {});
}

export function logGameComplete({ difficulty, userId, errorCount, elapsedSeconds, isCustomPhoto, isChallenge }) {
  supabase.from('game_events').insert({
    event_type: 'complete',
    difficulty,
    user_id: userId ?? null,
    is_custom_photo: !!isCustomPhoto,
    is_challenge: !!isChallenge,
    error_count: errorCount,
    elapsed_seconds: elapsedSeconds
  }).then(() => {}, () => {});
}

export function logGameFail({ difficulty, userId, errorCount, elapsedSeconds, isChallenge }) {
  supabase.from('game_events').insert({
    event_type: 'fail',
    difficulty,
    user_id: userId ?? null,
    is_challenge: !!isChallenge,
    error_count: errorCount,
    elapsed_seconds: elapsedSeconds
  }).then(() => {}, () => {});
}

// Récupère tous les événements de jeu (réservé à l'admin, RLS protège déjà
// l'accès côté base de données). On ramène tout et on agrège côté client :
// volumes modestes pour une appli perso, pas besoin de vues SQL dédiées.
export async function fetchAllGameEvents() {
  const { data, error } = await supabase
    .from('game_events')
    .select('event_type, difficulty, is_custom_photo, is_challenge, error_count, elapsed_seconds, created_at')
    .order('created_at', { ascending: false })
    .limit(20000);

  if (error) throw error;
  return data ?? [];
}
