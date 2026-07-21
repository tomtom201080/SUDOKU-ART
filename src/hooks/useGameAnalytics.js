// src/hooks/useGameAnalytics.js
// Observe l'état renvoyé par useGame() et déclenche les événements de
// tracking correspondants, chacun garanti une seule fois par partie
// (refs internes, réinitialisées à chaque nouvelle tentative détectée).
//
// Volontairement séparé de useGame.js : ce hook n'observe que les valeurs
// déjà exposées par le jeu (aucune modification de la logique de jeu elle-
// même, à l'exception d'un seul champ additif : `moveCount` dans useGame.js).
import { useEffect, useRef } from 'react';
import {
  generateGameSessionId,
  startGameSession,
  updateGameSessionSnapshot,
  clearGameSession,
  trackGameStarted,
  trackFirstMove,
  trackGameProgress,
  trackMistakeMade,
  trackGameCompleted,
  trackRevealViewed,
  trackGameAbandoned
} from '../lib/tracking';

const PROGRESS_THRESHOLDS = [10, 25, 50, 75, 90];

export function useGameAnalytics(game, { language, contentType, puzzleId, isCustomGame }) {
  const sessionIdRef = useRef(null);
  const prevPuzzleDataRef = useRef(null);
  const prevDifficultyRef = useRef(null);
  const firstMoveFiredRef = useRef(false);
  const completedFiredRef = useRef(false);
  const thresholdsFiredRef = useRef(new Set());
  const pendingAbandonReasonRef = useRef(null);

  // Permet à App.jsx de préciser la raison d'un abandon explicite (retour
  // menu, etc.) juste avant de déclencher la transition d'état correspondante.
  function reportPendingAbandonReason(reason) {
    pendingAbandonReasonRef.current = reason;
  }

  useEffect(() => {
    const puzzleChanged = game.puzzleData && game.puzzleData !== prevPuzzleDataRef.current;

    // Une partie précédente était active et n'a pas été marquée comme
    // terminée : c'est un abandon (nouvelle partie enchaînée sans finir,
    // ou tout autre cas non couvert explicitement par App.jsx).
    if (puzzleChanged && prevPuzzleDataRef.current && sessionIdRef.current && !completedFiredRef.current) {
      trackGameAbandoned(sessionIdRef.current, pendingAbandonReasonRef.current ?? 'new_game');
    }

    // Retour au menu (difficulty redevient null) sans être passé par une
    // victoire : abandon explicite (menu / quitter la partie).
    if (!game.difficulty && prevDifficultyRef.current && sessionIdRef.current && !completedFiredRef.current) {
      trackGameAbandoned(sessionIdRef.current, pendingAbandonReasonRef.current ?? 'navigation');
    }

    if (puzzleChanged) {
      const sessionId = generateGameSessionId();
      sessionIdRef.current = sessionId;
      firstMoveFiredRef.current = false;
      completedFiredRef.current = false;
      thresholdsFiredRef.current = new Set();
      pendingAbandonReasonRef.current = null;

      startGameSession({ sessionId, difficulty: game.difficulty, contentType, puzzleId });
      trackGameStarted({ difficulty: game.difficulty, contentType, puzzleId, language, isCustomGame });
    }

    if (!game.difficulty) {
      sessionIdRef.current = null;
    }

    prevPuzzleDataRef.current = game.puzzleData;
    prevDifficultyRef.current = game.difficulty;
  }, [game.puzzleData, game.difficulty, contentType, puzzleId, language, isCustomGame]);

  // Premier coup joué (moveCount 0 -> >0).
  useEffect(() => {
    if (!sessionIdRef.current) return;
    if (game.moveCount > 0 && !firstMoveFiredRef.current) {
      firstMoveFiredRef.current = true;
      trackFirstMove({ difficulty: game.difficulty, elapsedSeconds: game.elapsedSeconds, inputMethod: 'number_pad' });
    }
  }, [game.moveCount]);

  // Erreurs : chaque incrément d'errorCount est une nouvelle erreur.
  const prevErrorCountRef = useRef(0);
  useEffect(() => {
    if (!sessionIdRef.current) return;
    if (game.errorCount > prevErrorCountRef.current) {
      trackMistakeMade({
        mistakeNumber: game.errorCount,
        elapsedSeconds: game.elapsedSeconds,
        difficulty: game.difficulty,
        progressPercent: Math.floor(game.revealProgress * 100)
      });
      updateGameSessionSnapshot({ mistakeCount: game.errorCount, lastActionType: 'cell_input' });
    }
    prevErrorCountRef.current = game.errorCount;
  }, [game.errorCount]);

  // Seuils de progression (10/25/50/75/90 %), chacun une seule fois.
  useEffect(() => {
    if (!sessionIdRef.current) return;
    const percent = Math.floor(game.revealProgress * 100);
    for (const threshold of PROGRESS_THRESHOLDS) {
      if (percent >= threshold && !thresholdsFiredRef.current.has(threshold)) {
        thresholdsFiredRef.current.add(threshold);
        trackGameProgress({
          progressPercent: threshold,
          elapsedSeconds: game.elapsedSeconds,
          difficulty: game.difficulty,
          mistakeCount: game.errorCount,
          hintCount: game.hintsUsed,
          puzzleId,
          contentType
        });
      }
    }
    updateGameSessionSnapshot({ progressPercent: percent, elapsedSeconds: game.elapsedSeconds, hintCount: game.hintsUsed });
  }, [game.revealProgress]);

  // Fin de partie + révélation complète (même instant : la grille correcte
  // implique que toutes les cases sont révélées, cf. useGame.js).
  useEffect(() => {
    if (!sessionIdRef.current) return;
    if (game.isComplete && !completedFiredRef.current) {
      completedFiredRef.current = true;
      const imageFullyRevealed = game.revealProgress >= 1;
      trackGameCompleted({
        completionTimeSeconds: game.elapsedSeconds,
        difficulty: game.difficulty,
        mistakeCount: game.errorCount,
        hintCount: game.hintsUsed,
        puzzleId,
        contentType,
        language,
        wasResumed: false,
        imageFullyRevealed
      });
      trackRevealViewed({ contentType, puzzleId, difficulty: game.difficulty, completionTimeSeconds: game.elapsedSeconds });
      clearGameSession(sessionIdRef.current);
    }
  }, [game.isComplete]);

  return { reportPendingAbandonReason };
}
