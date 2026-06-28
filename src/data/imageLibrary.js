// src/data/imageLibrary.js
// Gère la bibliothèque d'images : chargement du manifeste, tirage aléatoire
// pour le filigrane en jeu, et déblocage selon la difficulté (= rareté).
// Les tableaux ne sont plus organisés par saison : un seul groupe, trié
// uniquement par rareté (commune / rare / légendaire).
import { getPaintingMetadata } from './paintingsIndex';

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

// Charge le manifeste des images depuis /public/images/manifest.json
// Format attendu :
// {
//   "tableaux": { "commune": ["id-a", ...], "rare": [...], "legendaire": [...] }
// }
export async function loadManifest() {
  try {
    const res = await fetch('/images/manifest.json');
    if (!res.ok) throw new Error('manifest introuvable');
    return await res.json();
  } catch (err) {
    console.warn('Impossible de charger le manifeste des images :', err);
    return { tableaux: { commune: [], rare: [], legendaire: [] } };
  }
}

// Si le tableau a une URL externe renseignée (imageUrl), on l'utilise telle
// quelle (image hébergée ailleurs, ex. Wikimedia Commons). Sinon, on utilise
// le fichier local attendu dans public/images/{tier}/.
export function resolveImagePath(tier, metadata, fallbackId) {
  if (metadata?.imageUrl) return metadata.imageUrl;
  const filename = metadata?.file ?? `${fallbackId}.jpg`;
  return `/images/${tier}/${filename}`;
}

// Construit une liste plate { id, tier, path, ...métadonnées } de toutes les
// images disponibles, toutes raretés confondues.
export function listAllImages(manifest) {
  const groups = manifest.tableaux || {};
  const images = [];
  for (const tier of Object.keys(groups)) {
    for (const paintingId of groups[tier]) {
      const metadata = getPaintingMetadata(paintingId);
      images.push({
        id: paintingId,
        tier,
        path: resolveImagePath(tier, metadata, paintingId),
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

// Tire une image pour une rareté donnée, en évitant si possible les
// tableaux déjà vus (sauf si tous ceux de cette rareté l'ont déjà été,
// auquel cas on recommence à en proposer).
export function pickImageForTier(manifest, tier, alreadyUnlockedIds = []) {
  const inTier = listAllImages(manifest).filter(img => img.tier === tier);
  const unseenInTier = inTier.filter(img => !alreadyUnlockedIds.includes(img.id));
  const pool = unseenInTier.length > 0 ? unseenInTier : inTier;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Tire l'image à révéler pour une difficulté donnée (= rareté). C'est cette
// même image qui sert de filigrane pendant la partie ET de récompense
// affichée à la victoire : il n'y a plus deux tirages séparés.
export function pickRewardImage(manifest, difficulty, alreadyUnlockedIds = []) {
  const tier = TIERS_BY_DIFFICULTY[difficulty] ?? 'commune';
  return pickImageForTier(manifest, tier, alreadyUnlockedIds);
}
