// src/data/mathQuestStages.js
import davinciFindings from './davinciFindings.json';
import mathRiddles from './mathRiddles.json';

// Les trouvailles et les énigmes sont déjà classées par niveau croissant
// (facile -> moyen -> complique -> enfer) dans leurs fichiers respectifs.
// On les associe simplement dans l'ordre : étape N = trouvaille N + énigme N.
export const MATH_RANKS = [
  { key: 'apprenti', label: 'Apprenti', icon: '🔧' },
  { key: 'artisan', label: 'Artisan', icon: '⚙️' },
  { key: 'ingenieur', label: 'Ingénieur', icon: '📐' },
  { key: 'maitre', label: 'Maître inventeur', icon: '🎨' },
  { key: 'genie', label: 'Génie universel', icon: '🧠' }
];

const TOTAL_STAGES = davinciFindings.length;

function rankForIndex(index) {
  const ratio = index / TOTAL_STAGES;
  const rankIndex = Math.min(MATH_RANKS.length - 1, Math.floor(ratio * MATH_RANKS.length));
  return MATH_RANKS[rankIndex];
}

const LEVEL_TO_DIFFICULTY = {
  facile: 'facile',
  moyen: 'moyen',
  complique: 'complique',
  enfer: 'enfer'
};

export const MATH_QUEST_STAGES = davinciFindings.map((finding, index) => {
  const riddle = mathRiddles[index];
  return {
    number: index + 1,
    finding,
    riddle,
    difficulty: LEVEL_TO_DIFFICULTY[riddle?.level] ?? 'facile',
    rank: rankForIndex(index)
  };
});

export function getMathStage(number) {
  return MATH_QUEST_STAGES.find(s => s.number === number) ?? null;
}

export function mathRankForCompletedCount(completedCount) {
  if (completedCount === 0) return MATH_RANKS[0];
  const index = Math.min(completedCount, MATH_QUEST_STAGES.length) - 1;
  return MATH_QUEST_STAGES[index]?.rank ?? MATH_RANKS[MATH_RANKS.length - 1];
}

// Vérifie une réponse donnée par le joueur (insensible aux espaces et à la casse).
export function checkRiddleAnswer(riddle, userAnswer) {
  if (!riddle || userAnswer == null) return false;
  const normalize = (s) => String(s).trim().toLowerCase().replace(/\s+/g, '');
  return normalize(userAnswer) === normalize(riddle.answer);
}
