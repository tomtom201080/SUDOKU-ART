import { translate as t, useT } from '../i18n/index.jsx';
// src/components/PrivacyPolicy.jsx
import { setAdConsent } from '../lib/adConsent';
import './PrivacyPolicy.css';

export default function PrivacyPolicy({ onClose, onConsentChange }) {
  const handleChoice = (value) => {
    setAdConsent(value);
    if (onConsentChange) onConsentChange(value);
    onClose();
  };

  return (
    <div className="privacy-overlay" onClick={onClose}>
      <div className="privacy-panel" onClick={(e) => e.stopPropagation()}>
        <div className="privacy-header">
          <h2>{t('legal_privacy_title')}</h2>
          <button className="privacy-close" onClick={onClose}>✕</button>
        </div>

        <section>
          <h3>{lang === 'fr' ? 'Données collectées' : 'Data collected'}</h3>
          <p>
            Sudoku Art collecte les données suivantes : votre adresse email
            (si vous créez un compte), votre progression de jeu, et les
            photos que vous choisissez d'envoyer pour vos parties (supprimées
            automatiquement après 7 jours pour les défis entre amis).
          </p>
        </section>

        <section>
          <h3>{lang === 'fr' ? 'Utilisation des données' : 'Data usage'}</h3>
          <p>
            Ces données servent uniquement à faire fonctionner l'application
            (sauvegarde de progression, défis entre amis, statistiques
            d'usage anonymisées) et, le cas échéant, à afficher des publicités
            permettant de financer le développement gratuit de l'application.
          </p>
        </section>

        <section>
          <h3>{lang === 'fr' ? 'Publicité' : 'Advertising'}</h3>
          <p>
            Sudoku Art peut afficher des publicités fournies par Google
            AdSense. Google peut utiliser des cookies pour personnaliser ces
            publicités selon vos centres d'intérêt. Vous pouvez refuser cette
            personnalisation via le bandeau de consentement affiché à votre
            première visite, ou à tout moment en effaçant les données de
            votre navigateur pour ce site.
          </p>
        </section>

        <section>
          <h3>{lang === 'fr' ? 'Vos droits' : 'Your rights'}</h3>
          <p>
            Conformément au RGPD, vous pouvez demander l'accès, la
            rectification ou la suppression de vos données à tout moment en
            nous contactant.
          </p>
        </section>

        <div className="privacy-choice-actions">
          <button className="privacy-choice-btn" onClick={() => handleChoice('rejected')}>
            Refuser les pubs personnalisées
          </button>
          <button className="privacy-choice-btn privacy-choice-btn-primary" onClick={() => handleChoice('accepted')}>
            Accepter
          </button>
        </div>
        <button className="privacy-close-btn" onClick={onClose}>{t('legal_close_plain')}</button>
      </div>
    </div>
  );
}
