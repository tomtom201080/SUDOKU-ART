// src/hooks/useGame.js
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { generateSudoku, isGridComplete, DIFFICULTIES } from '../sudoku/generator';
import { resolveImagePath, resolveImagePathLow, listAllImages, pickImageForTier, pickRewardImage, TIERS_BY_DIFFICULTY } from '../data/imageLibrary';
import { addToGallery, recordWin } from '../utils/storage';
import { markChallengeCompleted, deleteChallenge } from '../lib/challenges';
import { markPaintingSeen, getMergedUnseenIds } from '../lib/seenPaintings';
import { logGameStart, logGameComplete, logGameFail } from '../lib/analytics';
import { submitRematchResult, submitGroupResult, determineRematchWinner } from '../lib/rematches';
import { trackGameError, normalizeErrorCode } from '../lib/tracking';

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

export function useGame(manifest, userId = null, { onMaxErrorsReached, username } = {}) {
  const [difficulty, setDifficulty] = useState(null);
  const [puzzleData, setPuzzleData] = useState(null); // { puzzle, solution, givenMask }
  const [userGrid, setUserGrid] = useState(null);
  const [watermark, setWatermark] = useState(null);
  const [watermarkVisible, setWatermarkVisible] = useState(true);
  const INTENSITY_KEY = 'sudoku-devoile:imageIntensity';
  const [imageIntensity, setImageIntensityState] = useState(() => {
    try {
      const stored = localStorage.getItem(INTENSITY_KEY);
      return stored !== null ? parseFloat(stored) : 0.28;
    } catch { return 0.28; }
  });
  const setImageIntensity = (v) => {
    setImageIntensityState(v);
    try { localStorage.setItem(INTENSITY_KEY, String(v)); } catch {}
  };
  const [isComplete, setIsComplete] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [rewardImage, setRewardImage] = useState(null);
  const [errorCells, setErrorCells] = useState(() => new Set());
  const [errorCount, setErrorCount] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [notesMode, setNotesMode] = useState(false);
  const [notesGrid, setNotesGrid] = useState(() => buildEmptyNotes());
  const [history, setHistory] = useState([]);
  const [celebrate, setCelebrate] = useState([]); // [{ type: 'box'|'row'|'col', index }]
  const [challengeMeta, setChallengeMeta] = useState(null); // { id, maxErrors, timeLimitSeconds }
  const [nextWatermark, setNextWatermark] = useState(null); // filigrane préchargé en avance, pour un "New game" immédiat
  const [tempFullReveal, setTempFullReveal] = useState(false); // affichage complet temporaire après une zone complétée
  const [activeRematch, setActiveRematch] = useState(null); // { id, challengerName, challengerErrors, challengerSeconds }
  const [rematchOutcome, setRematchOutcome] = useState(null); // résultat comparé, une fois la partie terminée
  const [activeQuestStage, setActiveQuestStage] = useState(null); // étape de la quête en cours, le cas échéant
  const [activeMathQuestStage, setActiveMathQuestStage] = useState(null); // étape Sudomath en cours, le cas échéant

  const timerIdRef = useRef(null);
  const celebrateTimeoutRef = useRef(null);
  const winRevealTimeoutRef = useRef(null);
  const tempRevealTimeoutRef = useRef(null);


  // challengeOptions (optionnel) : { id, maxErrors, timeLimitMinutes } quand
  // la partie est un défi reçu d'un ami, avec des contraintes à respecter.
  // preloadedImage (optionnel) : image déjà choisie et mise en cache par le
  // navigateur en avance (sur l'écran d'accueil, ou pendant la partie
  // précédente). C'est cette même image qui sert de filigrane pendant la
  // partie ET de récompense affichée à la victoire — un seul tirage, plus de
  // décalage possible entre les deux.
  const startNewGame = useCallback((chosenDifficulty, customImageUrl = null, challengeOptions = null, preloadedImage = null) => {
    const actualDifficulty =
      chosenDifficulty === 'auto'
        ? DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)]
        : chosenDifficulty;

    const data = generateSudoku(actualDifficulty);
    const initialUserGrid = buildInitialUserGrid(data.puzzle);
    const image = customImageUrl
      ? { id: `custom-${Date.now()}`, path: customImageUrl, tier: null, isCustom: true }
      : preloadedImage; // si absent, l'effet de repli ci-dessous s'en occupera

    setDifficulty(actualDifficulty);
    setPuzzleData(data);
    setUserGrid(initialUserGrid);
    setWatermark(image);
    setWatermarkVisible(true);
    setIsComplete(false);
    setShowWinModal(false);
    if (winRevealTimeoutRef.current) {
      clearTimeout(winRevealTimeoutRef.current);
      winRevealTimeoutRef.current = null;
    }
    setIsFailed(false);
    setRewardImage(null);
    setNextWatermark(null);
    setActiveRematch(null);
    setRematchOutcome(null);
    setActiveQuestStage(null);
    setActiveMathQuestStage(null);
    setTempFullReveal(false);
    if (tempRevealTimeoutRef.current) {
      clearTimeout(tempRevealTimeoutRef.current);
      tempRevealTimeoutRef.current = null;
    }
    setErrorCells(new Set());
    setErrorCount(0);
    setHintsUsed(0);
    setElapsedSeconds(0);
    setNotesMode(false);
    setNotesGrid(buildEmptyNotes());
    setHistory([]);
    setCelebrate([]);
    setChallengeMeta(
      challengeOptions
        ? {
            id: challengeOptions.id,
            maxErrors: challengeOptions.maxErrors ?? null,
            timeLimitSeconds: challengeOptions.timeLimitMinutes
              ? challengeOptions.timeLimitMinutes * 60
              : null,
            photoPath: challengeOptions.photoPath ?? null,
            senderEmail: challengeOptions.senderEmail ?? null
          }
        : null
    );

    logGameStart({
      difficulty: actualDifficulty,
      userId,
      isCustomPhoto: !!customImageUrl,
      isChallenge: !!challengeOptions
    });
  }, [manifest, userId]);

  // Démarre une partie à partir d'une grille déjà déterminée (reçue via un
  // défi "même grille") : on ne génère rien, on rejoue exactement le même
  // puzzle que le challenger, pour pouvoir comparer les résultats à la fin.
  const startRematchGame = useCallback((rematch, photoUrl, localPuzzleData = null, playerPseudo = null) => {
    try {
      // On privilégie le puzzleData local (passé depuis DefiComposer) pour éviter
      // tout problème de parsing depuis Supabase (JSONB vs string).
      let puzzle, solution;
      if (localPuzzleData) {
        puzzle   = localPuzzleData.puzzle;
        solution = localPuzzleData.solution;
      } else {
        // Fallback : depuis la DB — supporte JSON string et objet JSONB
        puzzle   = typeof rematch.puzzle   === 'string' ? JSON.parse(rematch.puzzle)   : rematch.puzzle;
        solution = typeof rematch.solution === 'string' ? JSON.parse(rematch.solution) : rematch.solution;
      }

      if (!puzzle || !solution) throw new Error('Puzzle invalide');

      const givenMask = puzzle.map(row => row.map(v => v !== 0));
      const image = photoUrl
        ? { id: `rematch-${rematch.id}`, path: photoUrl, pathLow: photoUrl, tier: null, isCustom: true }
        : null;

      setDifficulty(rematch.difficulty);
      setPuzzleData({ puzzle, solution, givenMask });
      setUserGrid(buildInitialUserGrid(puzzle));
      setWatermark(image);
      setWatermarkVisible(true);
      // Défi envoyé en mode "sudoku classique" (aucune image, ni photo perso
      // ni œuvre d'art) : on réutilise le même mécanisme que le mode
      // classique solo (imageIntensity à 0), sans toucher au tirage
      // automatique d'image de repli qui reste inoffensif tant qu'il n'est
      // pas affiché. On modifie uniquement l'état de CETTE partie, sans
      // écraser la préférence d'intensité globale de l'utilisateur (au
      // contraire de setImageIntensity(), qui la persiste en localStorage).
      if (rematch.classic_mode) {
        setImageIntensityState(0);
      }
      setIsComplete(false);
      setShowWinModal(false);
      if (winRevealTimeoutRef.current) { clearTimeout(winRevealTimeoutRef.current); winRevealTimeoutRef.current = null; }
      setIsFailed(false);
      setRewardImage(null);
      setNextWatermark(null);
      setTempFullReveal(false);
      if (tempRevealTimeoutRef.current) { clearTimeout(tempRevealTimeoutRef.current); tempRevealTimeoutRef.current = null; }
      setErrorCells(new Set());
      setErrorCount(0);
      setHintsUsed(0);
      setElapsedSeconds(0);
      setNotesMode(false);
      setNotesGrid(buildEmptyNotes());
      setHistory([]);
      setCelebrate([]);
      setChallengeMeta(null);
      setActiveRematch({
        id: rematch.id,
        challengerName: rematch.challenger_name,
        challengerErrors: rematch.challenger_result_errors,
        challengerSeconds: rematch.challenger_result_seconds,
        challengerHasAccount: !!rematch.challenger_user_id,
        hintsLimit: rematch.hints_limit ?? null,
        groupMode: rematch.group_mode ?? false,
        playerPseudo: playerPseudo ?? null });
      setRematchOutcome(null);

      logGameStart({ difficulty: rematch.difficulty, userId, isCustomPhoto: !!photoUrl, isChallenge: true });
    } catch (err) {
      console.error('startRematchGame error:', err);
      // En cas d'erreur, on reste sur l'accueil plutôt que de planter
    }
  }, [userId]);

  // Lance une étape précise du parcours de quête : la difficulté et le
  // tableau à révéler sont imposés par l'étape (pas de tirage au hasard).
  const startQuestStage = useCallback((stage) => {
    const data = generateSudoku(stage.difficulty);
    const initialUserGrid = buildInitialUserGrid(data.puzzle);

    const painting = stage.painting;
    const image = {
      id: painting.id,
      tier: painting.tier,
      path: resolveImagePath(painting.tier, painting, painting.id),
      title: painting.title,
      artist: painting.artist,
      year: painting.year,
      style: painting.style,
      museum: painting.museum,
      city: painting.city,
      country: painting.country,
      technique: painting.technique,
      funFact: painting.funFact,
      observe: painting.observe
    };

    setDifficulty(stage.difficulty);
    setPuzzleData(data);
    setUserGrid(initialUserGrid);
    setWatermark(image);
    setWatermarkVisible(true);
    setIsComplete(false);
    setShowWinModal(false);
    if (winRevealTimeoutRef.current) {
      clearTimeout(winRevealTimeoutRef.current);
      winRevealTimeoutRef.current = null;
    }
    setIsFailed(false);
    setRewardImage(null);
    setNextWatermark(null);
    setTempFullReveal(false);
    if (tempRevealTimeoutRef.current) {
      clearTimeout(tempRevealTimeoutRef.current);
      tempRevealTimeoutRef.current = null;
    }
    setErrorCells(new Set());
    setErrorCount(0);
    setHintsUsed(0);
    setElapsedSeconds(0);
    setNotesMode(false);
    setNotesGrid(buildEmptyNotes());
    setHistory([]);
    setCelebrate([]);
    setChallengeMeta(null);
    setActiveRematch(null);
    setRematchOutcome(null);
    setActiveQuestStage(null);
    setActiveMathQuestStage(null);
    setActiveQuestStage(stage);

    logGameStart({ difficulty: stage.difficulty, userId, isCustomPhoto: false, isChallenge: false });
  }, [userId]);

  // Lance une étape précise du parcours Sudomath : la difficulté et la
  // trouvaille de Léonard de Vinci à révéler sont imposées par l'étape.
  // Contrairement à la quête Sudokart, terminer la grille ne suffit pas :
  // il faudra ensuite répondre correctement à l'énigme (via submitMathAnswer)
  // pour que l'étape soit vraiment validée.
  const startMathQuestStage = useCallback((stage) => {
    const data = generateSudoku(stage.difficulty);
    const initialUserGrid = buildInitialUserGrid(data.puzzle);

    const finding = stage.finding;
    const image = {
      id: finding.id,
      tier: 'davinci',
      path: resolveImagePath('davinci', finding, finding.id),
      title: finding.title,
      artist: 'Léonard de Vinci',
      year: finding.year,
      style: finding.category,
      museum: null,
      funFact: finding.description
    };

    setDifficulty(stage.difficulty);
    setPuzzleData(data);
    setUserGrid(initialUserGrid);
    setWatermark(image);
    setWatermarkVisible(true);
    setIsComplete(false);
    setShowWinModal(false);
    if (winRevealTimeoutRef.current) {
      clearTimeout(winRevealTimeoutRef.current);
      winRevealTimeoutRef.current = null;
    }
    setIsFailed(false);
    setRewardImage(null);
    setNextWatermark(null);
    setTempFullReveal(false);
    if (tempRevealTimeoutRef.current) {
      clearTimeout(tempRevealTimeoutRef.current);
      tempRevealTimeoutRef.current = null;
    }
    setErrorCells(new Set());
    setErrorCount(0);
    setHintsUsed(0);
    setElapsedSeconds(0);
    setNotesMode(false);
    setNotesGrid(buildEmptyNotes());
    setHistory([]);
    setCelebrate([]);
    setChallengeMeta(null);
    setActiveRematch(null);
    setRematchOutcome(null);
    setActiveQuestStage(null);
    setActiveMathQuestStage(null);
    setActiveMathQuestStage(stage);

    logGameStart({ difficulty: stage.difficulty, userId, isCustomPhoto: false, isChallenge: false });
  }, [userId]);

  // Vérifie la réponse donnée à l'énigme de l'étape Sudomath en cours. Ne
  // valide réellement l'étape (en base) que si la réponse est correcte.
  const submitMathAnswer = useCallback((answer) => {
    if (!activeMathQuestStage) return false;
    if (!activeMathQuestStage) return false;
    const correct = false; // QUEST_DISABLED
    if (correct && userId) {
      // QUEST_DISABLED: markMathStageCompleted
    }
    return correct;
  }, [activeMathQuestStage, userId]);

  // Chronomètre : actif uniquement pendant une partie en cours, et mis en
  // pause automatiquement si l'onglet/la page n'est plus visible (l'utilisateur
  // a changé d'application ou d'onglet). Si la partie est un défi avec une
  // limite de temps, on bascule en échec dès que le temps est écoulé.
  useEffect(() => {
    if (!difficulty || isComplete || isFailed) return;

    function startInterval() {
      if (timerIdRef.current) return;
      timerIdRef.current = setInterval(() => {
        setElapsedSeconds(s => {
          const next = s + 1;
          if (challengeMeta?.timeLimitSeconds && next >= challengeMeta.timeLimitSeconds) {
            setIsFailed(true);
            logGameFail({
              difficulty,
              userId,
              errorCount,
              elapsedSeconds: next,
              isChallenge: !!challengeMeta?.id
            });
            if (challengeMeta.id) {
              markChallengeCompleted(challengeMeta.id, 'lost');
              deleteChallenge(challengeMeta.id, challengeMeta.photoPath);
            }
          }
          return next;
        });
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
  }, [difficulty, isComplete, isFailed, challengeMeta, userId]);

  // Le joueur saisit une valeur (1-9) ou l'efface (0) dans une case.
  // En mode notes, la saisie ajoute/retire un chiffre "candidat" sans toucher
  // à la vraie valeur de la case, et ne compte jamais comme une erreur.
  // Filet de sécurité : si la partie démarre sans image préchargée (le
  // préchargement n'a pas eu le temps de se faire), on en tire une à la
  // volée pour la rareté en cours, en évitant les tableaux déjà vus.
  useEffect(() => {
    if (!difficulty || watermark || !manifest) return;
    let cancelled = false;

    getMergedUnseenIds(userId).then(unlockedIds => {
      if (cancelled) return;
      const fallback = pickRewardImage(manifest, difficulty, unlockedIds);
      if (fallback) setWatermark(fallback);
    });

    return () => {
      cancelled = true;
    };
  }, [difficulty, watermark, manifest, userId]);

  // Précharge, pendant la partie en cours, l'image qui servirait de filigrane
  // à une éventuelle partie suivante de même difficulté ("New game"
  // cliqué juste après la victoire) : comme ça, même un enchaînement
  // immédiat ne perd pas de temps à charger.
  useEffect(() => {
    if (!difficulty || !manifest || watermark?.isCustom || !watermark) return;
    let cancelled = false;
    const tier = TIERS_BY_DIFFICULTY[difficulty] ?? 'commune';

    getMergedUnseenIds(userId).then(unlockedIds => {
      if (cancelled) return;
      const excludeForNext = [...unlockedIds, watermark.id];
      const next = pickImageForTier(manifest, tier, excludeForNext);
      if (next) {
        setNextWatermark(next);
        new Image().src = next.path;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [difficulty, manifest, userId, watermark]);

  // forceValue : bypass le mode notes pour poser directement la vraie
  // valeur, quel que soit l'état de notesMode au moment de l'appel. Utilisé
  // par les indices (App.jsx) : notesMode est un état React, donc son
  // toggle est asynchrone — l'appeler juste avant setCellValue ne suffit
  // pas à garantir que la bonne branche sera prise dans le même tick.
  const setCellValue = useCallback((row, col, value, { forceValue = false } = {}) => {
    if (!puzzleData || !userGrid) return;
    if (isFailed) return; // défi déjà perdu, plus aucune saisie possible
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
    if (notesMode && !forceValue) {
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
      setErrorCount(c => {
        const nextCount = c + 1;
        const maxErr = challengeMeta?.maxErrors ?? 3; // 3 erreurs max par défaut
        if (nextCount >= maxErr) {
          // On signale au composant parent qu'on a atteint le max
          // sans déclencher isFailed directement : le popup pub décide
          onMaxErrorsReached?.();
        }
        return nextCount;
      });
    }

    const isCorrect = value !== 0 && value === puzzleData.solution[row][col];

    // On efface TOUJOURS les notes de la case qu'on vient de remplir, et si la valeur
    // posée est correcte, on retire ce chiffre des notes de toutes les cases
    // de la même ligne, colonne et carré (il n'est plus une supposition valide).
    setNotesGrid(prev => {
      const cloned = cloneNotes(prev);
      cloned[row][col] = Array(9).fill(false); // toujours vider la case cible
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

      const newCelebrations = [];
      if (boxNewlyComplete) newCelebrations.push({ type: 'box', index: box });
      if (rowNewlyComplete) newCelebrations.push({ type: 'row', index: row });
      if (colNewlyComplete) newCelebrations.push({ type: 'col', index: col });

      if (newCelebrations.length > 0) {
        setCelebrate(newCelebrations);
        if (celebrateTimeoutRef.current) clearTimeout(celebrateTimeoutRef.current);
        celebrateTimeoutRef.current = setTimeout(() => setCelebrate([]), 1200);

        // On affiche la grille complète, sans surlignage qui cacherait
        // l'image, pendant 2 secondes — pour que la nouvelle portion révélée
        // soit vraiment visible même si le joueur reste sur la même case.
        // Inutile (et même perturbant) si le filigrane est désactivé : dans
        // ce cas, on garde juste les étincelles, sans toucher au surlignage.
        if (imageIntensity > 0) {
          setTempFullReveal(true);
          if (tempRevealTimeoutRef.current) clearTimeout(tempRevealTimeoutRef.current);
          tempRevealTimeoutRef.current = setTimeout(() => setTempFullReveal(false), 2000);
        }
      }
    }

    if (value !== 0 && isGridComplete(next, puzzleData.solution)) {
      setIsComplete(true);
      recordWin(difficulty);
      logGameComplete({
        difficulty,
        userId,
        errorCount,
        elapsedSeconds,
        isCustomPhoto: !!watermark?.isCustom,
        isChallenge: !!challengeMeta?.id
      });
      if (challengeMeta?.id) {
        markChallengeCompleted(challengeMeta.id, 'won');
        deleteChallenge(challengeMeta.id, challengeMeta.photoPath);
      }
      if (watermark && !watermark.isCustom) {
        addToGallery(watermark, { difficulty });
        setRewardImage(watermark);
        if (userId) markPaintingSeen(userId, watermark.id).catch(() => null);
        // La popup de victoire s'ouvre 3 secondes après — on profite de ce
        // délai pour précharger la version HD (path) dans le cache navigateur,
        // afin qu'elle s'affiche immédiatement sans à-coup à l'ouverture.
        if (watermark.pathLow && watermark.path !== watermark.pathLow) {
          const hdImg = new Image();
          hdImg.src = watermark.path;
        }
      }

      if (activeRematch?.id) {
        const finalElapsed = elapsedSeconds;
        const isGroupMode = activeRematch.groupMode;

        if (isGroupMode) {
          // Mode groupe : on stocke dans rematch_results avec le pseudo du joueur
          submitGroupResult(activeRematch.id, {
            errors: errorCount,
            seconds: finalElapsed,
            hints: hintsUsed,
            userId: userId ?? null,
            playerName: activeRematch.playerPseudo ?? username ?? 'Anonyme' }).catch(err => {
              // Ne jamais bloquer l'écran de victoire sur cette écriture,
              // mais ne plus l'avaler en silence non plus (un rejet RLS ici
              // laisserait croire à tort que la partie a été enregistrée).
              console.error('submitGroupResult failed:', err);
              trackGameError({ errorType: 'rematch_result_submit_failed', errorLocation: 'useGame.submitGroupResult', errorCode: normalizeErrorCode(err), fatal: false, gameInProgress: false });
            });
        } else {
          // Mode perso 1v1
          submitRematchResult(activeRematch.id, {
            errors: errorCount,
            seconds: finalElapsed,
            hints: hintsUsed,
            userId
          }).catch(err => {
            console.error('submitRematchResult failed:', err);
            trackGameError({ errorType: 'rematch_result_submit_failed', errorLocation: 'useGame.submitRematchResult', errorCode: normalizeErrorCode(err), fatal: false, gameInProgress: false });
          });

          const winner = determineRematchWinner({
            challengerErrors: activeRematch.challengerErrors,
            challengerSeconds: activeRematch.challengerSeconds,
            challengerHints: activeRematch.challengerHints ?? 0,
            recipientErrors: errorCount,
            recipientSeconds: finalElapsed,
            recipientHints: hintsUsed });

          setRematchOutcome({
            challengerName: activeRematch.challengerName,
            challengerErrors: activeRematch.challengerErrors,
            challengerSeconds: activeRematch.challengerSeconds,
            challengerHints: activeRematch.challengerHints ?? 0,
            challengerHasAccount: activeRematch.challengerHasAccount,
            recipientErrors: errorCount,
            recipientSeconds: finalElapsed,
            recipientHints: hintsUsed,
            winner
          });
        }
      }

      if (activeQuestStage && userId) {
        // QUEST_DISABLED: markStageCompleted
      }

      // Étoiles sur toute la grille, puis on laisse admirer la photo complète
      // pendant 3 secondes avant d'afficher la popup de victoire.
      setCelebrate([{ type: 'all', index: 0 }]);
      if (celebrateTimeoutRef.current) clearTimeout(celebrateTimeoutRef.current);
      celebrateTimeoutRef.current = setTimeout(() => setCelebrate([]), 3000);
      if (winRevealTimeoutRef.current) clearTimeout(winRevealTimeoutRef.current);
      winRevealTimeoutRef.current = setTimeout(() => setShowWinModal(true), 3000);
    }
  }, [puzzleData, userGrid, notesGrid, errorCells, errorCount, difficulty, notesMode, isFailed, challengeMeta, watermark, userId, imageIntensity, elapsedSeconds, activeRematch, activeQuestStage]);

  // Annule le dernier coup joué (grille + notes + erreurs reviennent à l'état
  // précédent). Le compteur d'erreurs cumulé n'est lui jamais "annulé" : une
  // erreur déjà commise reste comptée dans les statistiques de la partie.
  // Réservé aux tests : complète instantanément la grille avec la solution,
  // et déclenche la même séquence de victoire qu'une vraie résolution.
  const solveGridForTesting = useCallback(() => {
    if (!puzzleData) return;

    setUserGrid(cloneGrid(puzzleData.solution));
    setErrorCells(new Set());
    setIsComplete(true);
    recordWin(difficulty);

    if (challengeMeta?.id) {
      markChallengeCompleted(challengeMeta.id, 'won');
      deleteChallenge(challengeMeta.id, challengeMeta.photoPath);
    }

    if (watermark && !watermark.isCustom) {
      addToGallery(watermark, { difficulty });
      setRewardImage(watermark);
      if (userId) markPaintingSeen(userId, watermark.id).catch(() => null);
      if (watermark.pathLow && watermark.path !== watermark.pathLow) {
        const hdImg = new Image();
        hdImg.src = watermark.path;
      }
    }
    if (celebrateTimeoutRef.current) clearTimeout(celebrateTimeoutRef.current);
    celebrateTimeoutRef.current = setTimeout(() => setCelebrate([]), 3000);
    if (winRevealTimeoutRef.current) clearTimeout(winRevealTimeoutRef.current);
    winRevealTimeoutRef.current = setTimeout(() => setShowWinModal(true), 3000);
  }, [puzzleData, difficulty, challengeMeta, watermark, userId]);

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

  // Ferme la popup de victoire sans réinitialiser la partie : la grille
  // reste affichée, avec la photo entièrement révélée derrière.
  const dismissWinModal = useCallback(() => {
    setShowWinModal(false);
  }, []);

  // Un chiffre est "entièrement découvert" quand ses 9 occurrences sont
  // correctement placées dans la grille (données ou trouvées par le joueur).
  // On le retire alors du pavé numérique, comme dans un sudoku classique.
  const completedDigits = useMemo(() => {
    const completed = new Set();
    if (!puzzleData || !userGrid) return completed;

    const counts = Array(10).fill(0);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const solutionValue = puzzleData.solution[r][c];
        if (userGrid[r][c] === solutionValue) counts[solutionValue]++;
      }
    }
    for (let d = 1; d <= 9; d++) {
      if (counts[d] === 9) completed.add(d);
    }
    return completed;
  }, [puzzleData, userGrid]);

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

  // Construit les 27 "unités" de la grille (9 lignes, 9 colonnes, 9 carrés),
  // chacune sous forme de liste de 9 positions {row, col}.
  function buildUnits() {
    const units = [];
    for (let r = 0; r < 9; r++) {
      units.push(Array.from({ length: 9 }, (_, c) => ({ row: r, col: c })));
    }
    for (let c = 0; c < 9; c++) {
      units.push(Array.from({ length: 9 }, (_, r) => ({ row: r, col: c })));
    }
    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 3; bc++) {
        const cells = [];
        for (let r = br * 3; r < br * 3 + 3; r++) {
          for (let c = bc * 3; c < bc * 3 + 3; c++) cells.push({ row: r, col: c });
        }
        units.push(cells);
      }
    }
    return units;
  }

  // Cherche un vrai indice exploitable sur TOUTE la grille (plus besoin de
  // sélectionner une case précise) :
  // - en priorité, une case où un seul chiffre est encore possible par
  //   simple élimination ligne/colonne/carré (déduction 100% certaine) ;
  // - à défaut, une piste de "repli" : un chiffre qui ne peut se placer que
  //   sur deux cases au sein d'une même ligne, colonne ou carré (pas une
  //   certitude totale, mais une vraie information exploitable) ;
  // - sinon, on l'indique clairement : aucun indice direct disponible.
  // Indice simplifié : choisit une case vide au hasard et révèle son chiffre.
  // Le choix est aléatoire pour garder la surprise, et la case est mise en
  // évidence sur la grille (via hintTargetCell dans App.jsx).
  const getHint = useCallback(() => {
    if (!puzzleData || !userGrid) return null;

    const emptyCells = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (userGrid[r][c] === 0) {
          emptyCells.push({ row: r, col: c, value: puzzleData.solution[r][c] });
        }
      }
    }

    if (emptyCells.length === 0) return null;

    const pick = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    return { certainty: 'certain', ...pick };
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
    setShowWinModal(false);
    if (winRevealTimeoutRef.current) {
      clearTimeout(winRevealTimeoutRef.current);
      winRevealTimeoutRef.current = null;
    }
    setIsFailed(false);
    setRewardImage(null);
    setNextWatermark(null);
    setActiveRematch(null);
    setRematchOutcome(null);
    setActiveQuestStage(null);
    setActiveMathQuestStage(null);
    setTempFullReveal(false);
    if (tempRevealTimeoutRef.current) {
      clearTimeout(tempRevealTimeoutRef.current);
      tempRevealTimeoutRef.current = null;
    }
    setErrorCells(new Set());
    setErrorCount(0);
    setHintsUsed(0);
    setElapsedSeconds(0);
    setNotesMode(false);
    setNotesGrid(buildEmptyNotes());
    setHistory([]);
    setCelebrate([]);
    setChallengeMeta(null);
  }, []);

  return {
    difficulty,
    puzzleData,
    userGrid,
    watermark,
    watermarkVisible,
    imageIntensity,
    setImageIntensity,
    isComplete,
    showWinModal,
    isFailed,
    challengeMeta,
    completedDigits,
    rewardImage,
    nextWatermark,
    errorCells,
    errorCount,
    hintsUsed,
    setHintsUsed,
    moveCount: history.length,
    triggerFail: () => {
      setIsFailed(true);
      logGameFail({ difficulty, userId, errorCount, elapsedSeconds, isChallenge: false });
    },
    resetErrorCount: (n) => setErrorCount(n),
    elapsedSeconds,
    notesMode,
    notesGrid,
    celebrate,
    tempFullReveal,
    revealProgress,
    canUndo,
    startNewGame,
    startRematchGame,
    startQuestStage,
    activeQuestStage,
    startMathQuestStage,
    activeMathQuestStage,
    submitMathAnswer,
    activeRematch,
    rematchOutcome,
    resetToMenu,
    setCellValue,
    undo,
    solveGridForTesting,
    getHint,
    isCellRevealed,
    toggleNotesMode,
    toggleWatermark,
    dismissWinModal
  };
}
