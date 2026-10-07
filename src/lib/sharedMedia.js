// src/lib/sharedMedia.js
// Pièce jointe "média" (photo OU vidéo) pour le mode partage et les défis —
// étend src/lib/sharedPhoto.js (photo perso existante) sans y toucher : les
// anciens défis avec photo_path continuent de fonctionner tels quels, cette
// table/bucket ne concernent que les NOUVELLES pièces jointes. Voir la
// migration 20261006212321_add_shared_media.sql.
import { supabase } from './supabaseClient';
import { getOrCreateDeviceToken } from './deviceToken';

const BUCKET = 'share-media';
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
export const MAX_VIDEO_SIZE_MB = 60;
export const MAX_VIDEO_DURATION_SECONDS = 90;
const ALLOWED_POSTER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_POSTER_SIZE_MB = 2;
// Une photo attachée directement (pas un poster extrait d'une vidéo) garde
// la même limite que l'ancien système (src/lib/sharedPhoto.js) : 10 Mo.
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_PHOTO_SIZE_MB = 10;

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function extensionFromFile(file) {
  const fromName = file.name?.split('.').pop();
  if (fromName && fromName.length <= 5 && /^[a-z0-9]+$/i.test(fromName)) return fromName.toLowerCase();
  if (file.type === 'video/quicktime') return 'mov';
  if (file.type === 'video/webm') return 'webm';
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return file.type?.startsWith('video/') ? 'mp4' : 'jpg';
}

// Upload direct en XMLHttpRequest (plutôt que supabase-js .upload(), basé
// sur fetch) : c'est le seul moyen d'obtenir une vraie progression
// (xhr.upload.onprogress) et une annulation (AbortController → xhr.abort())
// pour l'upload vidéo, demandés explicitement. Suit le protocole REST
// Storage documenté par Supabase (POST /storage/v1/object/<bucket>/<path>).
async function uploadToStorage(path, file, { onProgress, signal } = {}) {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token || anonKey;

  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${baseUrl}/storage/v1/object/${BUCKET}/${path}`, true);
    xhr.setRequestHeader('apikey', anonKey);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Échec de l'envoi (${xhr.status}).`));
    };
    xhr.onerror = () => reject(new Error("Erreur réseau pendant l'envoi."));
    xhr.onabort = () => reject(new DOMException('Envoi annulé.', 'AbortError'));
    if (signal) {
      if (signal.aborted) { xhr.abort(); return; }
      signal.addEventListener('abort', () => xhr.abort());
    }
    xhr.send(file);
  });

  return path;
}

// Poster (image de couverture) : toujours autorisé, même sans compte — même
// coût/risque qu'une photo perso aujourd'hui.
export async function uploadPosterBlob(blob, { onProgress, signal } = {}) {
  if (blob.size > MAX_POSTER_SIZE_MB * 1024 * 1024) {
    throw new Error(`Image de couverture trop lourde. Maximum : ${MAX_POSTER_SIZE_MB} Mo.`);
  }
  const type = blob.type && ALLOWED_POSTER_TYPES.includes(blob.type) ? blob.type : 'image/jpeg';
  const ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
  const file = blob instanceof File ? blob : new File([blob], `poster.${ext}`, { type });
  const path = `${getOrCreateDeviceToken()}/posters/${randomId()}.${ext}`;
  return uploadToStorage(path, file, { onProgress, signal });
}

// Copie une vignette externe (YouTube img.youtube.com, Vimeo i.vimeocdn.com
// — toutes deux CORS-friendly, vérifié) dans notre Storage : "Le poster est
// toujours une image stockée" (ne dépend jamais de la disponibilité/du CDN
// du site source).
export async function copyRemoteThumbnailToPoster(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Impossible de récupérer la vignette.');
  const blob = await res.blob();
  return uploadPosterBlob(blob);
}

// Fichier vidéo : réservé aux comptes connectés (vérifié aussi côté RPC
// create_shared_media, pas seulement ici) — un lien YouTube/Vimeo/direct
// reste lui accessible sans compte, voir detectVideoProvider ci-dessous.
export async function uploadVideoFile(file, { onProgress, signal } = {}) {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    throw new Error(`Format non supporté (${file.type || 'inconnu'}). Utilise un fichier MP4, MOV ou WebM.`);
  }
  if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
    throw new Error(`Vidéo trop lourde (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum : ${MAX_VIDEO_SIZE_MB} Mo.`);
  }
  const ext = extensionFromFile(file);
  const path = `${getOrCreateDeviceToken()}/videos/${randomId()}.${ext}`;
  return uploadToStorage(path, file, { onProgress, signal });
}

// Vérifie que le fichier est vraiment une image lisible (header magic
// bytes), comme sharedPhoto.js — une photo attachée via MediaPicker.jsx
// passe par ici plutôt que par uploadSharedPhoto() pour rester dans le même
// bucket que les posters vidéo (share-media), condition pour que
// getSharedMediaPublicUrl() reste la seule fonction de résolution d'URL
// pour tout ce qui passe par shared_media (jamais d'ambiguïté de bucket).
async function looksLikeImage(file) {
  if (file.type.includes('heic') || file.type.includes('heif')) return true;
  const header = await file.slice(0, 12).arrayBuffer();
  const arr = new Uint8Array(header);
  const isJpeg = arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF;
  const isPng = arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47;
  const isWebp = arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46;
  return isJpeg || isPng || isWebp;
}

