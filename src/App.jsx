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
import RematchComposer from './components/RematchComposer';
import DefiComposer from './components/DefiComposer';
import DefiDashboard from './components/DefiDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import QuitConfirmModal from './components/QuitConfirmModal';
import MaxErrorsModal from './components/MaxErrorsModal';
import IncomingDefiModal from './components/IncomingDefiModal';
import UsernameModal from './components/UsernameModal';
import { fetchMyProfile } from './lib/profiles';
import RematchResultDetail from './components/RematchResultDetail';
// QUEST_DISABLED: import QuestMap from './components/QuestMap';
// QUEST_DISABLED: import MathQuestMap from './components/MathQuestMap';
import UpdatePasswordScreen from './components/UpdatePasswordScreen';
import InstallAppModal from './components/InstallAppModal';
import HelpModal from './components/HelpModal';
import KpiDashboard from './components/KpiDashboard';
import AdSlot from './components/AdSlot';
import AdConsentBanner from './components/AdConsentBanner';
import AdInterstitial from './components/AdInterstitial';
import { TermsModal, PrivacyModal } from './components/LegalModal';
import DeleteAccountModal from './components/DeleteAccountModal';
import OnboardingModal from './components/OnboardingModal';
import HomeProgress from './components/HomeProgress';
import { getAdConsent } from './lib/adConsent';
import { translate as t, useT } from './i18n/index.jsx';
import { useGame } from './hooks/useGame';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import './components/LegalModal.css';
import { loadManifest, pickImageForTier, TIERS_BY_DIFFICULTY } from './data/imageLibrary';
import { getMergedUnseenIds } from './lib/seenPaintings';
import { getUnlockedGallery } from './utils/storage';
import { supabase } from './lib/supabaseClient';
import { getSharedPhotoPublicUrl } from './lib/sharedPhoto';
import {
  readChallengeIdFromUrl,
  clearChallengeFromUrl,
  fetchChallenge,
  claimChallenge,
  claimChallengeToken
} from './lib/challenges';
import {
  readRematchIdFromUrl,
  clearRematchFromUrl,
  fetchRematch,
  claimRematchToken,
  fetchUnnotifiedRematchResults,
  markRematchNotified,
  determineRematchWinner,
  hasRematchAlreadyStarted,
  markRematchAsStarted
} from './lib/rematches';

const DARK_MODE_KEY = 'sudoku-devoile:darkMode';

