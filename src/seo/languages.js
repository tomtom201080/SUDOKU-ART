// src/seo/languages.js
// Langues disponibles pour les pages SEO dédiées (src/seo/pages.jsx).
// Indépendant du système i18n runtime de l'app (src/i18n) : ces pages sont
// pré-rendues statiquement (scripts/prerender-seo.mjs), chacune sur sa
// propre URL — nécessaire pour un hreflang correct et pour que chaque
// langue soit indexée séparément par les moteurs de recherche.
export const LANGUAGES = [
  { code: 'fr', htmlLang: 'fr', dir: 'ltr', label: 'Français' },
  { code: 'en', htmlLang: 'en', dir: 'ltr', label: 'English' },
  { code: 'de', htmlLang: 'de', dir: 'ltr', label: 'Deutsch' },
  { code: 'es', htmlLang: 'es', dir: 'ltr', label: 'Español' },
  { code: 'zh', htmlLang: 'zh', dir: 'ltr', label: '中文' }
];

// Langue par défaut : seule à ne pas être préfixée dans l'URL
// (/sudoku-facile au lieu de /fr/sudoku-facile), pour ne pas casser les
// liens déjà indexés/partagés depuis la mise en ligne initiale.
export const DEFAULT_LANG = 'fr';

export function getLanguage(code) {
  return LANGUAGES.find(l => l.code === code) ?? LANGUAGES.find(l => l.code === DEFAULT_LANG);
}

export function localizedPath(lang, slug) {
  return lang === DEFAULT_LANG ? `/${slug}` : `/${lang}/${slug}`;
}

// Slugs partagés entre toutes les langues (même page, même URL relative,
// seul le préfixe de langue change) — évite de gérer un mapping de slugs
// traduits par langue, complexité non nécessaire à ce stade.
export const PAGE_SLUGS = [
  'comment-ca-marche',
  'creer-un-defi-sudoku',
  'sudoku-gratuit',
  'sudoku-facile',
  'sudoku-difficile',
  'sudoku-expert',
  'sudoku-image-cachee',
  'sudoku-art'
];
