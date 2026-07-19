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
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_FILE_SIZE_MB = 10;

// Valide et uploade une photo. Renvoie une erreur explicite si le fichier
// est trop grand, pas une image, ou a un type MIME non autorisé.
export async function uploadSharedPhoto(file) {
  // 1. Type MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Format non supporté (${file.type}). Utilise une photo au format JPG, PNG ou WebP.`);
  }

  // 2. Taille
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error(`Photo trop lourde (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum : ${MAX_FILE_SIZE_MB} Mo.`);
  }

  // 3. Vérification que c'est vraiment une image lisible (header magic bytes)
  const isImage = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target.result);
      // JPEG: FF D8 FF | PNG: 89 50 4E 47 | WebP: 52 49 46 46
      const isJpeg = arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF;
      const isPng = arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47;
      const isWebp = arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46;
      resolve(isJpeg || isPng || isWebp || file.type.includes('heic') || file.type.includes('heif'));
    };
    reader.readAsArrayBuffer(file.slice(0, 12));
  });

  if (!isImage) {
    throw new Error("Le fichier ne semble pas être une image valide.");
  }

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
