// src/App.jsx
import { useEffect, useState, useCallback, useRef } from 'react';
import DifficultySelector from './components/DifficultySelector';
import SudokuBoard from './components/SudokuBoard';
import NumberPad from './components/NumberPad';
import Gallery from './components/Gallery';
import WinModal from './components/WinModal';
import ChallengeFailModal from './components/ChallengeFailModal';
import HintModal from './components/HintModal';
import AuthScreen from './components/AuthScreen';
import ChallengeComposer from './components/ChallengeComposer';
import UpdatePasswordScreen from './components/UpdatePasswordScreen';
import InstallAppModal from './components/InstallAppModal';
import { useGame } from './hooks/useGame';
import { loadManifest } from './data/imageLibrary';
import { getUnlockedGallery } from './utils/storage';
import { supabase } from './lib/supabaseClient';
import { getSharedPhotoPublicUrl } from './lib/sharedPhoto';
import {
  readChallengeIdFromUrl,
  clearChallengeFromUrl,
  fetchChallenge,
  claimChallenge
} from './lib/challenges';

const DARK_MODE_KEY = 'sudoku-devoile:darkMode';

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function App() {
  const [manifest, setManifest] = useState(null);
  const [manifestLoading, setManifestLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);
  const [highlightValue, setHighlightValue] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryData, setGalleryData] = useState([]);
  const [lastCustomImage, setLastCustomImage] = useState(null);
  const [lastChallengeMeta, setLastChallengeMeta] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem(DARK_MODE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const boardRef = useRef(null);
  const padRef = useRef(null);
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  // Écran de connexion affiché uniquement quand on en a explicitement besoin
  // (envoyer un défi), jamais comme un mur d'entrée obligatoire.
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Défi reçu par lien : on le charge directement, sans exiger de connexion.
  const [incomingChallengeId] = useState(() => readChallengeIdFromUrl());
  const [incomingChallengeHandled, setIncomingChallengeHandled] = useState(false);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => {
        setSession(data.session);
        setSessionLoading(false);
      })
      .catch(() => {
        setSession(null);
        setSessionLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    loadManifest().then(data => {
      setManifest(data);
      setManifestLoading(false);
    });
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    try {
      localStorage.setItem(DARK_MODE_KEY, String(darkMode));
    } catch {
      // stockage indisponible, on ignore simplement la persistance
    }
  }, [darkMode]);

  // Si on vient de se connecter (ou de créer un compte) pour envoyer un défi,
  // on ouvre automatiquement le composeur juste après.
  useEffect(() => {
    if (session && showAuthScreen) {
      setShowAuthScreen(false);
      setShowComposer(true);
    }
  }, [session, showAuthScreen]);

  const game = useGame(manifest);

  const handleOpenGallery = useCallback(() => {
    setGalleryData(getUnlockedGallery());
    setShowGallery(true);
  }, []);

  const handleSelectDifficulty = (difficultyId, customImageUrl) => {
    setLastCustomImage(customImageUrl || null);
    setLastChallengeMeta(null);
    game.startNewGame(difficultyId, customImageUrl);
  };

  const handlePlayChallenge = useCallback((challenge) => {
    const photoUrl = getSharedPhotoPublicUrl(challenge.photo_path);
    const challengeOptions = {
      id: challenge.id,
      maxErrors: challenge.max_errors,
      timeLimitMinutes: challenge.time_limit_minutes,
      photoPath: challenge.photo_path,
      senderEmail: challenge.sender_email
    };
    setLastCustomImage(photoUrl);
    setLastChallengeMeta(challengeOptions);
    game.startNewGame(challenge.difficulty_mode, photoUrl, challengeOptions);
  }, [game]);

  // Dès qu'un lien de défi est ouvert, on charge la photo et on lance la
  // partie directement sur la grille — aucune connexion requise pour jouer
  // un défi reçu.
  useEffect(() => {
    if (!incomingChallengeId || incomingChallengeHandled || manifestLoading) return;

    setIncomingChallengeHandled(true);
    clearChallengeFromUrl();

    fetchChallenge(incomingChallengeId)
      .then(challenge => {
        if (challenge && !challenge.completed) {
          handlePlayChallenge(challenge);
          // Si l'utilisateur est déjà connecté, on rattache le défi à son
          // compte (purement informatif, pas une condition pour jouer).
          if (session) claimChallenge(incomingChallengeId).catch(() => null);
        }
      })
      .catch(() => null);
  }, [incomingChallengeId, incomingChallengeHandled, manifestLoading, session, handlePlayChallenge]);

  const handleRequestSendChallenge = () => {
    if (session) {
      setShowComposer(true);
    } else {
      setShowAuthScreen(true);
    }
  };

  const handleSelectCell = (row, col) => {
    setSelectedCell({ row, col });
    const value = game.userGrid ? game.userGrid[row][col] : 0;
    setHighlightValue(value);
  };

  const handleInput = (value) => {
    if (!selectedCell) return;
    game.setCellValue(selectedCell.row, selectedCell.col, value);
  };

  const handleReplay = () => {
    game.startNewGame(game.difficulty, lastCustomImage, lastChallengeMeta);
    setSelectedCell(null);
    setHighlightValue(0);
  };

  const handleCloseGameEnd = () => {
    game.resetToMenu();
  };

  const handleHintFill = (row, col, value) => {
    game.setCellValue(row, col, value);
    setShowHint(false);
  };

  const currentHint = showHint && selectedCell
    ? game.getHint(selectedCell.row, selectedCell.col)
    : null;

  // Un clic en dehors de la grille (et du pavé numérique) désélectionne la
  // case en cours : ça désactive le surlignage et fait réapparaître l'image
  // en filigrane.
  useEffect(() => {
    if (!game.difficulty) return;

    function handlePointerDown(event) {
      const insideBoard = boardRef.current && boardRef.current.contains(event.target);
      const insidePad = padRef.current && padRef.current.contains(event.target);
      if (!insideBoard && !insidePad) {
        setSelectedCell(null);
        setHighlightValue(0);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [game.difficulty]);

  const darkModeButton = (
    <button
      className="icon-btn"
      onClick={() => setDarkMode(d => !d)}
      title={darkMode ? 'Mode clair' : 'Mode sombre'}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  );

  const accountButton = session ? (
    <button className="icon-btn" onClick={() => supabase.auth.signOut()} title="Déconnexion">🚪</button>
  ) : (
    <button className="icon-btn" onClick={() => setShowAuthScreen(true)} title="Se connecter">👤</button>
  );

  if (sessionLoading || manifestLoading) {
    return <div className="game-screen">Chargement…</div>;
  }

  if (isPasswordRecovery) {
    return <UpdatePasswordScreen onDone={() => setIsPasswordRecovery(false)} />;
  }

  if (showAuthScreen) {
    return <AuthScreen onCancel={() => setShowAuthScreen(false)} />;
  }

  if (!game.difficulty) {
    return (
      <>
        <header className="app-header">
          <img src="/favicon.svg" alt="Sudoku Art" className="app-logo" />
          <div className="header-actions">
            {darkModeButton}
            <button className="icon-btn" onClick={() => setShowInstallModal(true)} title="Installer l'app">📲</button>
            <button className="icon-btn" onClick={handleOpenGallery} title="Galerie">🖼</button>
            {accountButton}
          </div>
        </header>
        <DifficultySelector
          onSelect={handleSelectDifficulty}
          onRequestSendChallenge={handleRequestSendChallenge}
        />
        {showInstallModal && (
          <InstallAppModal onClose={() => setShowInstallModal(false)} />
        )}
        {showGallery && (
          <Gallery gallery={galleryData} onClose={() => setShowGallery(false)} />
        )}
        {showComposer && (
          <ChallengeComposer onClose={() => setShowComposer(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <header className="app-header">
        <img src="/favicon.svg" alt="Sudoku Art" className="app-logo" />
        <div className="header-actions">
          <span className="stat-pill" title="Temps de jeu (en pause hors de cet onglet)">
            ⏱ {formatTime(game.elapsedSeconds)}
            {game.challengeMeta?.timeLimitSeconds
              ? ` / ${formatTime(game.challengeMeta.timeLimitSeconds)}`
              : ''}
          </span>
          <span className="stat-pill" title="Nombre d'erreurs">
            ❌ {game.errorCount}
            {game.challengeMeta?.maxErrors != null ? ` / ${game.challengeMeta.maxErrors}` : ''}
          </span>
          {darkModeButton}
          <button
            className="icon-btn"
            onClick={game.toggleWatermark}
            title={game.watermarkVisible ? 'Masquer le filigrane' : 'Afficher le filigrane'}
          >
            {game.watermarkVisible ? '🙈' : '🙉'}
          </button>
          <button className="icon-btn" onClick={handleOpenGallery} title="Galerie">🖼</button>
          <button className="icon-btn" onClick={handleCloseGameEnd} title="Menu">↩</button>
        </div>
      </header>

      <div className="game-screen">
        <div className="intensity-control">
          <label htmlFor="image-intensity">🖼 Intensité du filigrane</label>
          <input
            id="image-intensity"
            type="range"
            min="0.05"
            max="0.5"
            step="0.05"
            value={game.imageIntensity}
            onChange={(e) => game.setImageIntensity(parseFloat(e.target.value))}
          />
        </div>

        <SudokuBoard
          ref={boardRef}
          puzzleData={game.puzzleData}
          userGrid={game.userGrid}
          watermark={game.watermark}
          watermarkVisible={game.watermarkVisible}
          imageIntensity={game.imageIntensity}
          notesGrid={game.notesGrid}
          errorCells={game.errorCells}
          isCellRevealed={game.isCellRevealed}
          selectedCell={selectedCell}
          highlightValue={highlightValue}
          celebrate={game.celebrate}
          isComplete={game.isComplete}
          onSelectCell={handleSelectCell}
        />

        <NumberPad
          ref={padRef}
          onInput={handleInput}
          disabled={game.isComplete || game.isFailed}
          notesMode={game.notesMode}
          onToggleNotes={game.toggleNotesMode}
          onUndo={game.undo}
          canUndo={game.canUndo}
          onHint={() => setShowHint(true)}
          completedDigits={game.completedDigits}
        />
      </div>

      {showHint && (
        <HintModal
          hint={currentHint}
          onFill={handleHintFill}
          onClose={() => setShowHint(false)}
        />
      )}

      {game.showWinModal && (
        <WinModal
          difficulty={game.difficulty}
          rewardImage={game.rewardImage}
          watermark={game.watermark}
          challengeMeta={game.challengeMeta}
          errorCount={game.errorCount}
          elapsedSeconds={game.elapsedSeconds}
          result="won"
          onReplay={handleReplay}
          onClose={game.dismissWinModal}
        />
      )}

      {game.isFailed && (
        <ChallengeFailModal
          difficulty={game.difficulty}
          challengeMeta={game.challengeMeta}
          errorCount={game.errorCount}
          elapsedSeconds={game.elapsedSeconds}
          onReplay={handleReplay}
          onClose={handleCloseGameEnd}
        />
      )}

      {showGallery && (
        <Gallery gallery={galleryData} onClose={() => setShowGallery(false)} />
      )}
    </>
  );
}
