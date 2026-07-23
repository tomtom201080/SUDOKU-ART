// src/lib/adsense.js
let scriptLoaded = false;

// Coupure temporaire des pubs (ex : en attendant la validation AdSense),
// sans toucher au script de vérification AdSense lui-même (index.html) ni
// au reste du code — les 4 composants publicitaires (AdSlot, AdInterstitial,
// HintModal, MaxErrorsModal) retombent déjà proprement sur leur variante
// sans pub dès que cette fonction renvoie une valeur fausse.
export function getAdsenseClientId() {
  if (import.meta.env.VITE_ADS_ENABLED === 'false') return null;
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
