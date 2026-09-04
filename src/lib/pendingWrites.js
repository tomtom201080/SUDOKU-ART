// src/lib/pendingWrites.js
// File d'attente locale (localStorage) pour les écritures CRITIQUES qui ne
// doivent jamais se perdre si elles échouent au moment où une partie se
// termine — surtout hors ligne : marquer un défi/rematch comme
// terminé/perdu, soumettre le résultat d'un "même grille" (perso ou
// groupe). Avant cette file, un résultat envoyé hors ligne disparaissait
// purement et simplement (promesse jamais retentée) : l'expéditeur du défi
// ne le voyait jamais, le défi restait bloqué "en attente" pour toujours.
//
// writeOrQueue(type, payload) tente l'écriture immédiatement ; si elle
// échoue (hors ligne, erreur réseau...), l'appel est mémorisé pour être
// retenté plus tard par flushPendingWrites() — appelée au retour de
// connexion et à chaque démarrage de l'appli (voir App.jsx).
import { markChallengeCompleted } from './challenges';
import { submitRematchResult, submitGroupResult, updateChallengerBaseline } from './rematches';

const QUEUE_KEY = 'sudoku-devoile:pendingWrites';
// ~20 tentatives (au retour en ligne + à chaque démarrage d'appli) avant
// d'abandonner : un résultat qu'on n'arrive toujours pas à envoyer après ça
// ne le sera probablement jamais (ex. défi supprimé entre-temps), pas la
// peine de garder la file indéfiniment.
const MAX_ATTEMPTS = 20;

// Chaque type correspond à un vrai appel réseau, reconstruit à partir du
// payload minimal mémorisé (jamais l'état complet du jeu, juste ce qu'il
// faut pour rejouer l'écriture).
const HANDLERS = {
  challenge_completed: (p) => markChallengeCompleted(p.challengeId, p.result),
  rematch_result: (p) => submitRematchResult(p.rematchId, p.data),
  group_result: (p) => submitGroupResult(p.rematchId, p.data),
  challenger_baseline: (p) => updateChallengerBaseline(p.rematchId, p.data)
};

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Stockage indisponible (mode privé plein, quota dépassé...) : rien de
    // plus à faire, l'écriture reste simplement perdue comme avant cette file.
  }
}

function enqueue(type, payload) {
  const queue = readQueue();
  queue.push({
    id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
    type,
    payload,
    attempts: 0,
    createdAt: Date.now()
  });
  writeQueue(queue);
}

// Tente immédiatement l'écriture ; si elle échoue, la mémorise pour
// retenter plus tard au lieu de la perdre. Ne rejette jamais : une écriture
// secondaire ne doit jamais faire planter la partie. Retourne true si
// l'écriture a réussi tout de suite, false si elle a été mise en file.
export async function writeOrQueue(type, payload) {
  const handler = HANDLERS[type];
  if (!handler) return true;
  try {
    await handler(payload);
    return true;
  } catch {
    enqueue(type, payload);
    return false;
  }
}

// Retente toutes les écritures en attente. Chaque entrée qui réussit est
// retirée de la file ; celle qui échoue encore incrémente son compteur de
// tentatives et y reste (jusqu'à MAX_ATTEMPTS).
export async function flushPendingWrites() {
  const queue = readQueue();
  if (queue.length === 0) return;

  const remaining = [];
  for (const entry of queue) {
    const handler = HANDLERS[entry.type];
    if (!handler) continue; // type inconnu (ex. ancienne version de l'appli) : abandonné

    try {
      await handler(entry.payload);
    } catch {
      const attempts = (entry.attempts ?? 0) + 1;
      if (attempts < MAX_ATTEMPTS) {
        remaining.push({ ...entry, attempts });
      }
    }
  }
  writeQueue(remaining);
}

// Nombre d'écritures en attente — utilisable pour un futur indicateur visuel
// ("3 résultats en attente d'envoi").
export function getPendingWritesCount() {
  return readQueue().length;
}
