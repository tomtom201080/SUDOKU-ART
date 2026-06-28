// src/components/AdSlot.jsx
import { useEffect } from 'react';
import { loadAdsenseScript, getAdsenseClientId } from '../lib/adsense';
import './AdSlot.css';

export default function AdSlot({ slot, format = 'auto' }) {
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
        📢 Emplacement publicitaire — sera actif une fois ton compte AdSense configuré
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
