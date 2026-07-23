// src/components/InternalPromo.jsx
// Remplace un emplacement publicitaire (AdSlot/AdInterstitial/HintModal/
// MaxErrorsModal) par UNE seule idée d'utilisation de Sudoku Art — jamais
// une liste — présentée comme une publicité native. Voir getAdProvider()
// dans lib/adsense.js pour le choix entre pubs internes et AdSense.
//
// Volontairement non cliquable : aucun bouton, aucune navigation — la carte
// n'interrompt jamais une partie en cours, elle est purement illustrative.
import { useState } from 'react';
import { useT } from '../i18n/index.jsx';
import { INTERNAL_PROMOS } from '../data/internalPromos';
import { trackInternalPromoView } from '../lib/tracking';
import './InternalPromo.css';

const SEEN_KEY = 'sudoku-devoile:seenPromoIds';

// Choisit une promo jamais vue récemment (historique en localStorage, sans
// aucune donnée personnelle — uniquement des identifiants de promo). Une
// fois les 36 vues, l'historique repart de zéro proprement.
function pickPromo() {
  let seen = [];
  try {
    seen = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
  } catch {
    seen = [];
  }

  let candidates = INTERNAL_PROMOS.filter(p => !seen.includes(p.id));
  if (candidates.length === 0) {
    seen = [];
    candidates = INTERNAL_PROMOS;
  }

  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, chosen.id]));
  } catch {
    // stockage indisponible (mode privé, etc.) : pas de suivi anti-répétition, tant pis
  }
  return chosen;
}

// format : 'banner' | 'interstitial' — adapte la densité du texte affiché.
// placement : identifiant libre de l'emplacement, pour l'analytics
// uniquement (ex. 'home_banner', 'challenge_send', 'hint', 'max_errors').
export default function InternalPromo({ format = 'banner', placement }) {
  const { t, lang } = useT();

  // Sélection faite UNE seule fois par montage (jamais recalculée au
  // re-render) : useState avec initialiseur, pas useMemo (qui pourrait en
  // théorie être invalidé et relancé par React dans certains cas).
  const [promo] = useState(() => {
    const chosen = pickPromo();
    trackInternalPromoView({
      promoId: chosen.id,
      placement,
      format,
      language: lang,
      route: typeof window !== 'undefined' ? window.location.pathname : undefined
    });
    return chosen;
  });

  return (
    <div
      className={`internal-promo internal-promo-${format}`}
      role="group"
      aria-label={t(promo.titleKey)}
    >
      <span className="internal-promo-icon" aria-hidden="true">{promo.icon}</span>
      <div className="internal-promo-body">
        <p className="internal-promo-title">{t(promo.titleKey)}</p>
        <p className="internal-promo-text">{t(promo.textKey)}</p>
        <span className="internal-promo-badge">{t('promo_badge_label')}</span>
      </div>
    </div>
  );
}
