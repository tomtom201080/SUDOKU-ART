// src/components/SiteFooter.jsx
// Footer des pages SEO (contenu statique, hors de l'écran de jeu) :
// maillage interne réel (liens <Link>, pas des boutons JS sans href) vers
// toutes les pages publiques, plus accès aux CGU/confidentialité via les
// modales déjà existantes (LegalModal). État local, ne dépend d'aucun état
// de App.jsx : utilisable aussi bien côté client que pré-rendu côté Node
// par scripts/prerender-seo.mjs (aucun useT() ici, contenu français fixe —
// voir src/seo/pages.jsx pour le choix d'architecture).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TermsModal, PrivacyModal } from './LegalModal';
import { SEO_PAGES } from '../seo/pages.jsx';
import './SiteFooter.css';

export default function SiteFooter() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <footer className="site-footer">
      <nav className="site-footer-nav" aria-label="Pages du site">
        <Link to="/" className="site-footer-link">Accueil</Link>
        {SEO_PAGES.map(p => (
          <Link key={p.slug} to={`/${p.slug}`} className="site-footer-link">{p.navLabel}</Link>
        ))}
      </nav>
      <div className="site-footer-legal">
        <button className="privacy-footer-link" onClick={() => setShowTerms(true)}>Conditions d'utilisation</button>
        <span className="privacy-footer-sep">·</span>
        <button className="privacy-footer-link" onClick={() => setShowPrivacy(true)}>Confidentialité</button>
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} onConsentChange={() => {}} />}
    </footer>
  );
}
