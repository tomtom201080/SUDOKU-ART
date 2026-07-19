// src/utils/kpiStats.js
const DIFFICULTIES = ['facile', 'moyen', 'complique', 'enfer'];

function isToday(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}

function daysAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

function average(numbers) {
  const valid = numbers.filter(n => typeof n === 'number' && !Number.isNaN(n));
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function formatDuration(seconds) {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

export function computeKpis(events) {
  const started = events.filter(e => e.event_type === 'start');
  const completed = events.filter(e => e.event_type === 'complete');
  const failed = events.filter(e => e.event_type === 'fail');

  const startedToday = started.filter(e => isToday(e.created_at));
  const completedToday = completed.filter(e => isToday(e.created_at));

  const byDifficulty = DIFFICULTIES.map(diff => {
    const startedCount = started.filter(e => e.difficulty === diff).length;
    const completedCount = completed.filter(e => e.difficulty === diff).length;
    return {
      difficulty: diff,
      started: startedCount,
      completed: completedCount,
      completionRate: startedCount > 0 ? Math.round((completedCount / startedCount) * 100) : null
    };
  });

  const customPhotoGames = started.filter(e => e.is_custom_photo).length;
  const challengeGamesStarted = started.filter(e => e.is_challenge).length;

  const avgErrors = average(completed.map(e => e.error_count));
  const avgTimeSeconds = average(completed.map(e => e.elapsed_seconds));

  // Petit historique des 7 derniers jours, pour voir la tendance.
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const startedCount = started.filter(e => daysAgo(e.created_at) === i).length;
    const completedCount = completed.filter(e => daysAgo(e.created_at) === i).length;
    const label = i === 0 ? "Aujourd'hui" : i === 1 ? 'Hier' : `Il y a ${i} jours`;
    return { label, started: startedCount, completed: completedCount };
  });

  return {
    totalStarted: started.length,
    totalCompleted: completed.length,
    totalFailed: failed.length,
    globalCompletionRate: started.length > 0 ? Math.round((completed.length / started.length) * 100) : null,
    startedToday: startedToday.length,
    completedToday: completedToday.length,
    byDifficulty,
    customPhotoGames,
    challengeGamesStarted,
    avgErrors: avgErrors != null ? avgErrors.toFixed(1) : '—',
    avgTime: formatDuration(avgTimeSeconds),
    last7Days
  };
}
