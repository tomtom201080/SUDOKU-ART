import { translate as t, useT } from '../i18n/index.jsx';
// src/components/AdConsentBanner.jsx
import { setAdConsent } from '../lib/adConsent';
import './AdConsentBanner.css';

export default function AdConsentBanner({ onChoice, onShowPrivacy }) {
  const handleChoice = (value) => {
    setAdConsent(value);
    onChoice(value);
  };

  return (
    <div className="ad-consent-banner">
      <p>
        {t('consent_text')}
        soient personnalisées selon tes centres d'intérêt (via des cookies) ?
        Tu peux changer d'avis à tout moment dans les réglages.{' '}
        <button className="ad-consent-link" onClick={onShowPrivacy}>
          En savoir plus
        </button>
      </p>
      <div className="ad-consent-actions">
        <button className="ad-consent-btn-secondary" onClick={() => handleChoice('rejected')}>
          Refuser
        </button>
        <button className="ad-consent-btn-primary" onClick={() => handleChoice('accepted')}>
          Accepter
        </button>
      </div>
    </div>
  );
}
