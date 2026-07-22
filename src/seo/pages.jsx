// src/seo/pages.jsx
// Source unique de vérité pour les pages SEO, toutes langues confondues.
// Consommée par les routes React (client), par SiteFooter (maillage
// interne), et par scripts/prerender-seo.mjs (génère le HTML statique +
// sitemap.xml avec hreflang). Toute page ajoutée ici apparaît
// automatiquement partout — jamais besoin de dupliquer une URL à la main.
import { LANGUAGES, DEFAULT_LANG, PAGE_SLUGS, localizedPath } from './languages.js';
import { PAGES as PAGES_FR } from './content/fr.jsx';
import { PAGES as PAGES_EN } from './content/en.jsx';
import { PAGES as PAGES_DE } from './content/de.jsx';
import { PAGES as PAGES_ES } from './content/es.jsx';
import { PAGES as PAGES_ZH } from './content/zh.jsx';

export { LANGUAGES, DEFAULT_LANG, PAGE_SLUGS, localizedPath };

const CONTENT_BY_LANG = { fr: PAGES_FR, en: PAGES_EN, de: PAGES_DE, es: PAGES_ES, zh: PAGES_ZH };

export function getPagesForLang(lang) {
  return CONTENT_BY_LANG[lang] ?? CONTENT_BY_LANG[DEFAULT_LANG];
}

export function getSeoPage(lang, slug) {
  return getPagesForLang(lang).find(p => p.key === slug) ?? null;
}

// Une entrée par combinaison langue × page, avec le chemin final déjà
// calculé — sert à la fois à générer les <Route> (main.jsx) et à générer
// le sitemap + le pré-rendu statique (scripts/prerender-seo.mjs).
export function getAllSeoRoutes() {
  const routes = [];
  for (const { code } of LANGUAGES) {
    for (const page of getPagesForLang(code)) {
      routes.push({ lang: code, slug: page.key, path: localizedPath(code, page.key), page });
    }
  }
  return routes;
}

// Pour un couple (langue, slug) donné, les URLs équivalentes dans toutes
// les autres langues — sert au hreflang et au sélecteur de langue affiché
// sur chaque page SEO.
export function getAlternates(slug) {
  return LANGUAGES.map(({ code }) => ({ lang: code, path: localizedPath(code, slug) }));
}
