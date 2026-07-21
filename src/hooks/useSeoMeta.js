// src/hooks/useSeoMeta.js
// Synchronise title/description/canonical/OG/Twitter/lang côté client à
// chaque changement de route. Les bots qui n'exécutent pas de JS (partage
// WhatsApp/Facebook/Twitter, certains crawlers) voient eux le HTML déjà
// correct généré par scripts/prerender-seo.mjs — ce hook couvre la
// navigation interne (SPA) et le rendu par Google (qui exécute le JS).
import { useEffect } from 'react';

export const SITE_URL = 'https://sudoku-art.vercel.app';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

function upsertMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// path : chemin absolu ("/", "/sudoku-facile"...) utilisé pour la canonical.
export function useSeoMeta({ title, description, path = '/', image = DEFAULT_OG_IMAGE, lang = 'fr' }) {
  useEffect(() => {
    if (title) document.title = title;
    document.documentElement.lang = lang;

    const canonicalUrl = `${SITE_URL}${path}`;
    if (description) upsertMeta('name', 'description', description);
    upsertLink('canonical', canonicalUrl);

    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', 'Sudoku Art');
    if (title) upsertMeta('property', 'og:title', title);
    if (description) upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', image);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    if (title) upsertMeta('name', 'twitter:title', title);
    if (description) upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image);
  }, [title, description, path, image, lang]);
}
