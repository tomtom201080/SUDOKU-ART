// src/lib/sharedPhoto.js
import { supabase } from './supabaseClient';

const BUCKET = 'sudoku-images';
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

export function getSharedPhotoPublicUrl(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl ?? null;
}

export function buildShareLink(path) {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('photo', path);
  return url.toString();
}

export function readSharedPhotoFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const path = params.get('photo');
  if (!path) return null;
  return { path, publicUrl: getSharedPhotoPublicUrl(path) };
}

export function clearSharedPhotoFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('photo');
  window.history.replaceState({}, '', url.toString());
}