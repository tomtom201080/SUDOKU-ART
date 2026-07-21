// src/lib/tracking/session.js
// Identifiant de tentative de partie (game_session_id) et détection
// d'abandon. Fonctions pures autant que possible (testées dans
// session.test.js) : la seule I/O est localStorage, isolée dans de petites
// fonctions dédiées.
//
// Limites connues (documentées aussi dans docs/analytics.md) :
// - la détection "session précédente non terminée" ne se déclenche qu'au
//   prochain chargement de l'app (fermeture d'onglet, crash, perte réseau
//   avant qu'une action explicite ne soit possible) : elle est donc décalée
//   dans le temps, jamais instantanée pour ce cas précis ;
// - un utilisateur qui vide son localStorage entre les deux perd ce signal ;
// - sur un appareil partagé entre plusieurs joueurs, une session non
//   terminée par la personne A peut être détectée comme abandon au
//   chargement suivant même si c'est la personne B qui a rouvert l'app.
const ACTIVE_SESSION_KEY = 'sudoku-art:activeGameSession';

export function generateGameSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `gs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function readSnapshot() {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.sessionId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSnapshot(snapshot) {
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(snapshot));
  } catch {
    // stockage indisponible : pas de détection d'abandon possible, tant pis
  }
}

function clearSnapshot() {
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {
    // rien à faire
  }
}

// Démarre le suivi d'une nouvelle tentative de partie. Doit être appelé une
// seule fois par partie réellement démarrée (grille affichée et jouable).
export function startGameSession({ sessionId, difficulty, contentType, puzzleId }) {
  writeSnapshot({
    sessionId,
    difficulty: difficulty ?? null,
    contentType: contentType ?? null,
    puzzleId: puzzleId ?? null,
    elapsedSeconds: 0,
    progressPercent: 0,
    mistakeCount: 0,
    hintCount: 0,
    lastActionType: 'none'
  });
}

// Met à jour l'instantané local (appelé périodiquement par l'observateur de
// partie : à chaque erreur, indice, ou seuil de progression franchi — pas à
// chaque frame, pour rester léger).
export function updateGameSessionSnapshot(partial) {
  const current = readSnapshot();
  if (!current) return;
  writeSnapshot({ ...current, ...partial });
}

export function getActiveGameSession() {
  return readSnapshot();
}

// Appelé quand une partie se termine normalement (victoire) : plus rien à
// détecter comme abandon pour cette tentative.
export function clearGameSession(sessionId) {
  const current = readSnapshot();
  if (current && current.sessionId === sessionId) clearSnapshot();
}

// Renvoie l'instantané d'une session précédente non terminée trouvée au
// démarrage de l'app (fermeture sans avoir fini), puis l'efface pour ne
// jamais la compter deux fois. Renvoie null s'il n'y a rien à signaler.
export function consumeUnfinishedPreviousSession() {
  const snapshot = readSnapshot();
  if (!snapshot) return null;
  clearSnapshot();
  return snapshot;
}

// Abandon explicite (retour menu, nouvelle partie, etc.) : renvoie
// l'instantané pour construire l'événement, et nettoie dans la foulée pour
// garantir qu'il ne sera jamais recompté (ni par un second déclencheur
// explicite, ni par la détection "session précédente" au prochain chargement).
export function consumeActiveSessionForAbandon(sessionId) {
  const snapshot = readSnapshot();
  if (!snapshot || snapshot.sessionId !== sessionId) return null;
  clearSnapshot();
  return snapshot;
}
