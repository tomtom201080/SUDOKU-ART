// src/components/ConsentBanner.jsx
// Remplace AdConsentBanner : un seul bandeau, trois catégories de
// consentement indépendantes (nécessaire / mesure d'audience / publicité).
import { useState } from 'react';
import { useT } from '../i18n/index.jsx';
import { setConsent } from '../lib/consent';
import './ConsentBanner.css';

export default function ConsentBanner({ onDecided, onShowPrivacy }) {
  const { t } = useT();
  const [expanded, setExpanded] = useState(false);
  const [measurement, setMeasurement] = useState(true);
  const [advertising, setAdvertising] = useState(true);

  const acceptAll = () => {
    setConsent({ measurement: true, advertising: true });
    onDecided();
  };

  const rejectAll = () => {
    setConsent({ measurement: false, advertising: false });
    onDecided();
  };

  const saveChoices = () => {
    setConsent({ measurement, advertising });
    onDecided();
  };

  return (
    <div className="consent-banner">
      <p>
        {t('consent_banner_text')}{' '}
        <button className="consent-link" onClick={onShowPrivacy}>
          {t('consent_learn_more')}
        </button>
      </p>

      {expanded && (
        <div className="consent-categories">
          <div className="consent-category">
            <div className="consent-category-header">
              <span className="consent-category-label">{t('consent_category_necessary_label')}</span>
              <span className="consent-category-always-on">{t('consent_always_on')}</span>
            </div>
            <p className="consent-category-desc">{t('consent_category_necessary_desc')}</p>
          </div>

          <div className="consent-category">
            <div className="consent-category-header">
              <span className="consent-category-label">{t('consent_category_measurement_label')}</span>
              <label className="consent-toggle">
                <input
                  type="checkbox"
                  checked={measurement}
                  onChange={(e) => setMeasurement(e.target.checked)}
                />
                <span className="consent-toggle-slider" />
              </label>
            </div>
            <p className="consent-category-desc">{t('consent_category_measurement_desc')}</p>
          </div>

          <div className="consent-category">
            <div className="consent-category-header">
              <span className="consent-category-label">{t('consent_category_advertising_label')}</span>
              <label className="consent-toggle">
                <input
                  type="checkbox"
                  checked={advertising}
                  onChange={(e) => setAdvertising(e.target.checked)}
                />
                <span className="consent-toggle-slider" />
              </label>
            </div>
            <p className="consent-category-desc">{t('consent_category_advertising_desc')}</p>
          </div>
        </div>
      )}

      <div className="consent-actions">
        {expanded ? (
          <button className="consent-btn-primary" onClick={saveChoices}>
            {t('consent_save_choices')}
          </button>
        ) : (
          <>
            <button className="consent-btn-secondary" onClick={rejectAll}>
              {t('consent_reject_all')}
            </button>
            <button className="consent-link consent-customize-btn" onClick={() => setExpanded(true)}>
              {t('consent_customize')}
            </button>
            <button className="consent-btn-primary" onClick={acceptAll}>
              {t('consent_accept_all')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
