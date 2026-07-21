// src/lib/tracking/index.js
// Point d'entrée unique du tracking (GA4 + Clarity). Aucun composant ne
// doit importer gtag/dataLayer/clarity ou les modules ga4.js/clarity.js
// directement : tout passe par les fonctions trackXxx() exportées ici.
//
// Garanties :
// - ne plante jamais l'application, même sans identifiant GA4/Clarity ;
// - n'envoie rien tant que le consentement "mesure d'audience" n'est pas
//   accordé (quand une décision est requise) ;
// - n'envoie rien en développement local par défaut (VITE_ANALYTICS_FORCE_LOCAL) ;
// - n'envoie jamais de donnée personnelle (voir chaque trackXxx ci-dessous,
//   et src/lib/tracking/README.md pour la liste des paramètres autorisés).
import { getConsent, onConsentChange } from '../consent';
import { initGA4, sendGA4Event, getMeasurementId } from './ga4';
import { initClarity, clarityTag, clarityEvent, getClarityProjectId } from './clarity';
import { debugLog } from './debug';
import {
  generateGameSessionId,
  startGameSession,
  updateGameSessionSnapshot,
  getActiveGameSession,
  clearGameSession,
  consumeUnfinishedPreviousSession,
  consumeActiveSessionForAbandon
} from './session';

let bootstrapped = false;

function isAnalyticsEnabledFlag() {
  const raw = import.meta.env.VITE_ANALYTICS_ENABLED;
  return raw === undefined ? true : raw === 'true' || raw === true;
}

function isLocalDev() {
  return import.meta.env.DEV === true;
}

function isForceLocalEnabled() {
  const raw = import.meta.env.VITE_ANALYTICS_FORCE_LOCAL;
  return raw === 'true' || raw === true;
}

// Le tracking réel (envoi réseau) n'est actif que si : le coupe-circuit
// global est ouvert, ET (on n'est pas en dev local OU l'envoi local a été
// explicitement forcé). Le mode debug console fonctionne indépendamment.
function isSendingAllowed() {
  if (!isAnalyticsEnabledFlag()) return false;
  if (isLocalDev() && !isForceLocalEnabled()) return false;
  return true;
}

function hasMeasurementConsent() {
  return getConsent().measurement === true;
}

function trySendGA4(eventName, params) {
  if (isSendingAllowed() && hasMeasurementConsent() && getMeasurementId()) {
    try { sendGA4Event(eventName, params); } catch { /* ne jamais faire planter le jeu */ }
  }
}

function trySendClarityEvent(eventName) {
  if (isSendingAllowed() && hasMeasurementConsent() && getClarityProjectId()) {
    try { clarityEvent(eventName); } catch { /* ne jamais faire planter le jeu */ }
  }
}

function track(eventName, params) {
  debugLog(eventName, params);
  trySendGA4(eventName, params);
  trySendClarityEvent(eventName);
}

function startMeasurementTools() {
  if (!isSendingAllowed() || !hasMeasurementConsent()) return;
  try { initGA4(); } catch { /* jamais bloquant */ }
  try { initClarity(); } catch { /* jamais bloquant */ }
}

// À appeler une seule fois, au démarrage de l'app (src/main.jsx). Démarre
// GA4/Clarity si le consentement est déjà acquis, se branche sur les
// changements de consentement ultérieurs, et signale une éventuelle
// session de jeu précédente restée inachevée.
export function initTracking() {
  if (bootstrapped) return;
  bootstrapped = true;

  startMeasurementTools();
  onConsentChange((consent) => {
    if (consent.measurement === true) startMeasurementTools();
  });

  const unfinished = consumeUnfinishedPreviousSession();
  if (unfinished) {
    track('game_abandoned', {
      elapsed_seconds: unfinished.elapsedSeconds,
      progress_percent: unfinished.progressPercent,
      difficulty: unfinished.difficulty,
      mistake_count: unfinished.mistakeCount,
      hint_count: unfinished.hintCount,
      last_action_type: unfinished.lastActionType,
      abandon_reason: 'previous_session_unfinished'
    });
  }
}

