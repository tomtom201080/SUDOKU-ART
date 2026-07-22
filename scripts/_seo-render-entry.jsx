// scripts/_seo-render-entry.jsx
// Point d'entrée bundlé par esbuild (voir prerender-seo.mjs) : rend chaque
// page SEO (une par combinaison langue × page) en HTML statique via
// ReactDOMServer, puis écrit le résultat en JSON sur stdout. Séparé du
// script orchestrateur pour que React/JSX soient bundlés en un seul
// fichier autonome — évite les soucis d'interop CJS/ESM/instances
// multiples de React quand on charge des modules JSX à la volée depuis un
// script Node "nu".
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { getAllSeoRoutes, getAlternates, DEFAULT_LANG, localizedPath } from '../src/seo/pages.jsx';
import { getLanguage } from '../src/seo/languages.js';
import SeoLandingPage from '../src/components/seo/SeoLandingPage.jsx';

const routes = getAllSeoRoutes();

const pages = routes.map(({ path, lang, page }) => {
  const alternates = getAlternates(page.key).map(a => ({ hreflang: a.lang, path: a.path }));
  alternates.push({ hreflang: 'x-default', path: localizedPath(DEFAULT_LANG, page.key) });

  return {
    path,
    lang,
    dir: getLanguage(lang).dir,
    title: page.title,
    description: page.description,
    alternates,
    markup: renderToStaticMarkup(
      <StaticRouter location={path}>
        <SeoLandingPage page={page} lang={lang} />
      </StaticRouter>
    )
  };
});

process.stdout.write(JSON.stringify({ pages }));
