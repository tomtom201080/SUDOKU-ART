// src/utils/storage.js
// Persistance locale (localStorage) de la galerie débloquée et des statistiques.
// Aucune donnée ne quitte l'appareil : pas besoin de backend pour cette V1.

const GALLERY_KEY = 'sudoku-devoile:gallery';
const STATS_KEY = 'sudoku-devoile:stats';

export function getUnlockedGallery() {
  try {
    const raw = localStorage.getItem(GALLERY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Ajoute une image débloquée à la galerie (avec horodatage), sans doublon d'entrée
// pour le même tirage (mais une même image peut être débloquée plusieurs fois,
// on garde alors plusieurs entrées avec des dates différentes).
export function addToGallery(image, meta = {}) {
  const gallery = getUnlockedGallery();
  const entry = {
    ...image,
    unlockedAt: new Date().toISOString(),
    difficulty: meta.difficulty ?? null
  };
  gallery.push(entry);
  localStorage.setItem(GALLERY_KEY, JSON.stringify(gallery));
  return gallery;
}

export function getUnlockedIds() {
  return getUnlockedGallery().map(img => img.id);
}

export function getStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw
      ? JSON.parse(raw)
      : { moyen: 0, complique: 0, enfer: 0, total: 0 };
  } catch {
    return { moyen: 0, complique: 0, enfer: 0, total: 0 };
  }
}

export function recordWin(difficulty) {
  const stats = getStats();
  stats[difficulty] = (stats[difficulty] ?? 0) + 1;
  stats.total = (stats.total ?? 0) + 1;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return stats;
}