// ── Contexte / navigation ──────────────────────────────────────────────
export function trackHomeViewed({ language, deviceType, referrerType }) {
  track('home_viewed', { language, device_type: deviceType, referrer_type: referrerType });
  clarityTag('language', language);
  clarityTag('device', deviceType);
}

export function trackGameSelected({ difficulty, contentType, puzzleId, language }) {
  track('game_selected', { difficulty, content_type: contentType, puzzle_id: puzzleId, language });
}

export function trackGameStarted({ difficulty, contentType, puzzleId, language, isCustomGame }) {
  track('game_started', {
    difficulty,
    content_type: contentType,
    puzzle_id: contentType === 'personal_image' ? undefined : puzzleId,
    language,
    is_custom_game: !!isCustomGame
  });
  clarityTag('difficulty', difficulty);
  clarityTag('content_type', contentType);
}

export function trackFirstMove({ difficulty, elapsedSeconds, inputMethod }) {
  track('first_move', { difficulty, elapsed_seconds: elapsedSeconds, input_method: inputMethod ?? 'unknown' });
}

export function trackGameProgress({ progressPercent, elapsedSeconds, difficulty, mistakeCount, hintCount, puzzleId, contentType }) {
  track('game_progress', {
    progress_percent: progressPercent,
    elapsed_seconds: elapsedSeconds,
    difficulty,
    mistake_count: mistakeCount,
    hint_count: hintCount,
    puzzle_id: contentType === 'personal_image' ? undefined : puzzleId
  });
}

export function trackMistakeMade({ mistakeNumber, elapsedSeconds, difficulty, progressPercent }) {
  track('mistake_made', { mistake_number: mistakeNumber, elapsed_seconds: elapsedSeconds, difficulty, progress_percent: progressPercent });
}

export function trackHintUsed({ hintNumber, elapsedSeconds, difficulty, progressPercent }) {
  track('hint_used', { hint_number: hintNumber, elapsed_seconds: elapsedSeconds, difficulty, progress_percent: progressPercent });
}

export function trackGameCompleted({ completionTimeSeconds, difficulty, mistakeCount, hintCount, puzzleId, contentType, language, wasResumed, imageFullyRevealed }) {
  track('game_completed', {
    completion_time_seconds: completionTimeSeconds,
    difficulty,
    mistake_count: mistakeCount,
    hint_count: hintCount,
    puzzle_id: contentType === 'personal_image' ? undefined : puzzleId,
    content_type: contentType,
    language,
    was_resumed: !!wasResumed,
    image_fully_revealed: !!imageFullyRevealed
  });
  clarityTag('game_result', 'completed');
}

export function trackRevealViewed({ contentType, puzzleId, difficulty, completionTimeSeconds }) {
  track('reveal_viewed', {
    content_type: contentType,
    puzzle_id: contentType === 'personal_image' ? undefined : puzzleId,
    difficulty,
    completion_time_seconds: completionTimeSeconds
  });
}

export function trackArtworkDetailsOpened({ puzzleId, artworkId, difficulty }) {
  track('artwork_details_opened', { puzzle_id: puzzleId, artwork_id: artworkId, difficulty });
}

export function trackShareClicked({ shareMethod, difficulty, contentType, puzzleId, completionTimeSeconds }) {
  track('share_clicked', {
    share_method: shareMethod,
    difficulty,
    content_type: contentType,
    puzzle_id: contentType === 'personal_image' ? undefined : puzzleId,
    completion_time_seconds: completionTimeSeconds
  });
}

// N'appeler que lorsque le succès est techniquement vérifiable (ex :
// Clipboard API résolue, Web Share API résolue). Ne jamais simuler un
// succès pour une action dont on ne peut pas confirmer l'issue (ex :
// ouverture d'une fenêtre WhatsApp externe).
export function trackShareCompleted({ shareMethod, puzzleId }) {
  track('share_completed', { share_method: shareMethod, puzzle_id: puzzleId });
}

