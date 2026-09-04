// src/sudoku/generator.test.js
// Couvre la régression corrigée sur digHoles() : un seul passage de retrait
// glouton se bloquait parfois avant d'atteindre le nombre d'indices cible
// (surtout à "enfer", 24 indices) et rendait silencieusement la grille plus
// facile que la difficulté annoncée. digHoles() retente maintenant plusieurs
// ordres de retrait et garde le meilleur.
import { describe, it, expect } from 'vitest';
import { generateSudoku, DIFFICULTY_CLUES, DIFFICULTIES } from './generator';

function countClues(puzzle) {
  let count = 0;
  for (const row of puzzle) for (const v of row) if (v !== 0) count++;
  return count;
}

describe('generateSudoku', () => {
  for (const difficulty of DIFFICULTIES) {
    it(`atteint exactement le nombre d'indices cible pour "${difficulty}"`, () => {
      // Répété : le tirage est aléatoire, une seule exécution pourrait
      // masquer une régression qui ne réapparaît qu'une fois sur N.
      for (let i = 0; i < 5; i++) {
        const { puzzle } = generateSudoku(difficulty);
        expect(countClues(puzzle)).toBe(DIFFICULTY_CLUES[difficulty]);
      }
    });
  }

  it('la grille de départ est cohérente avec la solution sur les cases données', () => {
    const { puzzle, solution, givenMask } = generateSudoku('moyen');
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        expect(givenMask[r][c]).toBe(puzzle[r][c] !== 0);
        if (givenMask[r][c]) expect(puzzle[r][c]).toBe(solution[r][c]);
      }
    }
  });
});
