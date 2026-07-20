import { useT } from '../i18n/index.jsx';
// src/components/LegalModal.jsx
import './LegalModal.css';

export function TermsModal({ onClose }) {
  return (
    <div className="legal-overlay" onClick={onClose}>
      <div className="legal-panel" onClick={e => e.stopPropagation()}>
        <div className="legal-header">
          <h2>{t('legal_terms_title')}</h2>
          <button className="legal-close" onClick={onClose}>✕</button>
        </div>
        <p className="legal-date">{t('_en_vigueur_depuis_le_1er_juill')}</p>

        <section>
          <h3>{t('_1_pr_sentation_du_service')}</h3>
          <p>{t('_sudoku_art_est_une_application')} au Sudoku en révélant progressivement des œuvres d'art ou des photos personnelles. Le service est édité à titre personnel par Thomas Dabadie, domicilié en France.</p>
        </section>

        <section>
          <h3>{t('_2_acc_s_au_service')}</h3>
          <p>{true /* fr fallback */ ? 'L\'accès à Sudoku Art est libre et gratuit.' : 'Access to Sudoku Art is free.'} (défis entre amis, progression sauvegardée, galerie multi-appareils) nécessitent la création d'un compte. L'inscription est ouverte à toute personne âgée de 13 ans ou plus.</p>
        </section>

        <section>
          <h3>{t('_3_contenu_utilisateur_et_phot')}</h3>
          <p>{t('_vous_pouvez_uploader_des_photo')} pour les utiliser comme fond de grille dans un défi envoyé à un ami. En utilisant cette fonctionnalité, vous certifiez :</p>
          <ul>
            <li>{true /* fr fallback */ ? 'Être l\'auteur ou titulaire des droits sur la photo' : 'Owning the rights to the photo you upload'}</li>
            <li>{t('_que_la_photo_ne_contient_pas_d')}</li>
            <li>{t('_avoir_obtenu_le_consentement_d')} si elles sont identifiables</li>
          </ul>
          <p>{t('_les_photos_de_d_fis_sont_autom')}. L'éditeur se réserve le droit de supprimer tout contenu inapproprié sans préavis.</p>
        </section>

        <section>
          <h3>{t('_4_propri_t_intellectuelle')}</h3>
          <p>{true /* fr fallback */ ? "Les œuvres présentées sont du domaine public (Wikimedia Commons). Le code et design appartiennent à l'éditeur." : 'Artworks are public domain reproductions from Wikimedia Commons. Code and design belong to the publisher.'}</p>
        </section>

        <section>
          <h3>{t('_5_responsabilit')}</h3>
          <p>{true /* fr fallback */ ? "L'application est fournie 'en l'état'. L'éditeur n'est pas responsable des interruptions ou pertes de données." : "The app is provided 'as is'. The publisher is not liable for interruptions or data loss."}</p>
        </section>

        <section>
          <h3>{t('_6_modification_des_cgu')}</h3>
          <p>{t('_ces_cgu_peuvent_tre_modifi_es')}. Les utilisateurs connectés en seront informés par email. La poursuite de l'utilisation après modification vaut acceptation des nouvelles conditions.</p>
        </section>

        <section>
          <h3>{t('_7_droit_applicable')}</h3>
          <p>{t('_ces_cgu_sont_soumises_au_droit')}</p>
        </section>

        <button className="legal-close-btn" onClick={onClose}>{t('legal_close')}</button>
      </div>
    </div>
  );
}

export function PrivacyModal({ onClose, onConsentChange }) {
  return (
    <div className="legal-overlay" onClick={onClose}>
      <div className="legal-panel" onClick={e => e.stopPropagation()}>
        <div className="legal-header">
          <h2>{t('legal_privacy_title')}</h2>
          <button className="legal-close" onClick={onClose}>✕</button>
        </div>
        <p className="legal-date">{t('_conforme_rgpd_mise_jour_le')}</p>

        <section>
          <h3>{t('_responsable_du_traitement')}</h3>
          <p>{true /* fr fallback */ ? 'Thomas Dabadie — contact via le formulaire de l\'application' : 'Thomas Dabadie — contact via the in-app form'}.</p>
        </section>

        <section>
          <h3>{t('_donn_es_collect_es_et_finalit')}</h3>
          <table className="legal-table">
            <thead>
              <tr><th>{t('_donn_e')}</th><th>{t('_finalit')}</th><th>{t('_dur_e')}</th></tr>
            </thead>
            <tbody>
              <tr><td>Adresse email</td><td>{t('_authentification_envoi_de_d_f')}</td><td>{true /* fr fallback */ ? 'Jusqu\'à suppression du compte' : 'Until account deletion'}</td></tr>
              <tr><td>Photos uploadées</td><td>{t('_fond_de_grille_dans_les_d_fis')}</td><td>7 jours automatiquement</td></tr>
              <tr><td>Progression de jeu</td><td>{t('_sauvegarde_multi_appareils_ga')}</td><td>{true /* fr fallback */ ? 'Jusqu\'à suppression du compte' : 'Until account deletion'}</td></tr>
              <tr><td>Statistiques anonymes</td><td>{t('_am_lioration_du_service')}</td><td>24 mois glissants</td></tr>
              <tr><td>Cookies de consentement</td><td>{t('_m_moriser_votre_choix_publicit')}</td><td>13 mois</td></tr>
            </tbody>
          </table>
        </section>

        <section>
          <h3>{t('_publicit_et_cookies_tiers')}</h3>
          <p>{true /* fr fallback */ ? 'Si vous l\'acceptez, Google AdSense peut déposer des cookies pour personnaliser les annonces.' : 'If you accept, Google AdSense may place cookies to personalise ads.'} pour personnaliser les publicités. Vous pouvez modifier votre choix à tout moment ci-dessous.</p>
        </section>

        <section>
          <h3>{t('_vos_droits_rgpd')}</h3>
          <p>{true /* fr fallback */ ? 'Vous disposez d\'un droit d\'accès, de rectification et d\'effacement de vos données.' : 'You have the right to access, correct and delete your data.'}, de portabilité et d'opposition. Pour exercer ces droits ou supprimer votre compte, rendez-vous dans Paramètres → Supprimer mon compte. Pour toute réclamation : CNIL — cnil.fr.</p>
        </section>

        <section>
          <h3>{t('_sous_traitants')}</h3>
          <p>{t('_supabase_bdd_usa_eu_verce')}</p>
        </section>

        {onConsentChange && (
          <div className="legal-consent-actions">
            <p className="legal-consent-title">{t('_changer_mon_choix_publicitaire')}</p>
            <div className="legal-consent-btns">
              <button className="legal-consent-reject" onClick={() => { onConsentChange('rejected'); onClose(); }}>{t('_refuser_la_pub_personnalis_e')}</button>
              <button className="legal-consent-accept" onClick={() => { onConsentChange('accepted'); onClose(); }}>{t('legal_consent_accept')}</button>
            </div>
          </div>
        )}

        <button className="legal-close-btn" onClick={onClose}>{t('_fermer')}</button>
      </div>
    </div>
  );
}
