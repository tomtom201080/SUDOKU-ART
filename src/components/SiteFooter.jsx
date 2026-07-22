// src/components/SiteFooter.jsx
// Footer des pages SEO (contenu statique, hors de l'écran de jeu) :
// maillage interne réel (liens <Link>, pas des boutons JS sans href) vers
// toutes les pages publiques dans LA MÊME LANGUE, plus accès aux
// CGU/confidentialité via les modales déjà existantes (LegalModal). État
// local, ne dépend d'aucun état de App.jsx : utilisable aussi bien côté
// client que pré-rendu côté Node par scripts/prerender-seo.mjs (pas de
// useT() pour le contenu propre à ce composant — voir src/seo/pages.jsx).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TermsModal, PrivacyModal } from './LegalModal';
import { getPagesForLang, localizedPath, DEFAULT_LANG } from '../seo/pages.jsx';
import './SiteFooter.css';

const CHROME = {
  fr: { home: 'Accueil', terms: "Conditions d'utilisation", privacy: 'Confidentialité' },
  en: { home: 'Home', terms: 'Terms of use', privacy: 'Privacy' },
  de: { home: 'Startseite', terms: 'Nutzungsbedingungen', privacy: 'Datenschutz' },
  es: { home: 'Inicio', terms: 'Condiciones de uso', privacy: 'Privacidad' },
  zh: { home: '首页', terms: '使用条款', privacy: '隐私政策' }
};

export default function SiteFooter({ lang = DEFAULT_LANG }) {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const chrome = CHROME[lang] ?? CHROME[DEFAULT_LANG];
  const homePath = lang === DEFAULT_LANG ? '/' : `/${lang}`;

  return (
    <footer className="site-footer">
      <nav className="site-footer-nav" aria-label="Pages du site">
        <Link to={homePath} className="site-footer-link">{chrome.home}</Link>
        {getPagesForLang(lang).map(p => (
          <Link key={p.key} to={localizedPath(lang, p.key)} className="site-footer-link">{p.navLabel}</Link>
        ))}
      </nav>
      <div className="site-footer-legal">
        <button className="privacy-footer-link" onClick={() => setShowTerms(true)}>{chrome.terms}</button>
        <span className="privacy-footer-sep">·</span>
        <button className="privacy-footer-link" onClick={() => setShowPrivacy(true)}>{chrome.privacy}</button>
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} onConsentChange={() => {}} />}
    </footer>
  );
}
