import { useT } from '../i18n/index.jsx';
// src/components/AdSlot.jsx
// La pub s'affiche toujours si AdSense est configuré : le consentement ne
// conditionne que sa personnalisation (voir pushAdsenseAd), jamais son
// affichage.
import { useEffect } from 'react';
import { getAdConsent } from '../lib/adConsent';
import { loadAdsenseScript, pushAdsenseAd, getAdsenseClientId } from '../lib/adsense';
import './AdSlot.css';

export default function AdSlot({ slot, format = 'auto' }) {
  const { t } = useT();
  const clientId = getAdsenseClientId();
  const consent = getAdConsent();

  useEffect(() => {
    if (!clientId) return;
    loadAdsenseScript();
    pushAdsenseAd(consent === 'accepted');
  }, [clientId, slot]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!clientId) {
    return (
      <div className="ad-slot-placeholder">
        {t('ad_placeholder')}
      </div>
    );
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
