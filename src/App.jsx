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
import ConsentBanner from './components/ConsentBanner';
import AdInterstitial from './components/AdInterstitial';
import { TermsModal, PrivacyModal } from './components/LegalModal';
import DeleteAccountModal from './components/DeleteAccountModal';
import OnboardingModal from './components/OnboardingModal';
import HomeProgress from './components/HomeProgress';
import FeedbackModal from './components/FeedbackModal';
import { setAdConsent } from './lib/adConsent';
import { hasDecided as hasConsentDecided } from './lib/consent';
import { useT } from './i18n/index.jsx';
import { useGame } from './hooks/useGame';
import { useGameAnalytics } from './hooks/useGameAnalytics';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { isMobileDevice, classifyReferrer } from './utils/device';
import { trackHomeViewed, trackGameSelected, trackHintUsed, trackNewGameClicked, updateGameSessionSnapshot } from './lib/tracking';
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
  markRematchAsStarted,
  claimGroupResult
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
  const { t, lang, setLang } = useT();
  const toggleLanguage = () => setLang(lang === 'fr' ? 'en' : 'fr');

  const DIFFICULTY_LABELS = {
    facile: t('diff_facile'),
    moyen: t('diff_moyen'),
    complique: t('diff_complique'),
    enfer: t('diff_enfer') };
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
  const [regenerateSource, setRegenerateSource] = useState(null); // défi existant à renvoyer, le cas échéant
  // Interstitielle pub : quelle action est en attente après la pub
  const [pendingAdAction, setPendingAdAction] = useState(null); // null | 'challenge' | 'rematch'
  // QUEST_DISABLED: const [showQuestMap, setShowQuestMap] = useState(false);
  // QUEST_DISABLED: const [showMathQuestMap, setShowMathQuestMap] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showKpiDashboard, setShowKpiDashboard] = useState(false);
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

  // Pont depuis les pages SEO (src/seo/pages.jsx) : leurs boutons "Jouer"
  // sont de vrais liens vers "/?jouer=<difficulté|defi>", lus une seule fois
  // au montage puis retirés de l'URL — même principe que les défis reçus
  // par lien ci-dessus.
  const [pendingPlayIntent] = useState(() => new URLSearchParams(window.location.search).get('jouer'));
  const [pendingPlayIntentHandled, setPendingPlayIntentHandled] = useState(false);

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
  // connexion a été faite depuis le bouton générique de connexion, on
  // retombe normalement sur l'écran de choix de difficulté.
  useEffect(() => {
    if (session && showAuthScreen) {
      setShowAuthScreen(false);
      if (authIntent === 'pending_rematch' && pendingRematch) {
        const { rematch, photoUrl } = pendingRematch;
        setPendingRematch(null);
        setAuthIntent(null);
        setIsClassicMode(!!rematch.classic_mode);
        game.startRematchGame(rematch, photoUrl);
      } else if (authIntent === 'claim_group_result' && game.activeRematch?.groupMode && game.activeRematch.playerPseudo) {
        // Rattache au compte qui vient de se connecter le résultat joué en
        // candidat libre juste avant — la partie WinModal reste affichée
        // (game.showWinModal n'est pas touché) et refetch le classement au
        // remontage de son composant.
        claimGroupResult(game.activeRematch.id, {
          playerName: game.activeRematch.playerPseudo,
          userId: session.user.id
        }).catch(() => null);
        setAuthIntent(null);
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
    username });

  // classic = sudoku sans image, personal_image = photo perso (donnée
  // sensible : jamais de puzzle_id transmis pour ce type, voir lib/tracking).
  const contentType = isClassicMode ? 'classic' : (game.watermark?.isCustom ? 'personal_image' : 'artwork');
  const gameAnalytics = useGameAnalytics(game, {
    language: lang,
    contentType,
    puzzleId: game.watermark?.id ?? null,
    isCustomGame: !!game.watermark?.isCustom
  });

  useEffect(() => {
    document.body.classList.toggle('game-in-progress', !!game.difficulty);
  }, [game.difficulty]);

  // "Accueil vu" : à chaque fois que l'écran d'accueil redevient réellement
  // visible (premier chargement, ou retour après une partie) — pas à
  // chaque re-rendu tant qu'on y reste.
  const homeViewedShownRef = useRef(false);
  useEffect(() => {
    const isHomeVisible = !sessionLoading && !manifestLoading && !isPasswordRecovery && !showAuthScreen && !game.difficulty;
    if (isHomeVisible && !homeViewedShownRef.current) {
      homeViewedShownRef.current = true;
      trackHomeViewed({
        language: lang,
        deviceType: isMobileDevice() ? 'mobile' : 'desktop',
        referrerType: classifyReferrer(document.referrer)
      });
    }
    if (!isHomeVisible) homeViewedShownRef.current = false;
  }, [sessionLoading, manifestLoading, isPasswordRecovery, showAuthScreen, game.difficulty, lang]);

  const [consentDecided, setConsentDecided] = useState(() => hasConsentDecided());
  const [showFeedback, setShowFeedback] = useState(false);

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
    trackGameSelected({
      difficulty: difficultyId,
      contentType: isClassic ? 'classic' : (customImageUrl ? 'personal_image' : 'artwork'),
      puzzleId: null, // pas encore généré à ce stade — voir game_started
      language: lang
    });
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
            setIsClassicMode(!!rematch.classic_mode);
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
          setIsClassicMode(!!rematch.classic_mode);
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

  // Ouvre DefiComposer avec une pub interstitielle avant. La pub s'affiche
  // toujours (personnalisée ou non selon le consentement, voir
  // AdInterstitial) — le consentement ne permet pas de sauter la pub.
  const handleOpenDefi = () => {
    if (session) {
      setShowDefiDashboard(true);
    } else {
      setPendingAdAction('defi');
    }
  };

  // Bouton "Jouer" / "Créer mon défi" venant d'une page SEO (?jouer=...) :
  // lance directement l'action correspondante au premier chargement, une
  // seule fois, puis nettoie l'URL — même schéma que les défis reçus par
  // lien plus haut.
  useEffect(() => {
    if (!pendingPlayIntent || pendingPlayIntentHandled || manifestLoading) return;
    setPendingPlayIntentHandled(true);

    const url = new URL(window.location.href);
    url.searchParams.delete('jouer');
    window.history.replaceState({}, '', url.toString());

    if (pendingPlayIntent === 'defi') {
      handleOpenDefi();
    } else if (['facile', 'moyen', 'complique', 'enfer'].includes(pendingPlayIntent)) {
      handleSelectDifficulty(pendingPlayIntent, 'classic');
    }
  }, [pendingPlayIntent, pendingPlayIntentHandled, manifestLoading]);

  // Appelé depuis "Mes défis envoyés" : rouvre DefiComposer pré-rempli avec
  // la grille/difficulté/indices du défi existant, pour le renvoyer sous un
  // nouveau lien (l'ancien défi reste intact dans l'historique).
  const handleRegenerateDefi = (rematch) => {
    setShowDefiDashboard(false);
    setRegenerateSource(rematch);
    setPendingAdAction('defi');
  };

  // Appelé par DefiComposer quand la grille est prête à jouer
  const handleDefiStartGame = ({ rematch, puzzleData, photoUrl }) => {
    setShowDefiComposer(false);
    setRegenerateSource(null);
    setLastCustomImage(photoUrl ?? null);
    setIsClassicMode(!!rematch.classic_mode);
    setLastChallengeMeta(null);
    // On passe puzzleData local pour éviter tout pb de parsing depuis Supabase
    game.startRematchGame(rematch, photoUrl, puzzleData);
  };

  const handlePlayPendingRematch = (pseudo = null) => {
    if (!pendingRematch) return;
    const { rematch, photoUrl } = pendingRematch;
    setPendingRematch(null);
    setIsClassicMode(!!rematch.classic_mode);
    game.startRematchGame(rematch, photoUrl, null, pseudo);
  };

  const handleLoginThenPlayPendingRematch = () => {
    setAuthIntent('pending_rematch');
    setShowAuthScreen(true);
  };

  // Appelé depuis WinModal : un candidat libre non connecté veut se
  // connecter/créer un compte pour rattacher le résultat qu'il vient de
  // jouer en défi de groupe.
  const handleLoginToClaimGroupResult = () => {
    setAuthIntent('claim_group_result');
    setShowAuthScreen(true);
  };

  // QUEST_DISABLED: handleRequestQuest, handlePlayQuestStage, handleRequestMathQuest

  const handleSelectCell = (row, col) => {
    // Indice "choisir une case" en attente : ce tap désigne la case à
    // révéler plutôt que de sélectionner normalement une case à remplir.
    if (pickingHintCell) {
      const isGiven = game.puzzleData?.givenMask?.[row]?.[col];
      const isEmpty = game.userGrid?.[row]?.[col] === 0;
      if (!isGiven && isEmpty) {
        handleRevealHint(row, col, game.puzzleData.solution[row][col]);
      }
      // Case déjà remplie ou donnée au départ : tap ignoré, on reste en
      // attente d'une case vide valide.
      return;
    }
    setSelectedCell({ row, col });
    const value = game.userGrid ? game.userGrid[row][col] : 0;
    setHighlightValue(value);
  };

  const handleInput = (value) => {
    if (!selectedCell) return;
    game.setCellValue(selectedCell.row, selectedCell.col, value);
  };

  const handleReplay = () => {
    trackNewGameClicked({
      previousProgressPercent: Math.floor(game.revealProgress * 100),
      previousCompleted: game.isComplete,
      previousDifficulty: game.difficulty
    });
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
      gameAnalytics.reportPendingAbandonReason('return_home');
      game.resetToMenu();
      return;
    }
    // Si non connecté : proposer de se connecter pour ne pas perdre la progression
    setShowQuitConfirm(true);
  };

  const handleQuitConfirmed = () => {
    setShowQuitConfirm(false);
    gameAnalytics.reportPendingAbandonReason('return_home');
    game.resetToMenu();
  };

  const handleQuitAndLogin = () => {
    setShowQuitConfirm(false);
    gameAnalytics.reportPendingAbandonReason('return_home');
    game.resetToMenu();
    setShowAuthScreen(true);
  };

  const [hintRevealCell, setHintRevealCell] = useState(null); // { row, col, value }
  const [pickingHintCell, setPickingHintCell] = useState(false); // true = en attente d'un tap sur la grille

  const handleRevealHint = (row, col, value) => {
    // forceValue: true pose directement la vraie valeur, sans dépendre de
    // notesMode (voir le commentaire dans useGame.js — un toggle de
    // notesMode juste avant cet appel ne suffit pas, React l'applique de
    // façon asynchrone). setCellValue nettoie déjà les notes de la case et
    // des cases voisines si la valeur est correcte.
    game.setCellValue(row, col, value, { forceValue: true });
    game.setHintsUsed(h => h + 1);
    trackHintUsed({
      hintNumber: game.hintsUsed + 1,
      elapsedSeconds: game.elapsedSeconds,
      difficulty: game.difficulty,
      progressPercent: Math.floor(game.revealProgress * 100)
    });
    updateGameSessionSnapshot({ hintCount: game.hintsUsed + 1, lastActionType: 'hint' });
    setShowHint(false);
    setPickingHintCell(false);
    // Déclencher l'animation étoiles sur cette case
    setHintRevealCell({ row, col, value });
    setTimeout(() => setHintRevealCell(null), 2200);
  };

  // Un seul point d'entrée "Indice" : le choix entre "révéler un chiffre" et
  // "débloquer une case précise" se fait à l'intérieur de HintModal.
  const handleOpenHint = () => setShowHint(true);
  // Appelé par HintModal une fois la pub passée, si l'utilisateur a choisi
  // "débloquer une case précise" : on ferme la barre d'indice et on attend
  // un tap sur une case vide de la grille.
  const handleReadyToPickCell = () => { setShowHint(false); setPickingHintCell(true); };
  const handleCancelPickCell = () => setPickingHintCell(false);
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
    <button className="icon-btn" onClick={() => supabase.auth.signOut()} title={t('nav_logout_title')}>🚪</button>
  ) : (
    <button className="icon-btn" onClick={() => setShowAuthScreen(true)} title={t('auth_signin')}>👤</button>
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
            <button className="icon-btn" onClick={() => setShowHelpModal(true)} title={t('nav_rules_title')}>❓</button>
            <button className="icon-btn" onClick={toggleLanguage} title="Language">
              {lang === 'fr' ? '🇬🇧' : '🇫🇷'}
            </button>
            <button className="icon-btn" onClick={() => setShowInstallModal(true)} title={t('nav_install_title')}>📲</button>
            {session?.user?.email === 't.dabadie@gmail.com' && (
              <button className="icon-btn" onClick={() => setShowKpiDashboard(true)} title={t('nav_stats_title')}>📊</button>
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

        <AdSlot slot="8033973037" />

        {/* Empilées dans un conteneur dédié : ces bannières partagent la même
            position fixe en bas d'écran et se chevaucheraient sinon si
            plusieurs sont vraies en même temps (ex : plusieurs défis
            terminés à notifier). */}
        <div className="banner-stack">
          {!isOnline && (
            <div className="challenge-already-opened-banner" style={{ background: 'rgba(180,80,0,0.12)' }}>
              {t('offline_banner')}
            </div>
          )}

          {challengeAlreadyOpened && (
            <div className="challenge-already-opened-banner">
              {t('challenge_link_used_banner')}
              <button onClick={() => setChallengeAlreadyOpened(false)}>✕</button>
            </div>
          )}
          {rematchAlreadyStartedNotice && (
            <div className="challenge-already-opened-banner">
              {t('rematch_already_started_banner')}
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
                {t('rematch_friend_finished')}{' '}
                {winner === 'tie' && t('rematch_perfect_tie')}
                {winner === 'challenger' && t('rematch_you_won')}
                {winner === 'recipient' && t('rematch_recipient_better')}
                <button onClick={(e) => { e.stopPropagation(); handleDismissRematchNotification(r.id); }}>✕</button>
              </div>
            );
          })}
        </div>

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
            onConsentChange={setAdConsent}
          />
        )}
        {showDeleteAccount && (
          <DeleteAccountModal
            onClose={() => setShowDeleteAccount(false)}
            onDeleted={() => { setShowDeleteAccount(false); }}
          />
        )}
        {!consentDecided && !showOnboarding && (
          <ConsentBanner
            onDecided={() => setConsentDecided(true)}
            onShowPrivacy={() => setShowPrivacyPolicy(true)}
          />
        )}
        {showFeedback && (
          <FeedbackModal
            onClose={() => setShowFeedback(false)}
            feedbackContext="home_footer"
            page="home"
          />
        )}
        <div className="home-footer">
          <button className="privacy-footer-link" onClick={() => setShowTerms(true)}>{t('footer_cgu')}</button>
          <span className="privacy-footer-sep">·</span>
          <button className="privacy-footer-link" onClick={() => setShowPrivacyPolicy(true)}>{t('footer_privacy')}</button>
          <span className="privacy-footer-sep">·</span>
          <button className="privacy-footer-link" onClick={() => setShowFeedback(true)}>{t('feedback_link')}</button>
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
              onClose={() => { setShowDefiComposer(false); setRegenerateSource(null); }}
              onStartGame={handleDefiStartGame}
              userId={session?.user?.id ?? null}
              userEmail={username ?? session?.user?.email ?? null}
              defaultImageUrl={
                regenerateSource
                  ? (regenerateSource.photo_path ? getSharedPhotoPublicUrl(regenerateSource.photo_path) : null)
                  : lastCustomImage
              }
              regenerateFrom={regenerateSource}
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
              onRegenerateDefi={handleRegenerateDefi}
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
          {!isClassicMode && game.watermark && (
            <button className="icon-btn" onClick={game.toggleWatermark} title={t('game_watermark_toggle')}>
              {game.watermarkVisible ? '🙈' : '🙉'}
            </button>
          )}
          <button className="icon-btn" onClick={handleCloseGameEnd} title={t('nav_menu_title')}>↩</button>
        </div>
      </header>

      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}

      <div className="game-screen">
        {game.imageIntensity > 0 && game.watermark && (
          <div className="intensity-control">
            <label htmlFor="image-intensity">
              {t('game_intensity')}
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
          pickingHintCell={pickingHintCell}
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
            game.activeRematch?.hintsLimit != null &&
            game.hintsUsed >= game.activeRematch.hintsLimit
          }
          hintsUsed={game.hintsUsed}
          hintsLimit={game.activeRematch?.hintsLimit ?? null}
          completedDigits={game.completedDigits}
        />
      </div>

      {showHint && (
        <HintModal
          userGrid={game.userGrid}
          puzzleSolution={game.puzzleData?.solution}
          onRevealHint={handleRevealHint}
          onReadyToPick={handleReadyToPickCell}
          onClose={handleCloseHint}
          hintsUsed={game.hintsUsed}
          maxHints={game.activeRematch?.hintsLimit ?? null}
        />
      )}

      {pickingHintCell && (
        <div className="hint-bar">
          <div className="hint-bar-header">
            <span className="hint-step-label">🎯 {t('hint_pick_instruction')}</span>
            <button className="hint-btn-close" onClick={handleCancelPickCell}>✕</button>
          </div>
        </div>
      )}

      {game.pendingDefiResultAd && (
        <AdInterstitial
          onContinue={game.proceedToWinModalAfterAd}
          onClose={game.proceedToWinModalAfterAd}
        />
      )}

      {game.showWinModal && (
        <WinModal
          difficulty={game.difficulty}
          rewardImage={isClassicMode ? null : game.rewardImage}
          watermark={isClassicMode ? null : game.watermark}
          challengeMeta={game.challengeMeta}
          rematchOutcome={game.rematchOutcome}
          activeRematch={game.activeRematch}
          userId={session?.user?.id ?? null}
          errorCount={game.errorCount}
          elapsedSeconds={game.elapsedSeconds}
          result="won"
          onReplay={handleReplay}
          onClose={game.dismissWinModal}
          onRequestRematch={handleRequestRematchWithAd}
          onLoginToClaim={handleLoginToClaimGroupResult}
        />
      )}

      {showRematchComposer && (
        <RematchComposer
          puzzleData={game.puzzleData}
          difficulty={game.difficulty}
          errorCount={game.errorCount}
          hintsUsed={game.hintsUsed}
          elapsedSeconds={game.elapsedSeconds}
          userId={session?.user?.id ?? null}
          userEmail={username ?? session?.user?.email ?? null}
          defaultImageUrl={game.watermark?.isCustom ? game.watermark.path : null}
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
          title="[TEST] Complete grid"
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
