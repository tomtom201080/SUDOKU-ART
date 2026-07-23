// src/components/AdSlot.jsx
// La pub s'affiche toujours si AdSense est configuré : le consentement ne
// conditionne que sa personnalisation (voir pushAdsenseAd), jamais son
// affichage.
import { useEffect } from 'react';
import { getAdConsent } from '../lib/adConsent';
import { loadAdsenseScript, pushAdsenseAd, getAdsenseClientId, getAdProvider } from '../lib/adsense';
import InternalPromo from './InternalPromo';
import './AdSlot.css';

export default function AdSlot({ slot, format = 'auto', placement = 'banner' }) {
  const provider = getAdProvider();
  const clientId = getAdsenseClientId();
  const showAdsense = provider === 'adsense' && !!clientId;
  const consent = getAdConsent();

  useEffect(() => {
    if (!showAdsense) return;
    loadAdsenseScript();
    pushAdsenseAd(consent === 'accepted');
  }, [showAdsense, slot]); // eslint-disable-line react-hooks/exhaustive-deps

  if (provider === 'off') return null;

  if (!showAdsense) {
    return <InternalPromo format="banner" placement={placement} />;
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={clientId}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
