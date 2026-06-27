// src/data/imageLibrary.js
// Gère la bibliothèque d'images : saison courante, chargement du manifeste,
// tirage aléatoire pour le filigrane en jeu, et déblocage selon la difficulté.
import { getPaintingMetadata } from './paintingsIndex';

export const SEASONS = ['printemps', 'ete', 'automne', 'hiver'];

export const TIERS_BY_DIFFICULTY = {
  facile: 'commune',
  moyen: 'commune',
  complique: 'rare',
  enfer: 'legendaire'
};

export const TIER_LABELS = {
  commune: 'Commune',
  rare: 'Rare',
  legendaire: 'Légendaire'
};

export const SEASON_LABELS = {
  printemps: 'Printemps',
  ete: 'Été',
  automne: 'Automne',
  hiver: 'Hiver'
};

// Détermine la saison actuelle (hémisphère nord) à partir de la date du jour.
export function getCurrentSeason(date = new Date()) {
  const month = date.getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'printemps';
  if (month >= 6 && month <= 8) return 'ete';
  if (month >= 9 && month <= 11) return 'automne';
  return 'hiver';
}

// Charge le manifeste des images depuis /public/images/manifest.json
// Format attendu :
// {
//   "printemps": { "commune": ["a.jpg"], "rare": ["b.jpg"], "legendaire": ["c.jpg"] },
//   "ete": { ... }, "automne": { ... }, "hiver": { ... }
// }
export async function loadManifest() {
  try {
    const res = await fetch('/images/manifest.json');
    if (!res.ok) throw new Error('manifest introuvable');
    return await res.json();
  } catch (err) {
    console.warn('Impossible de charger le manifeste des images :', err);
    return { printemps: {}, ete: {}, automne: {}, hiver: {} };
  }
}

// Si le tableau a une URL externe renseignée (imageUrl), on l'utilise telle
// quelle (image hébergée ailleurs, ex. Wikimedia Commons). Sinon, on utilise
// le fichier local attendu dans public/images/.
function resolveImagePath(season, tier, metadata, fallbackId) {
  if (metadata?.imageUrl) return metadata.imageUrl;
  const filename = metadata?.file ?? `${fallbackId}.jpg`;
  return `/images/${season}/${tier}/${filename}`;
}

// Construit une liste plate { id, season, tier, path } pour toutes les images
// d'une saison donnée (toutes tiers confondus), utile pour le filigrane en jeu.
export function listImagesForSeason(manifest, season) {
  const seasonData = manifest[season] || {};
  const images = [];
  for (const tier of Object.keys(seasonData)) {
    for (const paintingId of seasonData[tier]) {
      const metadata = getPaintingMetadata(paintingId);
      images.push({
        id: `${season}/${tier}/${paintingId}`,
        season,
        tier,
        path: resolveImagePath(season, tier, metadata, paintingId),
        title: metadata?.title ?? null,
        artist: metadata?.artist ?? null,
        year: metadata?.year ?? null,
        style: metadata?.style ?? null,
        museum: metadata?.museum ?? null,
        city: metadata?.city ?? null,
        country: metadata?.country ?? null,
        technique: metadata?.technique ?? null,
        theme: metadata?.theme ?? null,
        funFact: metadata?.funFact ?? null,
        observe: metadata?.observe ?? null
      });
    }
  }
  return images;
}

// Liste les images de toutes les saisons (toutes confondues), pour le cas où
// la saison courante serait vide.
export function listAllImages(manifest) {
  let images = [];
  for (const season of SEASONS) {
    images = images.concat(listImagesForSeason(manifest, season));
  }
  return images;
}

// Tire une image au hasard pour le filigrane de la partie en cours.
// Priorité à la saison courante ; si elle est vide, on retombe sur toutes les images.
export function pickWatermarkImage(manifest, season) {
  let pool = listImagesForSeason(manifest, season);
  if (pool.length === 0) pool = listAllImages(manifest);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Tire une image à débloquer selon la difficulté (= rareté), en favorisant
// la saison courante et en évitant les doublons déjà débloqués si possible.
export function pickRewardImage(manifest, season, difficulty, alreadyUnlockedIds = []) {
  const tier = TIERS_BY_DIFFICULTY[difficulty] ?? 'commune';

  const inSeasonTier = listImagesForSeason(manifest, season).filter(img => img.tier === tier);
  const unseenInSeasonTier = inSeasonTier.filter(img => !alreadyUnlockedIds.includes(img.id));

  let pool = unseenInSeasonTier.length > 0 ? unseenInSeasonTier : inSeasonTier;

  if (pool.length === 0) {
    // Saison vide pour ce tier : on cherche ce tier dans toutes les saisons.
    const allTier = listAllImages(manifest).filter(img => img.tier === tier);
    const unseenAllTier = allTier.filter(img => !alreadyUnlockedIds.includes(img.id));
    pool = unseenAllTier.length > 0 ? unseenAllTier : allTier;
  }

  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
