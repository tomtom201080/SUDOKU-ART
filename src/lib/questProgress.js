// src/lib/questProgress.js
import { supabase } from './supabaseClient';

export async function fetchQuestProgress(userId) {
  if (!userId) return { completed_stages: [] };
  const { data, error } = await supabase
    .from('quest_progress')
    .select('completed_stages')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return { completed_stages: [] };
  return data;
}

// Marque une étape comme terminée (idempotent : rejouer une étape déjà
// validée ne la duplique pas dans la liste).
export async function markStageCompleted(userId, stageNumber) {
  if (!userId) return;

  const current = await fetchQuestProgress(userId);
  const completed = current.completed_stages.includes(stageNumber)
    ? current.completed_stages
    : [...current.completed_stages, stageNumber];

  await supabase
    .from('quest_progress')
    .upsert({ user_id: userId, completed_stages: completed, updated_at: new Date().toISOString() });
}
