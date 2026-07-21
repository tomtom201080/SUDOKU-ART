// scripts/_seo-render-entry.jsx
// Point d'entrée bundlé par esbuild (voir prerender-seo.mjs) : rend chaque
// page SEO en HTML statique via ReactDOMServer, puis écrit le résultat en
// JSON sur stdout. Séparé du script orchestrateur pour que React/JSX soient
// bundlés en un seul fichier autonome — évite les soucis d'interop
// CJS/ESM/instances multiples de React quand on charge des modules JSX à
// la volée depuis un script Node "nu".
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { SEO_PAGES } from '../src/seo/pages.jsx';
import SeoLandingPage from '../src/components/seo/SeoLandingPage.jsx';

const pages = SEO_PAGES.map(page => ({
  slug: page.slug,
  title: page.title,
  description: page.description,
  markup: renderToStaticMarkup(
    <StaticRouter location={`/${page.slug}`}>
      <SeoLandingPage page={page} />
    </StaticRouter>
  )
}));

process.stdout.write(JSON.stringify({ pages }));
