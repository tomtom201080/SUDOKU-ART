// src/lib/profiles.js
import { supabase } from './supabaseClient';

// Règles : 3-20 caractères, lettres/chiffres/tiret bas/tiret, pas d'espaces
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;

export function validateUsername(username) {
  if (!username || username.trim().length < 3) return 'Au moins 3 caractères.';
  if (username.trim().length > 20) return '20 caractères maximum.';
  if (!USERNAME_REGEX.test(username.trim())) return 'Lettres, chiffres, _ et - uniquement.';
  return null; // valide
}

// Récupère le profil de l'utilisateur connecté
export async function fetchMyProfile(userId) {
  if (!userId) return null;
  const { data } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .maybeSingle();
  return data ?? null;
}

// Vérifie si un pseudo est disponible (insensible à la casse)
export async function checkUsernameAvailable(username) {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', username.trim())
    .maybeSingle();
  return !data; // true = disponible
}

// Crée ou met à jour le pseudo de l'utilisateur connecté
export async function saveUsername(userId, username) {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, username: username.trim() }, { onConflict: 'id' });
  if (error) throw error;
}