export function trackNewGameClicked({ previousProgressPercent, previousCompleted, previousDifficulty }) {
  track('new_game_clicked', {
    previous_progress_percent: previousProgressPercent,
    previous_completed: !!previousCompleted,
    previous_difficulty: previousDifficulty
  });
}

// ── Abandon ─────────────────────────────────────────────────────────────
// reason: 'navigation' | 'new_game' | 'return_home' | 'unknown'
// (les valeurs 'session_expired' et 'previous_session_unfinished' sont
// gérées automatiquement par initTracking()).
export function trackGameAbandoned(sessionId, reason = 'unknown') {
  const snapshot = consumeActiveSessionForAbandon(sessionId);
  if (!snapshot) return; // déjà comptée, ou jamais démarrée : rien à faire
  track('game_abandoned', {
    elapsed_seconds: snapshot.elapsedSeconds,
    progress_percent: snapshot.progressPercent,
    difficulty: snapshot.difficulty,
    mistake_count: snapshot.mistakeCount,
    hint_count: snapshot.hintCount,
    last_action_type: snapshot.lastActionType,
    abandon_reason: reason
  });
  clarityTag('game_result', 'abandoned');
}

// ── Feedback ────────────────────────────────────────────────────────────
export function trackFeedbackOpened({ feedbackContext, progressPercent, difficulty }) {
  track('feedback_opened', { feedback_context: feedbackContext, progress_percent: progressPercent, difficulty });
}

// Ne jamais passer le texte libre du commentaire dans feedbackType/Context.
export function trackFeedbackSubmitted({ feedbackType, feedbackContext, progressPercent, difficulty }) {
  track('feedback_submitted', { feedback_type: feedbackType, feedback_context: feedbackContext, progress_percent: progressPercent, difficulty });
}

// ── Erreurs ─────────────────────────────────────────────────────────────
// errorType/errorCode : codes normalisés uniquement (ex: 'render_crash',
// 'supabase_request_failed'). Ne jamais transmettre error.message brut
// (peut contenir une URL, un jeton, un chemin de fichier...).
export function trackGameError({ errorType, errorLocation, errorCode, fatal, gameInProgress, progressPercent }) {
  track('app_error', {
    error_type: errorType,
    error_location: errorLocation,
    error_code: errorCode ?? 'unknown',
    fatal: !!fatal,
    game_in_progress: !!gameInProgress,
    progress_percent: progressPercent ?? null
  });
  clarityTag('had_error', 'true');
}

// Dérive un code d'erreur normalisé à partir d'un objet Error, sans jamais
// exposer error.message (peut contenir une URL, un jeton, un chemin local).
export function normalizeErrorCode(error) {
  if (!error) return 'unknown';
  const name = error.name || 'Error';
  return name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
}

// Isole le premier nom de composant d'un React componentStack, sans le
// reste de la trace (qui peut être long et n'apporte rien côté analytics).
export function firstComponentFromStack(componentStack) {
  if (!componentStack) return 'unknown';
  const match = componentStack.match(/in (\w+)/);
  return match ? match[1] : 'unknown';
}

// Écoute les erreurs JS et promesses non gérées qui ne passent pas par un
// ErrorBoundary React (ex : code hors composant, event handlers). Ne
// transmet jamais error.message ou l'URL du script en clair.
export function installGlobalErrorTracking({ isGameInProgress } = {}) {
  window.addEventListener('error', (event) => {
    trackGameError({
      errorType: 'js_error',
      errorLocation: 'window',
      errorCode: normalizeErrorCode(event.error),
      fatal: false,
      gameInProgress: isGameInProgress ? isGameInProgress() : false
    });
  });
  window.addEventListener('unhandledrejection', (event) => {
    trackGameError({
      errorType: 'unhandled_rejection',
      errorLocation: 'window',
      errorCode: normalizeErrorCode(event.reason),
      fatal: false,
      gameInProgress: isGameInProgress ? isGameInProgress() : false
    });
  });
}

export {
  generateGameSessionId,
  startGameSession,
  updateGameSessionSnapshot,
  getActiveGameSession,
  clearGameSession
};