const DIFFICULTY_ICONS = {
  facile: '😌',
  moyen: '🙂',
  complique: '😬',
  enfer: '🔥'
};

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function App() {
  const { lang, setLang } = useT();

  const DIFFICULTY_LABELS = {
    facile: t('diff_facile'),
    moyen: t('diff_moyen'),
    complique: t('diff_complique'),
    enfer: t('diff_enfer'),
  };
  const [manifest, setManifest] = useState(null);
  const [manifestLoading, setManifestLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);
  const [highlightValue, setHighlightValue] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryData, setGalleryData] = useState([]);
  const [lastCustomImage, setLastCustomImage] = useState(null);
  const [isClassicMode, setIsClassicMode] = useState(false);
  const [lastChallengeMeta, setLastChallengeMeta] = useState(null);
  const [showHint, setShowHint] = useState(false);
  // hintsUsed géré dans useGame
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
  const [authIntent, setAuthIntent] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const [composerPreloadedPhoto, setComposerPreloadedPhoto] = useState(null);
  const [showRematchComposer, setShowRematchComposer] = useState(false);
  const [showDefiComposer, setShowDefiComposer] = useState(false);
  const [showDefiDashboard, setShowDefiDashboard] = useState(false);
  // Interstitielle pub : quelle action est en attente après la pub
  const [pendingAdAction, setPendingAdAction] = useState(null); // null | 'challenge' | 'rematch'
  // QUEST_DISABLED: const [showQuestMap, setShowQuestMap] = useState(false);
  // QUEST_DISABLED: const [showMathQuestMap, setShowMathQuestMap] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showKpiDashboard, setShowKpiDashboard] = useState(false);
  const [adConsent, setAdConsentState] = useState(() => getAdConsent());
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const isOnline = useNetworkStatus();

  // Onboarding : affiché une seule fois au premier lancement
  const ONBOARDING_KEY = 'sudoku-devoile:onboardingDone';
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem(ONBOARDING_KEY); } catch { return false; }
  });
  const handleCloseOnboarding = () => {
    try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch {}
    setShowOnboarding(false);
  };

  // Défi reçu par lien : on le charge directement, sans exiger de connexion.
  const [incomingChallengeId] = useState(() => readChallengeIdFromUrl());
  const [incomingChallengeHandled, setIncomingChallengeHandled] = useState(false);
  const [challengeAlreadyOpened, setChallengeAlreadyOpened] = useState(false);
  const [rematchAlreadyStartedNotice, setRematchAlreadyStartedNotice] = useState(false);

  // Défi "même grille" reçu par lien.
  const [incomingRematchId] = useState(() => readRematchIdFromUrl());
  const [pendingRematch, setPendingRematch] = useState(null); // rematch en attente de choix connexion
  const [incomingRematchHandled, setIncomingRematchHandled] = useState(false);
  const [rematchNotifications, setRematchNotifications] = useState([]);
  const [selectedRematchNotification, setSelectedRematchNotification] = useState(null);

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

  // Si on vient de se connecter (ou de créer un compte) spécifiquement pour
  // envoyer un défi, on ouvre automatiquement le composeur juste après. Si la
  // connexion a été faite depuis le bouton générique "Se connecter", on
  // retombe normalement sur l'écran de choix de difficulté.
  useEffect(() => {
    if (session && showAuthScreen) {
      setShowAuthScreen(false);
      if (authIntent === 'pending_rematch' && pendingRematch) {
        const { rematch, photoUrl } = pendingRematch;
        setPendingRematch(null);
        setAuthIntent(null);
        game.startRematchGame(rematch, photoUrl);
      } else {
        setAuthIntent(null);
      }
    }
  }, [session, showAuthScreen, authIntent, pendingRematch]);

  // username DOIT être déclaré avant useGame() qui le référence
  const [username, setUsername] = useState(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showMaxErrors, setShowMaxErrors] = useState(false);

  const game = useGame(manifest, session?.user?.id ?? null, {
    onMaxErrorsReached: () => setShowMaxErrors(true),
    username,
  });

  const [preloadedByTier, setPreloadedByTier] = useState({});

  // Dès que l'écran d'accueil est affiché (premier chargement, ou retour au
  // menu après une partie), on choisit déjà une image par rareté (commune,
  // rare, légendaire) — comme on ne sait pas encore quelle difficulté le
  // joueur va choisir — et on lance leur téléchargement en arrière-plan, en
  // évitant si possible les tableaux déjà vus (localement et sur le compte
  // si connecté). C'est cette même image qui servira ensuite à la fois de
  // filigrane pendant la partie et de récompense affichée à la victoire.
  useEffect(() => {
    if (!manifest || game.difficulty) return;
    let cancelled = false;

    getMergedUnseenIds(session?.user?.id ?? null).then(unseenIds => {
      if (cancelled) return;
      const map = {};
      for (const tier of ['commune', 'rare', 'legendaire']) {
        const candidate = pickImageForTier(manifest, tier, unseenIds);
        if (candidate) {
          map[tier] = candidate;
          new Image().src = candidate.path;
        }
      }
      setPreloadedByTier(map);
    });

    return () => {
      cancelled = true;
    };
  }, [manifest, game.difficulty, session]);

  const handleOpenGallery = useCallback(() => {
    setGalleryData(getUnlockedGallery());
    setShowGallery(true);
  }, []);

  const handleSelectDifficulty = (difficultyId, customImageUrl) => {
    const isClassic = customImageUrl === 'classic';
    setIsClassicMode(isClassic);
    setLastCustomImage(isClassic ? null : (customImageUrl || null));
    setLastChallengeMeta(null);
    if (isClassic) {
      // Sudoku classique : on lance sans image et on force l'intensité à 0
      game.setImageIntensity(0);
      game.startNewGame(difficultyId, null, null, null);
    } else {
      const tier = TIERS_BY_DIFFICULTY[difficultyId] ?? 'commune';
      game.startNewGame(difficultyId, customImageUrl, null, preloadedByTier[tier] ?? null);
    }
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
  // un défi reçu. On vérifie d'abord que ce lien n'a pas déjà été ouvert
  // depuis un autre appareil (protection contre le transfert involontaire
  // du lien, qui transférerait sinon l'accès à la photo).
  useEffect(() => {
    if (!incomingChallengeId || incomingChallengeHandled || manifestLoading) return;

    setIncomingChallengeHandled(true);
    clearChallengeFromUrl();

    fetchChallenge(incomingChallengeId)
      .then(async challenge => {
        if (!challenge || challenge.completed) return;

        const { granted } = await claimChallengeToken(incomingChallengeId);
        if (!granted) {
          setChallengeAlreadyOpened(true);
          return;
        }

        handlePlayChallenge(challenge);
        // Si l'utilisateur est déjà connecté, on rattache aussi le défi à
        // son compte (purement informatif, pas une condition pour jouer).
        if (session) claimChallenge(incomingChallengeId).catch(() => null);
      })
      .catch(() => null);
  }, [incomingChallengeId, incomingChallengeHandled, manifestLoading, session, handlePlayChallenge]);

  // Dès qu'un lien de défi "même grille" est ouvert, on charge exactement la
  // même grille que le challenger et on lance la partie directement —
  // protégé par le même jeton anti-transfert que les défis classiques.
  useEffect(() => {
    if (!incomingRematchId || incomingRematchHandled || manifestLoading) return;

    setIncomingRematchHandled(true);
    clearRematchFromUrl();

    fetchRematch(incomingRematchId)
      .then(async rematch => {
        if (!rematch || rematch.completed) return;

        const photoUrl = rematch.photo_path ? getSharedPhotoPublicUrl(rematch.photo_path) : null;

        // Mode groupe : pas de claim token, tout le monde peut jouer
        if (rematch.group_mode) {
          if (session) {
            game.startRematchGame(rematch, photoUrl);
          } else {
            setPendingRematch({ rematch, photoUrl });
          }
          return;
        }

        // Mode perso : premier arrivé premier servi
        if (hasRematchAlreadyStarted(incomingRematchId)) {
          setRematchAlreadyStartedNotice(true);
          return;
        }

        const { granted } = await claimRematchToken(incomingRematchId);
        if (!granted) {
          setChallengeAlreadyOpened(true);
          return;
        }

        markRematchAsStarted(incomingRematchId);

        // Si l'utilisateur est déjà connecté → lancer directement (son compte sera lié)
        // Sinon → proposer de se connecter ou jouer en libre
        if (session) {
          game.startRematchGame(rematch, photoUrl);
        } else {
          setPendingRematch({ rematch, photoUrl });
        }
      })
      .catch(() => null);
  }, [incomingRematchId, incomingRematchHandled, manifestLoading, game]);

  // Tant qu'on est connecté et sur l'écran d'accueil, on vérifie si des amis
  // ont terminé un défi "même grille" qu'on leur a envoyé, pour leur montrer
  // qui a gagné.
  useEffect(() => {
    if (!session || game.difficulty) return;
    let cancelled = false;

    fetchUnnotifiedRematchResults(session.user.id).then(results => {
      if (!cancelled) setRematchNotifications(results);
    });

    return () => {
      cancelled = true;
    };
  }, [session, game.difficulty]);

  const handleDismissRematchNotification = (rematchId) => {
    markRematchNotified(rematchId).catch(() => null);
    setRematchNotifications(prev => prev.filter(r => r.id !== rematchId));
  };

  // Ouvre la pub interstitielle puis l'action cible (défi classique ou même-grille).
  const handleRequestSendChallenge = (preloadedPhoto = null) => {
    setComposerPreloadedPhoto(preloadedPhoto ?? null);
    setPendingAdAction('challenge');
  };

  // Appelé depuis WinModal — on passe par la pub avant d'ouvrir RematchComposer
  const handleRequestRematchWithAd = () => {
    setPendingAdAction('rematch');
  };

  const handleAdContinue = () => {
    const action = pendingAdAction;
    setPendingAdAction(null);
    if (action === 'challenge') setShowComposer(true);
    if (action === 'rematch') setShowRematchComposer(true);
    if (action === 'defi') setShowDefiComposer(true);
  };

  const handleAdClose = () => setPendingAdAction(null);

  // Ouvre DefiComposer avec une pub interstitielle avant
  const handleOpenDefi = () => {
    if (session) {
      setShowDefiDashboard(true);
    } else if (adConsent === 'accepted') {
      // Pub consentie → montrer l'interstitielle
      setPendingAdAction('defi');
    } else {
      // Pas de pub → aller directement au composer
      setShowDefiComposer(true);
    }
  };

  // Appelé par DefiComposer quand la grille est prête à jouer
  const handleDefiStartGame = ({ rematch, puzzleData, photoUrl }) => {
    setShowDefiComposer(false);
    setLastCustomImage(photoUrl ?? null);
    setIsClassicMode(false);
    setLastChallengeMeta(null);
    // On passe puzzleData local pour éviter tout pb de parsing depuis Supabase
    game.startRematchGame(rematch, photoUrl, puzzleData);
  };

  const handlePlayPendingRematch = (pseudo = null) => {
    if (!pendingRematch) return;
    const { rematch, photoUrl } = pendingRematch;
    setPendingRematch(null);
    game.startRematchGame(rematch, photoUrl, null, pseudo);
  };

  const handleLoginThenPlayPendingRematch = () => {
    setAuthIntent('pending_rematch');
    setShowAuthScreen(true);
  };

  // QUEST_DISABLED: handleRequestQuest, handlePlayQuestStage, handleRequestMathQuest

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
    game.startNewGame(game.difficulty, lastCustomImage, lastChallengeMeta, game.nextWatermark);
    setSelectedCell(null);
    setHighlightValue(0);
  };

  // Charger le profil dès qu'on est connecté
  useEffect(() => {
    if (!session) { setUsername(null); return; }
    fetchMyProfile(session.user.id).then(profile => {
      if (profile?.username) {
        setUsername(profile.username);
      } else {
        // Pas encore de pseudo → afficher la modale
        setShowUsernameModal(true);
      }
    });
  }, [session?.user?.id]);

  const handleCloseGameEnd = () => {
    if (game.isComplete || game.isFailed) {
      game.resetToMenu();
      return;
    }
    // Si connecté : progression sauvegardée, on peut quitter directement
    if (session) {
      game.resetToMenu();
      return;
    }
    // Si non connecté : proposer de se connecter pour ne pas perdre la progression
    setShowQuitConfirm(true);
  };

  const handleQuitConfirmed = () => {
    setShowQuitConfirm(false);
    game.resetToMenu();
  };

  const handleQuitAndLogin = () => {
    setShowQuitConfirm(false);
    game.resetToMenu();
    setShowAuthScreen(true);
  };

  const [hintRevealCell, setHintRevealCell] = useState(null); // { row, col, value }

  const handleRevealHint = (row, col, value) => {
    // Forcer le mode normal (pas notes) avant de poser le chiffre
    if (game.notesMode) game.toggleNotesMode();
    // Placer le chiffre — setCellValue nettoie déjà les notes de la case
    // et des cases voisines (ligne/colonne/carré) si la valeur est correcte
    game.setCellValue(row, col, value);
    game.setHintsUsed(h => h + 1);
    setShowHint(false);
    // Déclencher l'animation étoiles sur cette case
    setHintRevealCell({ row, col, value });
    setTimeout(() => setHintRevealCell(null), 2200);
  };

  const handleOpenHint = () => setShowHint(true);
  const handleCloseHint = () => setShowHint(false);

  // Un clic en dehors de la grille (et du pavé numérique) désélectionne la
  // case en cours : ça désactive le surlignage et fait réapparaître l'image
  // en filigrane.
  useEffect(() => {
    if (!game.difficulty) return;

    function handlePointerDown(event) {
      const insideBoard = boardRef.current && boardRef.current.contains(event.target);
      const insidePad = padRef.current && padRef.current.contains(event.target);
      const insideHintBar = event.target.closest && event.target.closest('.hint-bar');
      if (!insideBoard && !insidePad && !insideHintBar) {
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
      title={darkMode ? t('app_light') : t('app_dark')}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  );

  const accountButton = session ? (
    <button className="icon-btn" onClick={() => supabase.auth.signOut()} title="Déconnexion">🚪</button>
  ) : (
    <button className="icon-btn" onClick={() => setShowAuthScreen(true)} title="Se connecter">👤</button>
  );

  const profileButton = session ? (
    <button
      className="icon-btn header-username-btn"
      title={username ? `@${username}` : t('app_my_profile')}
      onClick={() => setShowUsernameModal(true)}
    >
      {username ? username.slice(0, 2).toUpperCase() : '👤'}
    </button>
  ) : null;

  if (sessionLoading || manifestLoading) {
    return <div className="game-screen">{t('app_loading')}</div>;
  }

  if (isPasswordRecovery) {
    return <UpdatePasswordScreen onDone={() => setIsPasswordRecovery(false)} />;
  }

  if (showAuthScreen) {
    return <AuthScreen onCancel={() => { setShowAuthScreen(false); setAuthIntent(null); }} />;
  }

  if (!game.difficulty) {
    return (
      <>
        <header className="app-header">
          <img src="/favicon.svg" alt="Sudoku Art" className="app-logo" />
          <div className="header-actions">
            {darkModeButton}
            <button className="icon-btn" onClick={() => setShowHelpModal(true)} title="Rules">❓</button>
            <button className="icon-btn" onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} title="Language">
              {lang === 'fr' ? '🇬🇧' : '🇫🇷'}
            </button>
            <button className="icon-btn" onClick={() => setShowInstallModal(true)} title="Install">📲</button>
            {session?.user?.email === 't.dabadie@gmail.com' && (
              <button className="icon-btn" onClick={() => setShowKpiDashboard(true)} title="Statistiques">📊</button>
            )}
            <button className="icon-btn" onClick={handleOpenGallery} title={t('gallery_title')}>🖼</button>
            {profileButton}
            {accountButton}
          </div>
        </header>
        <DifficultySelector
          onSelect={handleSelectDifficulty}
          onRequestSendChallenge={handleRequestSendChallenge}
          onOpenDefi={handleOpenDefi}
        />

        {adConsent === 'accepted' && (
          <AdSlot slot="1234567890" />
        )}

        {!isOnline && (
          <div className="challenge-already-opened-banner" style={{ background: 'rgba(180,80,0,0.12)' }}>
            📵 Pas de connexion internet — les fonctionnalités réseau sont indisponibles.
          </div>
        )}

        {challengeAlreadyOpened && (
          <div className="challenge-already-opened-banner">
            📷 Le lien de défi que tu as ouvert a déjà été utilisé sur un autre
            appareil — la photo n'est visible que là où il a été ouvert en premier.
            <button onClick={() => setChallengeAlreadyOpened(false)}>✕</button>
          </div>
        )}
        {rematchAlreadyStartedNotice && (
          <div className="challenge-already-opened-banner">
            🚫 Tu as déjà commencé ce défi — impossible de relancer la grille
            à zéro pour retenter ta chance.
            <button onClick={() => setRematchAlreadyStartedNotice(false)}>✕</button>
          </div>
        )}
        {rematchNotifications.map(r => {
          const winner = determineRematchWinner({
            challengerErrors: r.challenger_result_errors,
            challengerSeconds: r.challenger_result_seconds,
            recipientErrors: r.recipient_result_errors,
            recipientSeconds: r.recipient_result_seconds
          });
          return (
            <div
              className="challenge-already-opened-banner"
              key={r.id}
              onClick={() => setSelectedRematchNotification({ rematch: r, winner })}
              style={{ cursor: 'pointer' }}
            >
              🎯 Ton ami a fini le défi que tu lui as envoyé !{' '}
              {winner === 'tie' && 'Égalité parfaite.'}
              {winner === 'challenger' && 'Tu as gagné 🏆'}
              {winner === 'recipient' && "Il/elle a fait mieux que toi cette fois 😅"}
              <button onClick={(e) => { e.stopPropagation(); handleDismissRematchNotification(r.id); }}>✕</button>
            </div>
          );
        })}

        {selectedRematchNotification && (
          <RematchResultDetail
            rematch={selectedRematchNotification.rematch}
            winner={selectedRematchNotification.winner}
            onClose={() => setSelectedRematchNotification(null)}
          />
        )}
        {showHelpModal && (
          <HelpModal onClose={() => setShowHelpModal(false)} />
        )}
        {showInstallModal && (
          <InstallAppModal onClose={() => setShowInstallModal(false)} />
        )}
        {showKpiDashboard && (
          <KpiDashboard onClose={() => setShowKpiDashboard(false)} />
        )}
        {showGallery && (
          <Gallery gallery={galleryData} onClose={() => setShowGallery(false)} />
        )}
        {showTerms && (
          <TermsModal onClose={() => setShowTerms(false)} />
        )}
        {showPrivacyPolicy && (
          <PrivacyModal
            onClose={() => setShowPrivacyPolicy(false)}
            onConsentChange={(value) => setAdConsentState(value)}
          />
        )}
        {showDeleteAccount && (
          <DeleteAccountModal
            onClose={() => setShowDeleteAccount(false)}
            onDeleted={() => { setShowDeleteAccount(false); }}
          />
        )}
        {adConsent === null && (
          <AdConsentBanner
            onChoice={(value) => setAdConsentState(value)}
            onShowPrivacy={() => setShowPrivacyPolicy(true)}
          />
        )}
        <div className="home-footer">
          <button className="privacy-footer-link" onClick={() => setShowTerms(true)}>{t('footer_cgu')}</button>
          <span className="privacy-footer-sep">·</span>
          <button className="privacy-footer-link" onClick={() => setShowPrivacyPolicy(true)}>{t('footer_privacy')}</button>
          {session && (
            <>
              <span className="privacy-footer-sep">·</span>
              <button className="privacy-footer-link privacy-footer-danger" onClick={() => setShowDeleteAccount(true)}>{t('footer_delete')}</button>
            </>
          )}
        </div>

        {showComposer && (
          <ChallengeComposer
            preloadedPhotoUrl={composerPreloadedPhoto}
            onClose={() => { setShowComposer(false); setComposerPreloadedPhoto(null); }}
          />
        )}
        {showDefiComposer && (
          <ErrorBoundary>
            <DefiComposer
              onClose={() => setShowDefiComposer(false)}
              onStartGame={handleDefiStartGame}
              userId={session?.user?.id ?? null}
              userEmail={username ?? session?.user?.email ?? null}
            />
          </ErrorBoundary>
        )}
        {showDefiDashboard && (
          <ErrorBoundary>
            <DefiDashboard
              userId={session?.user?.id ?? null}
              onClose={() => setShowDefiDashboard(false)}
              onCreateDefi={() => {
                setShowDefiDashboard(false);
                setPendingAdAction('defi');
              }}
            />
          </ErrorBoundary>
        )}
        {pendingAdAction && (
          <AdInterstitial
            onContinue={handleAdContinue}
            onClose={handleAdClose}
          />
        )}
        {showOnboarding && (
          <OnboardingModal onClose={handleCloseOnboarding} />
        )}
        {pendingRematch && (
          <IncomingDefiModal
            rematch={pendingRematch.rematch}
            onLogin={handleLoginThenPlayPendingRematch}
            onPlayFree={handlePlayPendingRematch}
          />
        )}
        {showUsernameModal && session && (
          <UsernameModal
            userId={session.user.id}
            onDone={(pseudo) => {
              setUsername(pseudo);
              setShowUsernameModal(false);
            }}
          />
        )}
        {/* QUEST_DISABLED: QuestMap + MathQuestMap */}
      </>
    );
  }

  return (
    <>
      <header className="app-header">
        <img src="/favicon.svg" alt="Sudoku Art" className="app-logo" />
        <div className="header-actions">
          <span className="stat-pill stat-pill-timer">
            ⏱ {formatTime(game.elapsedSeconds)}
            {game.challengeMeta?.timeLimitSeconds ? ` / ${formatTime(game.challengeMeta.timeLimitSeconds)}` : ''}
          </span>
          <span className="stat-pill">
            {DIFFICULTY_ICONS[game.difficulty] ?? '🎯'} {DIFFICULTY_LABELS[game.difficulty] ?? game.difficulty}
          </span>
          <span className="stat-pill">❌ {game.errorCount} / {game.challengeMeta?.maxErrors ?? 3}</span>
          {darkModeButton}
          <button className="icon-btn" onClick={game.toggleWatermark} title="Filigrane">
            {game.watermarkVisible ? '🙈' : '🙉'}
          </button>
          <button className="icon-btn" onClick={handleCloseGameEnd} title="Menu">↩</button>
        </div>
      </header>

      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}

      <div className="game-screen">
        {game.imageIntensity > 0 && game.watermark && (
          <div className="intensity-control">
            <label htmlFor="image-intensity">
              🖼 Intensité du filigrane
            </label>
            <input
              id="image-intensity"
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={game.imageIntensity}
              onChange={(e) => game.setImageIntensity(parseFloat(e.target.value))}
            />
          </div>
        )}

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
          isComplete={game.isComplete || game.tempFullReveal}
          hintHighlightZones={hintRevealCell ? [{ color: 'answer', cells: [{ row: hintRevealCell.row, col: hintRevealCell.col }] }] : []}
          hintTargetCell={hintRevealCell ?? null}
          hintRevealCell={hintRevealCell}
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
          onHint={handleOpenHint}
          hintsDisabled={
            game.challengeMeta?.hints_limit != null &&
            game.hintsUsed >= game.challengeMeta.hints_limit
          }
          completedDigits={game.completedDigits}
        />
      </div>

      {showHint && (
        <HintModal
          userGrid={game.userGrid}
          puzzleSolution={game.puzzleData?.solution}
          onRevealHint={handleRevealHint}
          onClose={handleCloseHint}
          hintsUsed={game.hintsUsed}
          maxHints={game.challengeMeta?.maxHints ?? null}
        />
      )}

      {game.showWinModal && (
        <WinModal
          difficulty={game.difficulty}
          rewardImage={isClassicMode ? null : game.rewardImage}
          watermark={isClassicMode ? null : game.watermark}
          challengeMeta={game.challengeMeta}
          rematchOutcome={game.rematchOutcome}
          errorCount={game.errorCount}
          elapsedSeconds={game.elapsedSeconds}
          result="won"
          onReplay={handleReplay}
          onClose={game.dismissWinModal}
          onRequestRematch={handleRequestRematchWithAd}
        />
      )}

      {showRematchComposer && (
        <RematchComposer
          puzzleData={game.puzzleData}
          difficulty={game.difficulty}
          errorCount={game.errorCount}
          elapsedSeconds={game.elapsedSeconds}
          userId={session?.user?.id ?? null}
          userEmail={username ?? session?.user?.email ?? null}
          onClose={() => setShowRematchComposer(false)}
        />
      )}

      {pendingAdAction && (
        <AdInterstitial
          onContinue={handleAdContinue}
          onClose={handleAdClose}
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

      {showQuitConfirm && (
        <QuitConfirmModal
          onContinue={() => setShowQuitConfirm(false)}
          onLogin={handleQuitAndLogin}
          onQuit={handleQuitConfirmed}
        />
      )}

      {showMaxErrors && (
        <MaxErrorsModal
          errorCount={game.errorCount}
          maxErrors={3}
          onContinue={() => {
            setShowMaxErrors(false);
            // Réinitialise le compteur à 2/3 (une erreur "offerte")
            game.resetErrorCount(2);
          }}
          onGameOver={() => {
            setShowMaxErrors(false);
            game.triggerFail();
          }}
        />
      )}

      {session?.user?.email === 't.dabadie@gmail.com' && (
        <button
          onClick={game.solveGridForTesting}
          title="[TEST] Compléter la grille"
          style={{
            position: 'fixed', bottom: 24, right: 16, zIndex: 999,
            background: '#333', color: '#fff', border: 'none',
            borderRadius: '50%', width: 44, height: 44, fontSize: '1.2rem',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
          }}
        >
          🛠️
        </button>
      )}
    </>
  );
}
