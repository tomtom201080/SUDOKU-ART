// src/lib/mathQuestProgress.js
import { supabase } from './supabaseClient';

export async function fetchMathQuestProgress(userId) {
  if (!userId) return { completed_stages: [] };
  const { data, error } = await supabase
    .from('math_quest_progress')
    .select('completed_stages')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return { completed_stages: [] };
  return data;
}

export async function markMathStageCompleted(userId, stageNumber) {
  if (!userId) return;

  const current = await fetchMathQuestProgress(userId);
  const completed = current.completed_stages.includes(stageNumber)
    ? current.completed_stages
    : [...current.completed_stages, stageNumber];

  await supabase
    .from('math_quest_progress')
    .upsert({ user_id: userId, completed_stages: completed, updated_at: new Date().toISOString() });
}
