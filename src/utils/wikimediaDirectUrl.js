// src/utils/wikimediaDirectUrl.js
// Résout une URL Wikimedia Commons "Special:FilePath" (celles utilisées comme
// imageUrl dans src/data/paintings.json — les 49 œuvres de la bibliothèque
// sont TOUTES hébergées ainsi, aucune n'est en local) vers son URL directe
// upload.wikimedia.org.
//
// Nécessaire partout où le code lit le CONTENU de l'image depuis le
// navigateur (fetch().blob() pour la partager/l'envoyer, <img crossorigin>
// pour l'exporter via <canvas>) plutôt que de simplement l'afficher (une
// <img> ou un background-image CSS sans crossOrigin n'a jamais ce problème,
// c'est pour ça que l'affichage en jeu marche très bien) :
// Special:FilePath répond par une redirection (302 puis 301) qui, elle, ne
// porte AUCUN en-tête Access-Control-Allow-Origin — le contrôle CORS échoue
// donc dès ce premier saut, avant même d'atteindre la réponse finale
// upload.wikimedia.org qui, elle, porte bien ACAO: *. On passe donc par
// l'API MediaWiki (qui supporte CORS nativement via origin=*, un seul saut,
// pas de redirection) pour obtenir directement l'URL finale.
const FILE_PATH_PREFIX = 'https://commons.wikimedia.org/wiki/Special:FilePath/';

export function isWikimediaFilePathUrl(url) {
  return typeof url === 'string' && url.startsWith(FILE_PATH_PREFIX);
}

// Mémoïse par URL (module-level) : plusieurs appels pour la même œuvre dans
// la même session ne redemandent pas l'API à chaque fois.
const cache = new Map();

// Retourne l'URL directe (utilisable avec crossOrigin="anonymous" / fetch())
// si `url` est une URL Special:FilePath, sinon `url` tel quel (image locale,
// déjà same-origin, ou déjà une URL directe). En cas d'échec de résolution
// (API indisponible...), retombe sur l'URL d'origine plutôt que d'échouer —
// l'appelant verra alors la même erreur CORS qu'avant cette résolution, pas
// une erreur nouvelle.
export function resolveWikimediaDirectUrl(url) {
  if (!isWikimediaFilePathUrl(url)) return Promise.resolve(url);
  if (cache.has(url)) return cache.get(url);

  const filename = decodeURIComponent(url.slice(FILE_PATH_PREFIX.length).split('?')[0]);
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(`File:${filename}`)}&prop=imageinfo&iiprop=url&format=json&origin=*`;

  const promise = fetch(apiUrl)
    .then(res => res.json())
    .then(json => {
      const pages = json?.query?.pages ?? {};
      const page = Object.values(pages)[0];
      return page?.imageinfo?.[0]?.url || url;
    })
    .catch(() => url);

  cache.set(url, promise);
  return promise;
}
