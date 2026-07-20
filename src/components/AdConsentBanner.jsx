// src/components/AdConsentBanner.jsx
import { useT } from '../i18n/index.jsx';
import { setAdConsent } from '../lib/adConsent';
import './AdConsentBanner.css';

export default function AdConsentBanner({ onChoice, onShowPrivacy }) {
  const { t } = useT();

  const handleChoice = (value) => {
    setAdConsent(value);
    onChoice(value);
  };

  return (
    <div className="ad-consent-banner">
      <p>
        {t('consent_text')}{' '}
        <button className="ad-consent-link" onClick={onShowPrivacy}>
          {t('consent_learn_more')}
        </button>
      </p>
      <div className="ad-consent-actions">
        <button className="ad-consent-btn-secondary" onClick={() => handleChoice('rejected')}>
          {t('consent_reject')}
        </button>
        <button className="ad-consent-btn-primary" onClick={() => handleChoice('accepted')}>
          {t('consent_accept')}
        </button>
      </div>
    </div>
  );
}
