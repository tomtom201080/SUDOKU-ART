// src/components/seo/JsonLd.jsx
// Injecte des données structurées JSON-LD. Rendu via <script type="application/ld+json">,
// safe côté serveur (renderToStaticMarkup) comme côté client — aucune donnée inventée,
// uniquement des faits vérifiables sur l'app (nom, URL, catégorie, prix, langues).
import { SITE_URL } from '../../hooks/useSeoMeta';

export function WebSiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sudoku Art',
    url: SITE_URL,
    inLanguage: ['fr', 'en']
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function WebApplicationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Sudoku Art',
    url: SITE_URL,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    inLanguage: ['fr', 'en']
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

// items : [{ name, path }] — path relatif ("/", "/sudoku-facile"...)
export function BreadcrumbJsonLd({ items }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`
    }))
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
