// src/data/paintingsIndex.js
import paintings from './paintings.json';

// Indexe les métadonnées par identifiant (id), la clé stable utilisée dans le
// manifeste, indépendante du nom de fichier ou de l'URL de l'image elle-même.
const byId = new Map(paintings.map(p => [p.id, p]));

export function getPaintingMetadata(id) {
  return byId.get(id) ?? null;
}

export { paintings };
