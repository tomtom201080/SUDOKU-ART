// src/lib/adsense.js
let scriptLoaded = false;

// Choix centralisé du fournisseur affiché à chaque emplacement publicitaire
// — un seul endroit à changer pour basculer d'un mode à l'autre :
//   - 'internal' (par défaut) : promotions internes, voir InternalPromo.jsx
//     et src/data/internalPromos.js — utile tant qu'AdSense n'est pas
//     validé, sans toucher au script de vérification dans index.html.
//   - 'adsense'  : vraies pubs AdSense.
//   - 'off'      : rien du tout (ni pub ni promotion interne).
// Les 4 composants publicitaires (AdSlot, AdInterstitial, HintModal,
// MaxErrorsModal) retombent automatiquement sur InternalPromo si 'adsense'
// est choisi mais qu'aucun identifiant client n'est configuré — filet de
// sécurité en cas de blocage/erreur AdSense, sans créer d'emplacement vide.
export function getAdProvider() {
  const raw = import.meta.env.VITE_AD_PROVIDER;
  if (raw === 'adsense') return 'adsense';
  if (raw === 'off') return 'off';
  return 'internal';
}

export function getAdsenseClientId() {
  return import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-9595415133348818';
}

// Charge le script AdSense une seule fois, et seulement si un identifiant
// client a bien été configuré (sinon, on ne charge jamais rien — pas
// d'appel inutile à Google tant que le compte n'est pas prêt).
export function loadAdsenseScript() {
  if (scriptLoaded) return;
  const clientId = getAdsenseClientId();
  if (!clientId) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
  scriptLoaded = true;
}

// Déclenche l'affichage d'une pub. Les publicités s'affichent toujours,
// que l'utilisateur ait donné son consentement ou non — seul le CONTENU
// change : personnalisé (basé sur le profil) si consentement donné, ou
// générique/contextuel sinon, via le flag standard AdSense
// requestNonPersonalizedAds. L'utilisateur ne peut pas désactiver
// entièrement les pubs, seulement leur personnalisation.
export function pushAdsenseAd(personalized) {
  try {
    window.adsbygoogle = window.adsbygoogle || [];
    if (!personalized) {
      window.adsbygoogle.requestNonPersonalizedAds = 1;
    }
    window.adsbygoogle.push({});
  } catch {
    // annonce indisponible (bloqueur de pub, etc.) : rien à faire de plus
  }
}
