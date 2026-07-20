import { useT } from '../i18n/index.jsx';
import './HelpModal.css';

export default function HelpModal({ onClose }) {
  const { t } = useT();

  return (
    <div className="help-overlay" onClick={onClose}>
      <div className="help-panel" onClick={(e) => e.stopPropagation()}>
        <div className="help-header">
          <h2>{t('help_rules_title')}</h2>
          <button className="help-close" onClick={onClose}>✕</button>
        </div>

        <section className="help-section">
          <h3>{t('help_intro_title')}</h3>
          <p>{t('help_intro_rules_text')}</p>
          <ul>
            <li>{t('help_rule1')}</li>
            <li>{t('help_rule2')}</li>
            <li>{t('help_rule3')}</li>
          </ul>
          <p>{t('help_intro_prefilled_text')}</p>
        </section>

        <section className="help-section">
          <h3>{t('help_photo_title')}</h3>
          <p>{t('help_photo_intro_text')}</p>
          <ul>
            <li>{t('help_center_cell')}</li>
            <li>{t('help_correct_cell')}</li>
            <li>{t('help_photo_prefilled_reveal')}</li>
          </ul>
          <p>{t('help_photo_intensity_text')}</p>
        </section>

        <section className="help-section">
          <h3>{t('help_buttons_title')}</h3>
          <ul>
            <li>{t('help_digits_desc')}</li>
            <li>{t('help_erase_desc')}</li>
            <li>{t('help_notes_toggle_desc')}</li>
            <li>{t('help_undo')}</li>
            <li>{t('help_hint_desc')}</li>
          </ul>
        </section>

        <section className="help-section">
          <h3>{t('help_diff_title')}</h3>
          <p>{t('help_diff_levels_text')}</p>
        </section>

        <section className="help-section">
          <h3>{t('help_photo_challenge_title')}</h3>
          <p>{t('help_photo_challenge_text')}</p>
        </section>

        <button className="help-done-btn" onClick={onClose}>{t('help_go')}</button>
      </div>
    </div>
  );
}
