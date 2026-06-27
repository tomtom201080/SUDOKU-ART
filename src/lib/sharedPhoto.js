// src/lib/sharedPhoto.js
import { supabase } from './supabaseClient';

export const BUCKET = 'sudoku-images';
const SHARED_FOLDER = 'shared';
export const SHARE_EXPIRY_DAYS = 7;

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function extensionFromFile(file) {
  const fromName = file.name?.split('.').pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return 'jpg';
}

// Téléverse la photo choisie vers Supabase Storage, dans un dossier dédié aux
// photos partagées par lien. Retourne le chemin de stockage (pas l'URL
// publique complète, pour garder le lien plus court).
export async function uploadSharedPhoto(file) {
  const ext = extensionFromFile(file);
  const path = `${SHARED_FOLDER}/${randomId()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || 'image/jpeg',
    upsert: false
  });

  if (error) throw error;
  return path;
}

// Construit l'URL publique Supabase à partir d'un chemin de stockage.
export function getSharedPhotoPublicUrl(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl ?? null;
}

// Construit le lien complet de l'appli, avec le chemin de la photo partagée
// encodé en paramètre d'URL.
export function buildShareLink(path) {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('photo', path);
  return url.toString();
}

// Lit le paramètre "photo" de l'URL actuelle (s'il existe), pour savoir si la
// page a été ouverte via un lien de partage reçu d'un ami.
export function readSharedPhotoFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const path = params.get('photo');
  if (!path) return null;
  return { path, publicUrl: getSharedPhotoPublicUrl(path) };
}

// Retire le paramètre "photo" de l'URL affichée dans la barre d'adresse, sans
// recharger la page, une fois la photo partagée prise en compte.
export function clearSharedPhotoFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('photo');
  window.history.replaceState({}, '', url.toString());
}
