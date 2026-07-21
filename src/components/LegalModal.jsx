import { useT } from '../i18n/index.jsx';
// src/components/LegalModal.jsx
import { getConsent, setConsent } from '../lib/consent';
import './LegalModal.css';

export function TermsModal({ onClose }) {
  const { t } = useT();
  return (
    <div className="legal-overlay" onClick={onClose}>
      <div className="legal-panel" onClick={e => e.stopPropagation()}>
        <div className="legal-header">
          <h2>{t('legal_terms_title')}</h2>
          <button className="legal-close" onClick={onClose}>✕</button>
        </div>
        <p className="legal-date">{t('legal_terms_date')}</p>

        <section>
          <h3>{t('legal_terms_s1_title')}</h3>
          <p>{t('legal_terms_s1_body')}</p>
        </section>

        <section>
          <h3>{t('legal_terms_s2_title')}</h3>
          <p>{t('legal_terms_s2_body')}</p>
        </section>

        <section>
          <h3>{t('legal_terms_s3_title')}</h3>
          <p>{t('legal_terms_s3_intro')}</p>
          <ul>
            <li>{t('legal_terms_s3_item1')}</li>
            <li>{t('legal_terms_s3_item2')}</li>
            <li>{t('legal_terms_s3_item3')}</li>
          </ul>
          <p>{t('legal_terms_s3_outro')}</p>
        </section>

        <section>
          <h3>{t('legal_terms_s4_title')}</h3>
          <p>{t('legal_terms_s4_body')}</p>
        </section>

        <section>
          <h3>{t('legal_terms_s5_title')}</h3>
          <p>{t('legal_terms_s5_body')}</p>
        </section>

        <section>
          <h3>{t('legal_terms_s6_title')}</h3>
          <p>{t('legal_terms_s6_body')}</p>
        </section>

        <section>
          <h3>{t('legal_terms_s7_title')}</h3>
          <p>{t('legal_terms_s7_body')}</p>
        </section>

        <button className="legal-close-btn" onClick={onClose}>{t('legal_close')}</button>
      </div>
    </div>
  );
}

export function PrivacyModal({ onClose, onConsentChange }) {
  const { t } = useT();
  const currentConsent = getConsent();
  const handleMeasurementChoice = (accepted) => setConsent({ measurement: accepted });
  return (
    <div className="legal-overlay" onClick={onClose}>
      <div className="legal-panel" onClick={e => e.stopPropagation()}>
        <div className="legal-header">
          <h2>{t('legal_privacy_title')}</h2>
          <button className="legal-close" onClick={onClose}>✕</button>
        </div>
        <p className="legal-date">{t('legal_privacy_date')}</p>

        <section>
          <h3>{t('legal_privacy_controller_title')}</h3>
          <p>{t('legal_privacy_controller_body')}</p>
        </section>

        <section>
          <h3>{t('legal_privacy_data_title')}</h3>
          <table className="legal-table">
            <thead>
              <tr><th>{t('legal_privacy_col_data')}</th><th>{t('legal_privacy_col_purpose')}</th><th>{t('legal_privacy_col_duration')}</th></tr>
            </thead>
            <tbody>
              <tr><td>{t('legal_privacy_row_email_label')}</td><td>{t('legal_privacy_row_email_purpose')}</td><td>{t('legal_privacy_row_email_duration')}</td></tr>
              <tr><td>{t('legal_privacy_row_photos_label')}</td><td>{t('legal_privacy_row_photos_purpose')}</td><td>{t('legal_privacy_row_photos_duration')}</td></tr>
              <tr><td>{t('legal_privacy_row_progress_label')}</td><td>{t('legal_privacy_row_progress_purpose')}</td><td>{t('legal_privacy_row_email_duration')}</td></tr>
              <tr><td>{t('legal_privacy_row_stats_label')}</td><td>{t('legal_privacy_row_stats_purpose')}</td><td>{t('legal_privacy_row_stats_duration')}</td></tr>
              <tr><td>{t('legal_privacy_row_cookies_label')}</td><td>{t('legal_privacy_row_cookies_purpose')}</td><td>{t('legal_privacy_row_cookies_duration')}</td></tr>
              <tr><td>{t('legal_privacy_row_feedback_label')}</td><td>{t('legal_privacy_row_feedback_purpose')}</td><td>{t('legal_privacy_row_feedback_duration')}</td></tr>
            </tbody>
          </table>
        </section>

        <section>
          <h3>{t('legal_privacy_measurement_title')}</h3>
          <p>{t('legal_privacy_measurement_body')}</p>
          <div className="legal-consent-actions">
            <p className="legal-consent-title">{t('legal_privacy_change_measurement_title')}</p>
            <div className="legal-consent-btns">
              <button
                className={currentConsent.measurement === false ? 'legal-consent-reject is-active' : 'legal-consent-reject'}
                onClick={() => handleMeasurementChoice(false)}
              >{t('legal_consent_reject')}</button>
              <button
                className={currentConsent.measurement === true ? 'legal-consent-accept is-active' : 'legal-consent-accept'}
                onClick={() => handleMeasurementChoice(true)}
              >{t('legal_consent_accept')}</button>
            </div>
          </div>
        </section>

        <section>
          <h3>{t('legal_privacy_ads_title')}</h3>
          <p>{t('legal_privacy_ads_body')}</p>
        </section>

        <section>
          <h3>{t('legal_privacy_rights_title')}</h3>
          <p>{t('legal_privacy_rights_body')}</p>
        </section>

        <section>
          <h3>{t('legal_privacy_subprocessors_title')}</h3>
          <p>{t('legal_privacy_subprocessors_body')}</p>
        </section>

        {onConsentChange && (
          <div className="legal-consent-actions">
            <p className="legal-consent-title">{t('legal_privacy_change_consent_title')}</p>
            <div className="legal-consent-btns">
              <button className="legal-consent-reject" onClick={() => { onConsentChange('rejected'); onClose(); }}>{t('legal_consent_reject')}</button>
              <button className="legal-consent-accept" onClick={() => { onConsentChange('accepted'); onClose(); }}>{t('legal_consent_accept')}</button>
            </div>
          </div>
        )}

        <button className="legal-close-btn" onClick={onClose}>{t('legal_privacy_close')}</button>
      </div>
    </div>
  );
}
