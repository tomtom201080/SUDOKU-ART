import { useT } from '../i18n/index.jsx';
// src/components/AdSlot.jsx
import { useEffect } from 'react';
import { loadAdsenseScript, getAdsenseClientId } from '../lib/adsense';
import './AdSlot.css';

export default function AdSlot({ slot, format = 'auto' }) {
  const { t } = useT();
  const clientId = getAdsenseClientId();

  useEffect(() => {
    if (!clientId) return;
    loadAdsenseScript();
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // L'annonce n'a pas pu se charger (bloqueur de pub, etc.) : pas grave,
      // on n'affiche simplement rien à cet endroit.
    }
  }, [clientId, slot]);

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
