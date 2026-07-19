import { translate as t, useT, getLang } from '../i18n/index.jsx';
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
        <p className="legal-date">{getLang() === 'fr' ? 'En vigueur depuis le 1er juillet 2025' : 'Effective July 1st, 2025'}</p>

        <section>
          <h3>{getLang() === 'fr' ? '1. Présentation du service' : '1. About this service'}</h3>
          <p>{getLang() === 'fr' ? 'Sudoku Art est une application web progressive (PWA) gratuite permettant de jouer au sudoku en dévoilant une image.' : 'Sudoku Art is a free progressive web app (PWA) for playing sudoku while revealing an image.'} au Sudoku en révélant progressivement des œuvres d'art ou des photos personnelles. Le service est édité à titre personnel par Thomas Dabadie, domicilié en France.</p>
        </section>

        <section>
          <h3>{getLang() === 'fr' ? '2. Accès au service' : '2. Access'}</h3>
          <p>{getLang() === 'fr' ? 'L\'accès à Sudoku Art est libre et gratuit.' : 'Access to Sudoku Art is free.'} (défis entre amis, progression sauvegardée, galerie multi-appareils) nécessitent la création d'un compte. L'inscription est ouverte à toute personne âgée de 13 ans ou plus.</p>
        </section>

        <section>
          <h3>{getLang() === 'fr' ? '3. Contenu utilisateur et photos personnelles' : '3. User content and personal photos'}</h3>
          <p>{getLang() === 'fr' ? 'Vous pouvez uploader des photos personnelles pour les utiliser comme fond de grille.' : 'You may upload personal photos to use as grid backgrounds.'} pour les utiliser comme fond de grille dans un défi envoyé à un ami. En utilisant cette fonctionnalité, vous certifiez :</p>
          <ul>
            <li>{getLang() === 'fr' ? 'Être l\'auteur ou titulaire des droits sur la photo' : 'Owning the rights to the photo you upload'}</li>
            <li>{getLang() === 'fr' ? 'Que la photo ne contient pas de contenu illégal ou offensant' : 'The photo must not contain illegal or offensive content'}</li>
            <li>{getLang() === 'fr' ? 'Avoir obtenu le consentement des personnes photographiées.' : 'Having obtained consent from any identifiable people in photos.'} si elles sont identifiables</li>
          </ul>
          <p>{getLang() === 'fr' ? 'Les photos de défis sont automatiquement supprimées après 7 jours.' : 'Challenge photos are automatically deleted after 7 days.'}. L'éditeur se réserve le droit de supprimer tout contenu inapproprié sans préavis.</p>
        </section>

        <section>
          <h3>{getLang() === 'fr' ? '4. Propriété intellectuelle' : '4. Intellectual property'}</h3>
          <p>{getLang() === 'fr' ? "Les œuvres présentées sont du domaine public (Wikimedia Commons). Le code et design appartiennent à l'éditeur." : 'Artworks are public domain reproductions from Wikimedia Commons. Code and design belong to the publisher.'}</p>
        </section>

        <section>
          <h3>{getLang() === 'fr' ? '5. Responsabilité' : '5. Liability'}</h3>
          <p>{getLang() === 'fr' ? "L'application est fournie 'en l'état'. L'éditeur n'est pas responsable des interruptions ou pertes de données." : "The app is provided 'as is'. The publisher is not liable for interruptions or data loss."}</p>
        </section>

        <section>
          <h3>{getLang() === 'fr' ? '6. Modification des CGU' : '6. Terms updates'}</h3>
          <p>{getLang() === 'fr' ? 'Ces CGU peuvent être modifiées à tout moment.' : 'These terms may be updated at any time.'}. Les utilisateurs connectés en seront informés par email. La poursuite de l'utilisation après modification vaut acceptation des nouvelles conditions.</p>
        </section>

        <section>
          <h3>{getLang() === 'fr' ? '7. Droit applicable' : '7. Governing law'}</h3>
          <p>{getLang() === 'fr' ? 'Ces CGU sont soumises au droit français.' : 'These terms are governed by French law.'}</p>
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
        <p className="legal-date">{getLang() === 'fr' ? 'Conforme RGPD — mise à jour le 1er juillet 2025' : 'GDPR compliant — updated July 1st, 2025'}</p>

        <section>
          <h3>{getLang() === 'fr' ? 'Responsable du traitement' : 'Data controller'}</h3>
          <p>{getLang() === 'fr' ? 'Thomas Dabadie — contact via le formulaire de l\'application' : 'Thomas Dabadie — contact via the in-app form'}.</p>
        </section>

        <section>
          <h3>{getLang() === 'fr' ? 'Données collectées et finalités' : 'Data collected and purposes'}</h3>
          <table className="legal-table">
            <thead>
              <tr><th>{getLang() === 'fr' ? 'Donnée' : 'Data'}</th><th>{getLang() === 'fr' ? 'Finalité' : 'Purpose'}</th><th>{getLang() === 'fr' ? 'Durée' : 'Duration'}</th></tr>
            </thead>
            <tbody>
              <tr><td>Adresse email</td><td>{getLang() === 'fr' ? 'Authentification, envoi de défis' : 'Authentication, sending challenges'}</td><td>{getLang() === 'fr' ? 'Jusqu\'à suppression du compte' : 'Until account deletion'}</td></tr>
              <tr><td>Photos uploadées</td><td>{getLang() === 'fr' ? 'Fond de grille dans les défis' : 'Grid background in challenges'}</td><td>7 jours automatiquement</td></tr>
              <tr><td>Progression de jeu</td><td>{getLang() === 'fr' ? 'Sauvegarde multi-appareils, galerie' : 'Multi-device save, gallery'}</td><td>{getLang() === 'fr' ? 'Jusqu\'à suppression du compte' : 'Until account deletion'}</td></tr>
              <tr><td>Statistiques anonymes</td><td>{getLang() === 'fr' ? 'Amélioration du service' : 'Service improvement'}</td><td>24 mois glissants</td></tr>
              <tr><td>Cookies de consentement</td><td>{getLang() === 'fr' ? 'Mémoriser votre choix publicitaire' : 'Remember your ad preference'}</td><td>13 mois</td></tr>
            </tbody>
          </table>
        </section>

        <section>
          <h3>{getLang() === 'fr' ? 'Publicité et cookies tiers' : 'Advertising and third-party cookies'}</h3>
          <p>{getLang() === 'fr' ? 'Si vous l\'acceptez, Google AdSense peut déposer des cookies pour personnaliser les annonces.' : 'If you accept, Google AdSense may place cookies to personalise ads.'} pour personnaliser les publicités. Vous pouvez modifier votre choix à tout moment ci-dessous.</p>
        </section>

        <section>
          <h3>{getLang() === 'fr' ? 'Vos droits (RGPD)' : 'Your rights (GDPR)'}</h3>
          <p>{getLang() === 'fr' ? 'Vous disposez d\'un droit d\'accès, de rectification et d\'effacement de vos données.' : 'You have the right to access, correct and delete your data.'}, de portabilité et d'opposition. Pour exercer ces droits ou supprimer votre compte, rendez-vous dans Paramètres → Supprimer mon compte. Pour toute réclamation : CNIL — cnil.fr.</p>
        </section>

        <section>
          <h3>{getLang() === 'fr' ? 'Sous-traitants' : 'Sub-processors'}</h3>
          <p>{getLang() === 'fr' ? 'Supabase (BDD, USA/EU) · Vercel (hébergement, USA) · Google (AdSense si accepté)' : 'Supabase (DB, USA/EU) · Vercel (hosting, USA) · Google (AdSense if accepted)'}</p>
        </section>

        {onConsentChange && (
          <div className="legal-consent-actions">
            <p className="legal-consent-title">{getLang() === 'fr' ? 'Changer mon choix publicitaire :' : 'Change my ad preference:'}</p>
            <div className="legal-consent-btns">
              <button className="legal-consent-reject" onClick={() => { onConsentChange('rejected'); onClose(); }}>{getLang() === 'fr' ? 'Refuser la pub personnalisée' : 'Decline personalised ads'}</button>
              <button className="legal-consent-accept" onClick={() => { onConsentChange('accepted'); onClose(); }}>{t('legal_consent_accept')}</button>
            </div>
          </div>
        )}

        <button className="legal-close-btn" onClick={onClose}>{getLang() === 'fr' ? 'Fermer' : 'Close'}</button>
      </div>
    </div>
  );
}
