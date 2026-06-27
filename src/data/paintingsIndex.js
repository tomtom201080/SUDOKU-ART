// src/data/paintingsIndex.js
import paintings from './paintings.json';

// Indexe les métadonnées par nom de fichier, pour un accès rapide depuis
// n'importe quelle image listée dans le manifeste.
const byFile = new Map(paintings.map(p => [p.file, p]));

export function getPaintingMetadata(filename) {
  return byFile.get(filename) ?? null;
}

export { paintings };
