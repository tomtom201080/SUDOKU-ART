// src/lib/seenPaintings.js
import { supabase } from './supabaseClient';

// Récupère la liste des identifiants d'images déjà vues par ce compte, sur
// n'importe quel appareil (contrairement au stockage local, propre à chaque
// navigateur).
export async function getSeenPaintingIds(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('seen_paintings')
    .select('painting_id')
    .eq('user_id', userId);

  if (error) return [];
  return data.map(row => row.painting_id);
}

// Enregistre qu'une image vient d'être révélée par ce compte. On ignore les
// doublons (même image vue plusieurs fois) grâce à la clé primaire composite.
export async function markPaintingSeen(userId, paintingId) {
  if (!userId || !paintingId) return;
  await supabase
    .from('seen_paintings')
    .upsert({ user_id: userId, painting_id: paintingId }, { onConflict: 'user_id,painting_id' });
}
