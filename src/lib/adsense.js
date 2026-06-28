// src/lib/adsense.js
let scriptLoaded = false;

export function getAdsenseClientId() {
  return import.meta.env.VITE_ADSENSE_CLIENT_ID || null;
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
