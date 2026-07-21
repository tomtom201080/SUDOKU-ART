// src/components/seo/SeoLandingPage.jsx
// Layout partagé par toutes les pages SEO (src/seo/pages.jsx) : un seul H1,
// meta tags + JSON-LD, contenu réel visible sans JS (voir
// scripts/prerender-seo.mjs), lien de retour au jeu et footer de maillage
// interne. Pas de useT() ici : contenu français fixe, voir la note dans
// src/seo/pages.jsx sur ce choix d'architecture.
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSeoMeta } from '../../hooks/useSeoMeta';
import { WebApplicationJsonLd, BreadcrumbJsonLd } from './JsonLd';
import SiteFooter from '../SiteFooter';
import './SeoLandingPage.css';

const DARK_MODE_KEY = 'sudoku-devoile:darkMode';

export default function SeoLandingPage({ page }) {
  useSeoMeta({ title: page.title, description: page.description, path: `/${page.slug}` });

  useEffect(() => {
    try {
      document.body.classList.toggle('dark', localStorage.getItem(DARK_MODE_KEY) === 'true');
    } catch {
      // stockage indisponible : on reste en thème clair par défaut
    }
  }, []);

  const { Content } = page;

  return (
    <div className="seo-page">
      <WebApplicationJsonLd />
      <BreadcrumbJsonLd items={[{ name: 'Accueil', path: '/' }, { name: page.navLabel, path: `/${page.slug}` }]} />

      <header className="seo-page-header">
        <Link to="/" className="seo-page-brand">
          <img src="/favicon.svg" alt="" className="seo-page-logo" width="28" height="28" />
          Sudoku Art
        </Link>
        <Link to="/" className="seo-page-play-link">Jouer</Link>
      </header>

      <main className="seo-page-main">
        <p className="seo-breadcrumb"><Link to="/">Accueil</Link> / {page.navLabel}</p>

        <h1>{page.h1}</h1>
        <p className="seo-page-intro">{page.intro}</p>

        <Link to={page.cta.href} className="seo-page-cta">{page.cta.label}</Link>

        <div className="seo-page-content">
          <Content />
        </div>

        <Link to={page.cta.href} className="seo-page-cta seo-page-cta-bottom">{page.cta.label}</Link>
      </main>

      <SiteFooter />
    </div>
  );
}
