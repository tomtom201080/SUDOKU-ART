#!/usr/bin/env node
// scripts/prerender-seo.mjs
//
// Étape post-build : pour chaque page SEO (src/seo/pages.jsx), génère un
// vrai fichier HTML statique (dist/<slug>/index.html) avec ses propres
// title/description/canonical/OG/Twitter et son contenu réellement rendu
// dans le HTML — pas seulement posé en JS après coup. C'est nécessaire car
// l'app est une SPA sans SSR : sans ce script, les bots qui n'exécutent pas
// de JS (partage WhatsApp/Facebook/Twitter, certains crawlers) ne verraient
// que le <title>Sudoku Art</title> générique du template Vite.
//
// La page d'accueil ("/") n'est PAS re-rendue ici : c'est l'app de jeu
// elle-même (état complexe, Supabase, etc.), impossible et inutile à
// pré-rendre. On se contente d'y réécrire les balises <head> avec les
// metas de l'accueil, en laissant #root vide comme le produit `vite build`
// normalement — React s'en charge au chargement, comme avant.
//
// Le rendu React lui-même se fait dans un sous-processus séparé
// (_seo-render-entry.jsx, bundlé à la volée avec esbuild) plutôt que via
// `vite.ssrLoadModule` : ce dernier a un souci d'interop CJS/ESM avec
// React/react-router dans ce projet ("type": "module" + Vite 5), qui fait
// que StaticRouter et Link finissent par charger deux instances
// différentes de react-router (React Context ne fonctionne alors plus,
// useContext() renvoie null). Un bundle esbuild autonome élimine le
// problème : tout est résolu une seule fois, dans un seul scope.
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// `vite build` lit .env pour le bundle client (import.meta.env), mais ce
// script Node "nu" lancé juste après dans la même commande `npm run build`
// ne voit pas ces valeurs automatiquement (Node ne charge pas .env tout
// seul). En production sur Vercel, les variables d'environnement du projet
// sont déjà de vraies variables d'env du processus de build — ce chargement
// ne sert donc qu'au confort en local. N'écrase jamais une variable déjà
// présente dans l'environnement réel.
async function loadDotEnv() {
  try {
    const content = await fs.readFile(path.join(ROOT, '.env'), 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key] !== undefined) continue;
      process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
    }
  } catch {
    // pas de .env local (ex: build Vercel) : les vraies variables d'env prennent le relais
  }
}

await loadDotEnv();

const SITE_URL = (process.env.SITE_URL || 'https://sudoku-art.vercel.app').replace(/\/$/, '');
const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION || '';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const HOME_META = {
  title: 'Sudoku Art – Jouez au Sudoku et révélez une image cachée',
  description: "Jouez gratuitement au Sudoku, défiez vos amis et révélez progressivement une œuvre d'art, une photo ou un message caché derrière chaque grille.",
  path: '/'
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildMetaBlock({ title, description, canonicalPath }) {
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  return `
    <meta name="description" content="${d}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Sudoku Art" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />${GOOGLE_SITE_VERIFICATION ? `\n    <meta name="google-site-verification" content="${escapeHtml(GOOGLE_SITE_VERIFICATION)}" />` : ''}`;
}

function applyHead(template, { title, description, canonicalPath }) {
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(/<head>/, `<head>${buildMetaBlock({ title, description, canonicalPath })}`);
  return html;
}

// Bundle _seo-render-entry.jsx (React + react-router + les composants SEO)
// en un unique fichier autonome, puis l'exécute dans un sous-processus qui
// renvoie le HTML de chaque page en JSON sur stdout.
async function renderSeoPages() {
  // format: 'cjs' plutôt que 'esm' — le build CJS de react-dom/server fait
  // des require() de modules Node natifs (stream, util...) ; en sortie ESM,
  // le shim de require synthétisé par esbuild ne sait pas résoudre les
  // modules natifs ("Dynamic require of stream is not supported"). En CJS,
  // ces require() passent nativement à travers, sans shim.
  const bundlePath = path.join(os.tmpdir(), `sudoku-art-seo-render-${Date.now()}.cjs`);
  await build({
    entryPoints: [path.join(__dirname, '_seo-render-entry.jsx')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    jsx: 'automatic',
    outfile: bundlePath,
    logLevel: 'warning'
  });

  try {
    const stdout = execFileSync(process.execPath, [bundlePath], { encoding: 'utf-8' });
    return JSON.parse(stdout).pages;
  } finally {
    await fs.rm(bundlePath, { force: true });
  }
}

async function main() {
  const indexPath = path.join(DIST, 'index.html');
  const template = await fs.readFile(indexPath, 'utf-8');

  const pages = await renderSeoPages();

  // ── Accueil : on ne touche qu'au <head>, #root reste vide (l'app gère le reste) ──
  const homeHtml = applyHead(template, {
    title: HOME_META.title,
    description: HOME_META.description,
    canonicalPath: HOME_META.path
  });
  await fs.writeFile(indexPath, homeHtml, 'utf-8');
  console.log('✓ / (accueil) — metas mises à jour');

  // ── Pages SEO : head + contenu réellement rendu dans #root ──
  for (const page of pages) {
    let html = applyHead(template, {
      title: page.title,
      description: page.description,
      canonicalPath: `/${page.slug}`
    });
    html = html.replace('<div id="root"></div>', `<div id="root">${page.markup}</div>`);

    const outDir = path.join(DIST, page.slug);
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, 'index.html'), html, 'utf-8');
    console.log(`✓ /${page.slug} — généré`);
  }

  // ── Sitemap généré depuis la même source (jamais désynchronisé des routes réelles) ──
  const urls = [
    { loc: `${SITE_URL}/`, priority: '1.0' },
    ...pages.map(p => ({ loc: `${SITE_URL}/${p.slug}`, priority: '0.7' }))
  ];
  const today = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`)
    .join('\n')}\n</urlset>\n`;
  await fs.writeFile(path.join(DIST, 'sitemap.xml'), sitemap, 'utf-8');
  console.log(`✓ sitemap.xml — ${urls.length} URLs`);
}

main().catch(err => {
  console.error('✗ prerender-seo failed:', err);
  process.exit(1);
});
