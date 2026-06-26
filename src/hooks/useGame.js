// src/hooks/useGame.js
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { generateSudoku, isGridComplete } from '../sudoku/generator';
import { getCurrentSeason, pickWatermarkImage, pickRewardImage } from '../data/imageLibrary';
import { addToGallery, getUnlockedIds, recordWin } from '../utils/storage';

function cloneGrid(grid) {
  return grid.map(row => [...row]);
}

// Construit la grille initiale jouable : les cases données sont pré-remplies,
// les autres sont à 0 (vide).
function buildInitialUserGrid(puzzle) {
  return cloneGrid(puzzle);
}

// Construit une grille de notes vide : 9x9 cases, chacune avec 9 booléens
// (un par chiffre candidat 1-9).
function buildEmptyNotes() {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => Array(9).fill(false))
  );
}

function cloneNotes(notes) {
  return notes.map(row => row.map(cellNotes => [...cellNotes]));
}

function isSamePeerGroup(row, col, refRow, refCol) {
  const sameRow = row === refRow;
  const sameCol = col === refCol;
  const sameBox =
    Math.floor(row / 3) === Math.floor(refRow / 3) &&
    Math.floor(col / 3) === Math.floor(refCol / 3);
  return sameRow || sameCol || sameBox;
}

function boxIndexOf(row, col) {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

// Un carré 3x3 est "complet" quand ses 9 cases contiennent toutes la bonne
// valeur (qu'elles soient données au départ ou remplies par le joueur).
function isBoxComplete(boxIndex, grid, solution) {
  const boxRow = Math.floor(boxIndex / 3) * 3;
  const boxCol = (boxIndex % 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

function isRowComplete(row, grid, solution) {
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] !== solution[row][c]) return false;
  }
  return true;
}

function isColComplete(col, grid, solution) {
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] !== solution[r][col]) return false;
  }
  return true;
}

const CENTER_ROW = 4;
const CENTER_COL = 4;

