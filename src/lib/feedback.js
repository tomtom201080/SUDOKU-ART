// src/lib/feedback.js
import { supabase } from './supabaseClient';

const MAX_MESSAGE_LENGTH = 2000;
const RATE_LIMIT_KEY = 'sudoku-art:lastFeedbackAt';
const RATE_LIMIT_MS = 30_000; // anti-spam simple : 1 envoi / 30s max côté client

function isRateLimited() {
  try {
    const last = parseInt(localStorage.getItem(RATE_LIMIT_KEY) ?? '0', 10);
    return Date.now() - last < RATE_LIMIT_MS;
  } catch {
    return false;
  }
}

function markSent() {
  try { localStorage.setItem(RATE_LIMIT_KEY, String(Date.now())); } catch { /* tant pis */ }
}

// user_agent_category : une catégorie technique large, jamais la chaîne
// user-agent complète (qui peut être utilisée comme quasi-identifiant).
function userAgentCategory() {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Mobi/.test(ua)) return 'mobile_other';
  return 'desktop';
}

export async function submitFeedback({ feedbackType, message, page, language, difficulty, progressPercent, puzzleId }) {
  if (isRateLimited()) {
    return { error: 'rate_limited' };
  }
  const trimmed = (message ?? '').trim().slice(0, MAX_MESSAGE_LENGTH);

  const { error } = await supabase.from('user_feedback').insert({
    feedback_type: feedbackType,
    message: trimmed || null,
    page: page ?? null,
    language: language ?? null,
    difficulty: difficulty ?? null,
    progress_percent: progressPercent ?? null,
    puzzle_id: puzzleId ?? null,
    app_version: import.meta.env.VITE_APP_VERSION ?? null,
    user_agent_category: userAgentCategory()
  });

  if (error) return { error: error.message };
  markSent();
  return { error: null };
}

export const FEEDBACK_MESSAGE_MAX_LENGTH = MAX_MESSAGE_LENGTH;