// Photo attachée directement (pas un poster extrait d'une vidéo) — mêmes
// règles que l'ancien uploadSharedPhoto() (10 Mo, vérif magic bytes), mais
// dans le bucket share-media.
export async function uploadPhotoFile(file, { onProgress, signal } = {}) {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    throw new Error(`Format non supporté (${file.type}). Utilise une photo au format JPG, PNG ou WebP.`);
  }
  if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
    throw new Error(`Photo trop lourde (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum : ${MAX_PHOTO_SIZE_MB} Mo.`);
  }
  if (!(await looksLikeImage(file))) {
    throw new Error("Le fichier ne semble pas être une image valide.");
  }
  const ext = extensionFromFile(file);
  const path = `${getOrCreateDeviceToken()}/posters/${randomId()}.${ext}`;
  return uploadToStorage(path, file, { onProgress, signal });
}

export function getSharedMediaPublicUrl(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl ?? null;
}

export async function createSharedMedia({
  type, source, videoUrl = null, videoPath = null, provider = null,
  posterPath, durationSeconds = null, ratio = null
}) {
  const { data, error } = await supabase.rpc('create_shared_media', {
    p_type: type,
    p_source: source,
    p_video_url: videoUrl,
    p_video_path: videoPath,
    p_provider: provider,
    p_poster_path: posterPath,
    p_duration_seconds: durationSeconds,
    p_ratio: ratio,
    p_device_token: getOrCreateDeviceToken()
  });
  if (error) throw error;
  return data;
}

export async function fetchSharedMedia(id) {
  if (!id) return null;
  const { data, error } = await supabase.from('shared_media').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteSharedMedia(id) {
  const { error } = await supabase.rpc('delete_shared_media', { p_id: id, p_device_token: getOrCreateDeviceToken() });
  if (error) throw error;
}

export function reportSharedMedia(id, reason = null) {
  return supabase.rpc('report_shared_media', { p_id: id, p_device_token: getOrCreateDeviceToken(), p_reason: reason });
}

// Dashboard admin (PlatformStatsDashboard.jsx) uniquement — garde vérifiée
// côté RPC (is_platform_admin-style), pas seulement ici.
export async function fetchReportedSharedMedia() {
  const { data, error } = await supabase.rpc('get_reported_shared_media');
  if (error) throw error;
  return data ?? [];
}

export async function adminDeleteSharedMedia(id) {
  const { error } = await supabase.rpc('admin_delete_shared_media', { p_id: id });
  if (error) throw error;
}

// Fire-and-forget volontaire : un clic sur ▶ ne doit jamais attendre ce
// compteur, purement indicatif pour le KPI "taux de lecture".
export function incrementMediaPlay(id) {
  supabase.rpc('increment_shared_media_play', { p_id: id }).then(() => {}, () => {});
}

// ─── Détection de provider et URLs associées ────────────────────────────
const YOUTUBE_RE = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/i;
const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d+)/i;
const DIRECT_VIDEO_RE = /\.(mp4|webm)(\?.*)?$/i;

export function extractYoutubeId(url) {
  const m = url?.match(YOUTUBE_RE);
  return m ? m[1] : null;
}

export function extractVimeoId(url) {
  const m = url?.match(VIMEO_RE);
  return m ? m[1] : null;
}

// Renvoie 'youtube' | 'vimeo' | 'direct' | null (lien non reconnu/invalide).
export function detectVideoProvider(url) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  if (extractYoutubeId(url)) return 'youtube';
  if (extractVimeoId(url)) return 'vimeo';
  if (DIRECT_VIDEO_RE.test(url)) return 'direct';
  return null;
}

export function youtubeThumbnailUrl(id) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function youtubeEmbedUrl(id) {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`;
}

export function vimeoEmbedUrl(id) {
  return `https://player.vimeo.com/video/${id}?autoplay=1&playsinline=1`;
}

// oEmbed Vimeo (supporte CORS nativement, pas de clé API requise) : donne la
// vignette officielle + durée/ratio sans avoir à charger la vidéo elle-même.
export async function fetchVimeoOEmbed(url) {
  const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error('Vidéo Vimeo introuvable ou privée.');
  return res.json(); // { thumbnail_url, duration, width, height, ... }
}

// Résout la source de lecture d'un média vidéo (ligne shared_media) pour
// VideoPlayerOverlay.jsx : soit un <iframe> (YouTube/Vimeo intégré), soit un
// <video> direct (lien .mp4/.webm, ou fichier uploadé chez nous).
export function resolvePlaybackSource(media) {
  if (!media || media.type !== 'video') return null;
  if (media.provider === 'youtube') {
    const id = extractYoutubeId(media.video_url);
    return id ? { kind: 'iframe', url: youtubeEmbedUrl(id) } : null;
  }
  if (media.provider === 'vimeo') {
    const id = extractVimeoId(media.video_url);
    return id ? { kind: 'iframe', url: vimeoEmbedUrl(id) } : null;
  }
  if (media.provider === 'direct') {
    return media.video_url ? { kind: 'video', url: media.video_url } : null;
  }
  if (media.provider === 'storage') {
    const url = getSharedMediaPublicUrl(media.video_path);
    return url ? { kind: 'video', url } : null;
  }
  return null;
}