export function useGame(manifest) {
  const [difficulty, setDifficulty] = useState(null);
  const [puzzleData, setPuzzleData] = useState(null); // { puzzle, solution, givenMask }
  const [userGrid, setUserGrid] = useState(null);
  const [watermark, setWatermark] = useState(null);
  const [watermarkVisible, setWatermarkVisible] = useState(true);
  const [imageIntensity, setImageIntensity] = useState(0.28);
  const [isComplete, setIsComplete] = useState(false);
  const [rewardImage, setRewardImage] = useState(null);
  const [errorCells, setErrorCells] = useState(() => new Set());
  const [errorCount, setErrorCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [notesMode, setNotesMode] = useState(false);
  const [notesGrid, setNotesGrid] = useState(() => buildEmptyNotes());
  const [history, setHistory] = useState([]);
  const [celebrate, setCelebrate] = useState(null); // { type: 'box'|'row'|'col', index }

  const timerIdRef = useRef(null);
  const celebrateTimeoutRef = useRef(null);

  const season = useMemo(() => getCurrentSeason(), []);

  const startNewGame = useCallback((chosenDifficulty, customImageUrl = null) => {
    const data = generateSudoku(chosenDifficulty);
    const initialUserGrid = buildInitialUserGrid(data.puzzle);
    const image = customImageUrl
      ? { id: `custom-${Date.now()}`, path: customImageUrl, tier: null, season: null, isCustom: true }
      : (manifest ? pickWatermarkImage(manifest, season) : null);

    setDifficulty(chosenDifficulty);
    setPuzzleData(data);
    setUserGrid(initialUserGrid);
    setWatermark(image);
    setWatermarkVisible(true);
    setIsComplete(false);
    setRewardImage(null);
    setErrorCells(new Set());
    setErrorCount(0);
    setElapsedSeconds(0);
    setNotesMode(false);
    setNotesGrid(buildEmptyNotes());
    setHistory([]);
    setCelebrate(null);
  }, [manifest, season]);

  // Chronomètre : actif uniquement pendant une partie en cours, et mis en
  // pause automatiquement si l'onglet/la page n'est plus visible (l'utilisateur
  // a changé d'application ou d'onglet).
  useEffect(() => {
    if (!difficulty || isComplete) return;

    function startInterval() {
      if (timerIdRef.current) return;
      timerIdRef.current = setInterval(() => {
        setElapsedSeconds(s => s + 1);
      }, 1000);
    }

    function stopInterval() {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        stopInterval();
      } else {
        startInterval();
      }
    }

    if (!document.hidden) startInterval();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopInterval();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [difficulty, isComplete]);

  // Le joueur saisit une valeur (1-9) ou l'efface (0) dans une case.
  // En mode notes, la saisie ajoute/retire un chiffre "candidat" sans toucher
  // à la vraie valeur de la case, et ne compte jamais comme une erreur.
  const setCellValue = useCallback((row, col, value) => {
    if (!puzzleData || !userGrid) return;
    if (puzzleData.givenMask[row][col]) return; // case fixe, non modifiable

    // Une fois la bonne valeur posée et validée dans une case, elle se
    // verrouille : on ne peut plus ni la modifier ni l'effacer.
    const currentValue = userGrid[row][col];
    const isAlreadyValidated = currentValue !== 0 && currentValue === puzzleData.solution[row][col];
    if (isAlreadyValidated) return;

    // On garde un instantané pour le bouton "Annuler", avant toute modification.
    setHistory(prev => [
      ...prev,
      {
        userGrid: cloneGrid(userGrid),
        notesGrid: cloneNotes(notesGrid),
        errorCells: new Set(errorCells),
        errorCount
      }
    ]);

    // --- Mode notes : on bascule un chiffre candidat dans la case ---
    if (notesMode) {
      if (userGrid[row][col] !== 0) return; // pas de notes sur une case déjà remplie
      setNotesGrid(prev => {
        const next = cloneNotes(prev);
        if (value === 0) {
          next[row][col] = Array(9).fill(false);
        } else {
          next[row][col][value - 1] = !next[row][col][value - 1];
        }
        return next;
      });
      return;
    }

    // --- Mode normal : on pose (ou efface) la vraie valeur ---
    const previousValue = userGrid[row][col];
    const next = cloneGrid(userGrid);
    next[row][col] = value;
    setUserGrid(next);

    const key = `${row}-${col}`;
    const nextErrors = new Set(errorCells);
    const isWrong = value !== 0 && value !== puzzleData.solution[row][col];
    if (isWrong) {
      nextErrors.add(key);
    } else {
      nextErrors.delete(key);
    }
    setErrorCells(nextErrors);

    if (isWrong && value !== previousValue) {
      setErrorCount(c => c + 1);
    }

    const isCorrect = value !== 0 && value === puzzleData.solution[row][col];

    // On efface les notes de la case qu'on vient de remplir, et si la valeur
    // posée est correcte, on retire ce chiffre des notes de toutes les cases
    // de la même ligne, colonne et carré (il n'est plus une supposition valide).
    setNotesGrid(prev => {
      const cloned = cloneNotes(prev);
      cloned[row][col] = Array(9).fill(false);
      if (isCorrect) {
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (r === row && c === col) continue;
            if (isSamePeerGroup(r, c, row, col)) {
              cloned[r][c][value - 1] = false;
            }
          }
        }
      }
      return cloned;
    });

    // Si ce coup vient de compléter un carré 3x3, une ligne ou une colonne
    // entière, on déclenche la petite animation d'étoiles qui crépitent, et
    // les chiffres donnés au départ dans cette zone deviennent visibles
    // (eux seuls étaient encore cachés, les chiffres trouvés par le joueur
    // se révèlent déjà immédiatement au fur et à mesure).
    if (isCorrect) {
      const box = boxIndexOf(row, col);
      const boxNewlyComplete =
        !isBoxComplete(box, userGrid, puzzleData.solution) &&
        isBoxComplete(box, next, puzzleData.solution);
      const rowNewlyComplete =
        !isRowComplete(row, userGrid, puzzleData.solution) &&
        isRowComplete(row, next, puzzleData.solution);
      const colNewlyComplete =
        !isColComplete(col, userGrid, puzzleData.solution) &&
        isColComplete(col, next, puzzleData.solution);

      let nextCelebrate = null;
      if (boxNewlyComplete) nextCelebrate = { type: 'box', index: box };
      else if (rowNewlyComplete) nextCelebrate = { type: 'row', index: row };
      else if (colNewlyComplete) nextCelebrate = { type: 'col', index: col };

      if (nextCelebrate) {
        setCelebrate(nextCelebrate);
        if (celebrateTimeoutRef.current) clearTimeout(celebrateTimeoutRef.current);
        celebrateTimeoutRef.current = setTimeout(() => setCelebrate(null), 1200);
      }
    }

    if (value !== 0 && isGridComplete(next, puzzleData.solution)) {
      setIsComplete(true);
      recordWin(difficulty);
      if (manifest) {
        const unlockedIds = getUnlockedIds();
        const reward = pickRewardImage(manifest, season, difficulty, unlockedIds);
        if (reward) {
          addToGallery(reward, { difficulty });
          setRewardImage(reward);
        }
      }
    }
  }, [puzzleData, userGrid, notesGrid, errorCells, errorCount, difficulty, manifest, season, notesMode]);

  // Annule le dernier coup joué (grille + notes + erreurs reviennent à l'état
  // précédent). Le compteur d'erreurs cumulé n'est lui jamais "annulé" : une
  // erreur déjà commise reste comptée dans les statistiques de la partie.
  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setUserGrid(last.userGrid);
      setNotesGrid(last.notesGrid);
      setErrorCells(last.errorCells);
      return prev.slice(0, -1);
    });
  }, []);

  const canUndo = history.length > 0;

  const toggleNotesMode = useCallback(() => {
    setNotesMode(m => !m);
  }, []);

  const toggleWatermark = useCallback(() => {
    setWatermarkVisible(v => !v);
  }, []);

  // Logique de révélation :
  // - la case centrale est toujours visible dès le départ (pour montrer que
  //   l'effet fonctionne, même si rien n'a encore été joué) ;
  // - une case trouvée par le joueur (non donnée) se révèle immédiatement
  //   dès qu'elle est remplie correctement ;
  // - une case donnée au départ ne se révèle que lorsque son carré, sa ligne
  //   ou sa colonne est entièrement complétée.
  const isCellRevealed = useCallback((row, col) => {
    if (!puzzleData || !userGrid) return false;

    if (row === CENTER_ROW && col === CENTER_COL) return true;

    const isGiven = puzzleData.givenMask[row][col];

    if (!isGiven) {
      const value = userGrid[row][col];
      return value !== 0 && value === puzzleData.solution[row][col];
    }

    const box = boxIndexOf(row, col);
    return (
      isBoxComplete(box, userGrid, puzzleData.solution) ||
      isRowComplete(row, userGrid, puzzleData.solution) ||
      isColComplete(col, userGrid, puzzleData.solution)
    );
  }, [puzzleData, userGrid]);

  const revealProgress = useMemo(() => {
    if (!puzzleData || !userGrid) return 0;
    let revealed = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (isCellRevealed(r, c)) revealed++;
      }
    }
    return revealed / 81;
  }, [puzzleData, userGrid, isCellRevealed]);

  // Calcule un indice expliqué pour une case vide : les chiffres déjà présents
  // dans la ligne/colonne/carré, les candidats restants, et la bonne valeur.
  const getHint = useCallback((row, col) => {
    if (!puzzleData || !userGrid) return null;
    if (puzzleData.givenMask[row][col]) return null;
    if (userGrid[row][col] !== 0) return null;

    const usedInRow = new Set();
    const usedInCol = new Set();
    const usedInBox = new Set();

    for (let i = 0; i < 9; i++) {
      const rowValue = userGrid[row][i];
      if (rowValue !== 0) usedInRow.add(rowValue);
      const colValue = userGrid[i][col];
      if (colValue !== 0) usedInCol.add(colValue);
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        const v = userGrid[r][c];
        if (v !== 0) usedInBox.add(v);
      }
    }

    const usedAll = new Set([...usedInRow, ...usedInCol, ...usedInBox]);
    const candidates = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => !usedAll.has(n));
    const value = puzzleData.solution[row][col];

    return {
      row,
      col,
      usedInRow: [...usedInRow].sort((a, b) => a - b),
      usedInCol: [...usedInCol].sort((a, b) => a - b),
      usedInBox: [...usedInBox].sort((a, b) => a - b),
      candidates,
      value
    };
  }, [puzzleData, userGrid]);

  // Retour à l'écran de sélection de difficulté, sans générer de nouvelle grille.
  const resetToMenu = useCallback(() => {
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    setDifficulty(null);
    setPuzzleData(null);
    setUserGrid(null);
    setWatermark(null);
    setIsComplete(false);
    setRewardImage(null);
    setErrorCells(new Set());
    setErrorCount(0);
    setElapsedSeconds(0);
    setNotesMode(false);
    setNotesGrid(buildEmptyNotes());
    setHistory([]);
    setCelebrate(null);
  }, []);

  return {
    season,
    difficulty,
    puzzleData,
    userGrid,
    watermark,
    watermarkVisible,
    imageIntensity,
    setImageIntensity,
    isComplete,
    rewardImage,
    errorCells,
    errorCount,
    elapsedSeconds,
    notesMode,
    notesGrid,
    celebrate,
    revealProgress,
    canUndo,
    startNewGame,
    resetToMenu,
    setCellValue,
    undo,
    getHint,
    isCellRevealed,
    toggleNotesMode,
    toggleWatermark
  };
}