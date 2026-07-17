// src/components/LegalModal.jsx
import './LegalModal.css';

export function TermsModal({ onClose }) {
  return (
    <div className="legal-overlay" onClick={onClose}>
      <div className="legal-panel" onClick={e => e.stopPropagation()}>
        <div className="legal-header">
          <h2>Conditions Générales d'Utilisation</h2>
          <button className="legal-close" onClick={onClose}>✕</button>
        </div>
        <p className="legal-date">En vigueur depuis le 1er juillet 2025</p>

        <section>
          <h3>1. Présentation du service</h3>
          <p>Sudoku Art est une application web progressive (PWA) gratuite permettant de jouer au Sudoku en révélant progressivement des œuvres d'art ou des photos personnelles. Le service est édité à titre personnel par Thomas Dabadie, domicilié en France.</p>
        </section>

        <section>
          <h3>2. Accès au service</h3>
          <p>L'accès à Sudoku Art est libre et gratuit. Certaines fonctionnalités (défis entre amis, progression sauvegardée, galerie multi-appareils) nécessitent la création d'un compte. L'inscription est ouverte à toute personne âgée de 13 ans ou plus.</p>
        </section>

        <section>
          <h3>3. Contenu utilisateur et photos personnelles</h3>
          <p>Vous pouvez uploader des photos personnelles pour les utiliser comme fond de grille dans un défi envoyé à un ami. En utilisant cette fonctionnalité, vous certifiez :</p>
          <ul>
            <li>Être l'auteur ou le titulaire des droits sur la photo uploadée</li>
            <li>Que la photo ne contient pas de contenu illégal, offensant, pornographique, haineux ou portant atteinte à la dignité d'une personne</li>
            <li>Avoir obtenu le consentement des personnes photographiées si elles sont identifiables</li>
          </ul>
          <p>Les photos de défis sont automatiquement supprimées après 7 jours. L'éditeur se réserve le droit de supprimer tout contenu inapproprié sans préavis.</p>
        </section>

        <section>
          <h3>4. Propriété intellectuelle</h3>
          <p>Les œuvres d'art présentées dans l'application sont des reproductions d'œuvres du domaine public, issues de Wikimedia Commons. Leur usage est libre de droits. Le code et le design de l'application sont la propriété de l'éditeur.</p>
        </section>

        <section>
          <h3>5. Responsabilité</h3>
          <p>L'application est fournie "en l'état". L'éditeur ne saurait être tenu responsable des interruptions de service, pertes de données ou dommages directs ou indirects liés à l'utilisation de l'application. L'accès à Internet est à la charge de l'utilisateur.</p>
        </section>

        <section>
          <h3>6. Modification des CGU</h3>
          <p>Ces CGU peuvent être modifiées à tout moment. Les utilisateurs connectés en seront informés par email. La poursuite de l'utilisation après modification vaut acceptation des nouvelles conditions.</p>
        </section>

        <section>
          <h3>7. Droit applicable</h3>
          <p>Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux français sont seuls compétents.</p>
        </section>

        <button className="legal-close-btn" onClick={onClose}>J'ai compris</button>
      </div>
    </div>
  );
}

export function PrivacyModal({ onClose, onConsentChange }) {
  return (
    <div className="legal-overlay" onClick={onClose}>
      <div className="legal-panel" onClick={e => e.stopPropagation()}>
        <div className="legal-header">
          <h2>Politique de confidentialité</h2>
          <button className="legal-close" onClick={onClose}>✕</button>
        </div>
        <p className="legal-date">Conforme RGPD — mise à jour le 1er juillet 2025</p>

        <section>
          <h3>Responsable du traitement</h3>
          <p>Thomas Dabadie — contact disponible via le formulaire de l'application.</p>
        </section>

        <section>
          <h3>Données collectées et finalités</h3>
          <table className="legal-table">
            <thead>
              <tr><th>Donnée</th><th>Finalité</th><th>Durée</th></tr>
            </thead>
            <tbody>
              <tr><td>Adresse email</td><td>Authentification, envoi de défis</td><td>Jusqu'à suppression du compte</td></tr>
              <tr><td>Photos uploadées</td><td>Fond de grille dans les défis</td><td>7 jours automatiquement</td></tr>
              <tr><td>Progression de jeu</td><td>Sauvegarde multi-appareils, galerie</td><td>Jusqu'à suppression du compte</td></tr>
              <tr><td>Statistiques anonymes</td><td>Amélioration du service</td><td>24 mois glissants</td></tr>
              <tr><td>Cookies de consentement</td><td>Mémoriser votre choix publicitaire</td><td>13 mois</td></tr>
            </tbody>
          </table>
        </section>

        <section>
          <h3>Publicité et cookies tiers</h3>
          <p>Si vous l'acceptez, Google AdSense peut déposer des cookies pour personnaliser les publicités. Vous pouvez modifier votre choix à tout moment ci-dessous.</p>
        </section>

        <section>
          <h3>Vos droits (RGPD)</h3>
          <p>Vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité et d'opposition. Pour exercer ces droits ou supprimer votre compte, rendez-vous dans Paramètres → Supprimer mon compte. Pour toute réclamation : CNIL — cnil.fr.</p>
        </section>

        <section>
          <h3>Sous-traitants</h3>
          <p>Supabase (hébergement base de données, USA/EU — DPA signé) · Vercel (hébergement web, USA — Standard Contractual Clauses) · Google (AdSense, si accepté)</p>
        </section>

        {onConsentChange && (
          <div className="legal-consent-actions">
            <p className="legal-consent-title">Changer mon choix publicitaire :</p>
            <div className="legal-consent-btns">
              <button className="legal-consent-reject" onClick={() => { onConsentChange('rejected'); onClose(); }}>Refuser la pub personnalisée</button>
              <button className="legal-consent-accept" onClick={() => { onConsentChange('accepted'); onClose(); }}>Accepter</button>
            </div>
          </div>
        )}

        <button className="legal-close-btn" onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
}
