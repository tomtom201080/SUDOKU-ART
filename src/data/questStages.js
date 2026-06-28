// src/data/questStages.js
import { paintings } from './paintingsIndex';

const TIER_ORDER = { commune: 0, rare: 1, legendaire: 2 };

// Les tableaux sont triés par rareté croissante : les étapes faciles du début
// révèlent les tableaux "commune", puis "rare", puis "légendaire" pour les
// dernières étapes — la difficulté du sudoku suit le même sens.
const sortedPaintings = [...paintings].sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);

const TOTAL_STAGES = sortedPaintings.length;

// Bande de difficulté selon la position dans le parcours (sur 4 quarts).
function difficultyForIndex(index) {
  const ratio = index / TOTAL_STAGES;
  if (ratio < 0.25) return 'facile';
  if (ratio < 0.5) return 'moyen';
  if (ratio < 0.75) return 'complique';
  return 'enfer';
}

// Rangs de l'avatar, sur 5 paliers à peu près égaux.
export const RANKS = [
  { key: 'paysan', label: 'Paysan', icon: '🧑‍🌾' },
  { key: 'ecuyer', label: 'Écuyer', icon: '🛡️' },
  { key: 'chevalier', label: 'Chevalier', icon: '⚔️' },
  { key: 'noble', label: 'Noble', icon: '🎩' },
  { key: 'roi', label: 'Roi', icon: '👑' }
];

function rankForIndex(index) {
  const ratio = index / TOTAL_STAGES;
  const rankIndex = Math.min(RANKS.length - 1, Math.floor(ratio * RANKS.length));
  return RANKS[rankIndex];
}

// Liste finale des étapes du parcours, prête à l'emploi.
export const QUEST_STAGES = sortedPaintings.map((painting, index) => ({
  number: index + 1,
  painting,
  difficulty: difficultyForIndex(index),
  rank: rankForIndex(index)
}));

export function getStage(number) {
  return QUEST_STAGES.find(s => s.number === number) ?? null;
}

// Rang correspondant au nombre d'étapes déjà terminées (le rang "en cours").
export function rankForCompletedCount(completedCount) {
  if (completedCount === 0) return RANKS[0];
  const index = Math.min(completedCount, QUEST_STAGES.length) - 1;
  return QUEST_STAGES[index]?.rank ?? RANKS[RANKS.length - 1];
}
