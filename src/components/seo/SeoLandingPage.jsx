// src/components/seo/SeoLandingPage.jsx
// Layout partagé par toutes les pages SEO (src/seo/pages.jsx) : un seul H1,
// meta tags + hreflang + JSON-LD, contenu réel visible sans JS (voir
// scripts/prerender-seo.mjs), sélecteur de langue, lien de retour au jeu
// et footer de maillage interne. Pas de useT() ici : contenu en dur par
// langue (src/seo/content/*.jsx), voir la note dans src/seo/pages.jsx sur
// ce choix d'architecture (pages pré-rendues côté Node, sans accès à
// localStorage/navigator).
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSeoMeta, SITE_URL } from '../../hooks/useSeoMeta';
import { WebApplicationJsonLd, BreadcrumbJsonLd } from './JsonLd';
import SiteFooter from '../SiteFooter';
import { LANGUAGES, DEFAULT_LANG, getAlternates, localizedPath } from '../../seo/pages.jsx';
import './SeoLandingPage.css';

const DARK_MODE_KEY = 'sudoku-devoile:darkMode';

const CHROME = {
  fr: { home: 'Accueil', play: 'Jouer', lang: 'Langue' },
  en: { home: 'Home', play: 'Play', lang: 'Language' },
  de: { home: 'Startseite', play: 'Spielen', lang: 'Sprache' },
  es: { home: 'Inicio', play: 'Jugar', lang: 'Idioma' },
  zh: { home: '首页', play: '开始游戏', lang: '语言' }
};

export default function SeoLandingPage({ page, lang = DEFAULT_LANG }) {
  const chrome = CHROME[lang] ?? CHROME[DEFAULT_LANG];
  const alternates = getAlternates(page.key).map(a => ({ hreflang: a.lang, href: `${SITE_URL}${a.path}` }));
  // x-default pointe vers la version par défaut (fr), convention Google
  // pour les visiteurs dont la langue ne correspond à aucune version.
  alternates.push({ hreflang: 'x-default', href: `${SITE_URL}${localizedPath(DEFAULT_LANG, page.key)}` });

  useSeoMeta({ title: page.title, description: page.description, path: localizedPath(lang, page.key), lang, alternates });

  useEffect(() => {
    try {
      document.body.classList.toggle('dark', localStorage.getItem(DARK_MODE_KEY) === 'true');
    } catch {
      // stockage indisponible : on reste en thème clair par défaut
    }
  }, []);

  const { Content } = page;
  const homePath = lang === DEFAULT_LANG ? '/' : `/${lang}`;

  return (
    <div className="seo-page">
      <WebApplicationJsonLd />
      <BreadcrumbJsonLd items={[{ name: chrome.home, path: homePath }, { name: page.navLabel, path: localizedPath(lang, page.key) }]} />

      <header className="seo-page-header">
        <Link to="/" className="seo-page-brand">
          <img src="/favicon.svg" alt="" className="seo-page-logo" width="28" height="28" />
          Sudoku Art
        </Link>
        <nav className="seo-page-lang-switch" aria-label={chrome.lang}>
          {LANGUAGES.map(({ code, label }) => (
            code === lang
              ? <span key={code} className="seo-lang-current" aria-current="true">{code.toUpperCase()}</span>
              : <Link key={code} to={localizedPath(code, page.key)} className="seo-lang-link" title={label}>{code.toUpperCase()}</Link>
          ))}
        </nav>
        <Link to="/" className="seo-page-play-link">{chrome.play}</Link>
      </header>

      <main className="seo-page-main">
        <p className="seo-breadcrumb"><Link to="/">{chrome.home}</Link> / {page.navLabel}</p>

        <h1>{page.h1}</h1>
        <p className="seo-page-intro">{page.intro}</p>

        <Link to={page.cta.href} className="seo-page-cta">{page.cta.label}</Link>

        <div className="seo-page-content">
          <Content />
        </div>

        <Link to={page.cta.href} className="seo-page-cta seo-page-cta-bottom">{page.cta.label}</Link>
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
