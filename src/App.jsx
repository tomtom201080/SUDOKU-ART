// src/App.jsx
import { useEffect, useState, useCallback, useRef } from 'react';
import DifficultySelector from './components/DifficultySelector';
import SudokuBoard from './components/SudokuBoard';
import NumberPad from './components/NumberPad';
import Gallery from './components/Gallery';
import WinModal from './components/WinModal';
import HintModal from './components/HintModal';
import AuthScreen from './components/AuthScreen';
import UpdatePasswordScreen from './components/UpdatePasswordScreen';
import { useGame } from './hooks/useGame';
import { loadManifest } from './data/imageLibrary';
import { getUnlockedGallery } from './utils/storage';
import { supabase } from './lib/supabaseClient';
import { readSharedPhotoFromUrl, clearSharedPhotoFromUrl } from './lib/sharedPhoto';

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
  const [sharedPhoto, setSharedPhoto] = useState(null);

  useEffect(() => {
    const shared = readSharedPhotoFromUrl();
    if (shared) {
      setSharedPhoto(shared);
      clearSharedPhotoFromUrl();
    }
  }, []);

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

  const game = useGame(manifest);

  const handleOpenGallery = useCallback(() => {
    setGalleryData(getUnlockedGallery());
    setShowGallery(true);
  }, []);

  const handleSelectDifficulty = (difficultyId, customImageUrl) => {
    setLastCustomImage(customImageUrl || null);
    game.startNewGame(difficultyId, customImageUrl);
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
    game.startNewGame(game.difficulty, lastCustomImage);
    setSelectedCell(null);
    setHighlightValue(0);
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

  if (sessionLoading) {
    return <div className="game-screen">Chargement…</div>;
  }

  if (isPasswordRecovery) {
    return <UpdatePasswordScreen onDone={() => setIsPasswordRecovery(false)} />;
  }

  if (!session) {
    return <AuthScreen />;
  }

  if (manifestLoading) {
    return <div className="game-screen">Chargement…</div>;
  }

  if (!game.difficulty) {
    return (
      <>
        <header className="app-header">
          <img src="/favicon.svg" alt="Sudoku Art" className="app-logo" />
          <div className="header-actions">
            {darkModeButton}
            <button className="icon-btn" onClick={handleOpenGallery} title="Galerie">🖼</button>
            <button className="icon-btn" onClick={() => supabase.auth.signOut()} title="Déconnexion">🚪</button>
          </div>
        </header>
        <DifficultySelector onSelect={handleSelectDifficulty} sharedPhoto={sharedPhoto} />
        {showGallery && (
          <Gallery gallery={galleryData} onClose={() => setShowGallery(false)} />
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
          </span>
          <span className="stat-pill" title="Nombre d'erreurs">
            ❌ {game.errorCount}
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
          <button className="icon-btn" onClick={game.resetToMenu} title="Menu">↩</button>
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
          onSelectCell={handleSelectCell}
        />

        <NumberPad
          ref={padRef}
          onInput={handleInput}
          disabled={game.isComplete}
          notesMode={game.notesMode}
          onToggleNotes={game.toggleNotesMode}
          onUndo={game.undo}
          canUndo={game.canUndo}
          onHint={() => setShowHint(true)}
        />
      </div>

      {showHint && (
        <HintModal
          hint={currentHint}
          onFill={handleHintFill}
          onClose={() => setShowHint(false)}
        />
      )}

      {game.isComplete && (
        <WinModal
          difficulty={game.difficulty}
          rewardImage={game.rewardImage}
          watermark={game.watermark}
          onReplay={handleReplay}
          onClose={game.resetToMenu}
        />
      )}

      {showGallery && (
        <Gallery gallery={galleryData} onClose={() => setShowGallery(false)} />
      )}
    </>
  );
}
