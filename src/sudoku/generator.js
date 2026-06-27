// src/sudoku/generator.js
// Moteur de génération / résolution de grilles de Sudoku 9x9.

const SIZE = 9;
const BOX = 3;

// Nombre d'indices (cases pré-remplies) selon la difficulté.
// Plus le nombre est bas, plus la grille est difficile.
export const DIFFICULTY_CLUES = {
  facile: 45,
  moyen: 36,
  complique: 30,
  enfer: 24
};

export const DIFFICULTIES = ['facile', 'moyen', 'complique', 'enfer'];

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isSafe(grid, row, col, num) {
  for (let x = 0; x < SIZE; x++) {
    if (grid[row][x] === num || grid[x][col] === num) return false;
  }
  const startRow = row - (row % BOX);
  const startCol = col - (col % BOX);
  for (let r = 0; r < BOX; r++) {
    for (let c = 0; c < BOX; c++) {
      if (grid[startRow + r][startCol + c] === num) return false;
    }
  }
  return true;
}

function findEmpty(grid) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return [r, c];
    }
  }
  return null;
}

// Remplit récursivement une grille vide pour obtenir une grille complète valide,
// avec un ordre aléatoire des chiffres pour varier les grilles générées.
function fillGrid(grid) {
  const empty = findEmpty(grid);
  if (!empty) return true;
  const [row, col] = empty;
  const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (const num of numbers) {
    if (isSafe(grid, row, col, num)) {
      grid[row][col] = num;
      if (fillGrid(grid)) return true;
      grid[row][col] = 0;
    }
  }
  return false;
}

// Compte les solutions d'une grille (s'arrête dès que 2 solutions sont trouvées,
// suffisant pour vérifier l'unicité sans calcul excessif).
function countSolutions(grid, limit = 2) {
  let count = 0;

  function solve(g) {
    if (count >= limit) return;
    const empty = findEmpty(g);
    if (!empty) {
      count++;
      return;
    }
    const [row, col] = empty;
    for (let num = 1; num <= 9; num++) {
      if (count >= limit) return;
      if (isSafe(g, row, col, num)) {
        g[row][col] = num;
        solve(g);
        g[row][col] = 0;
      }
    }
  }

  const copy = grid.map(r => [...r]);
  solve(copy);
  return count;
}

function cloneGrid(grid) {
  return grid.map(r => [...r]);
}

// Génère une grille complète puis retire des cases une à une (ordre aléatoire),
// en ne retirant que si l'unicité de la solution est conservée, jusqu'à atteindre
// le nombre d'indices voulu (ou un minimum si l'unicité bloque avant).
function digHoles(solution, targetClues) {
  const puzzle = cloneGrid(solution);
  const cells = shuffle(
    Array.from({ length: SIZE * SIZE }, (_, i) => [Math.floor(i / SIZE), i % SIZE])
  );

  let clues = SIZE * SIZE;

  for (const [row, col] of cells) {
    if (clues <= targetClues) break;
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    const solutions = countSolutions(puzzle, 2);
    if (solutions !== 1) {
      // Retirer cette case casse l'unicité : on la remet.
      puzzle[row][col] = backup;
    } else {
      clues--;
    }
  }

  return puzzle;
}

// Génère un puzzle complet : grille de départ (avec trous), solution complète,
// et masque des cases "données" dès le départ (clues).
export function generateSudoku(difficulty = 'moyen') {
  const targetClues = DIFFICULTY_CLUES[difficulty] ?? DIFFICULTY_CLUES.moyen;

  const solution = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  fillGrid(solution);

  const puzzle = digHoles(solution, targetClues);

  const givenMask = puzzle.map(row => row.map(cell => cell !== 0));

  return {
    puzzle,
    solution,
    givenMask,
    difficulty
  };
}

// Vérifie si la valeur posée par le joueur en (row, col) est correcte
// par rapport à la solution.
export function isMoveCorrect(solution, row, col, value) {
  return solution[row][col] === value;
}

// Vérifie si la grille jouée par l'utilisateur est complète et entièrement correcte.
export function isGridComplete(userGrid, solution) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (userGrid[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

export { SIZE, BOX };
