import { translate as t, useT } from '../i18n/index.jsx';
// src/components/AdInterstitial.jsx
// S'affiche avant une action "premium" (envoi de défi, grille avec photo).
// Respecte le consentement : si l'utilisateur a refusé les pubs, on passe.
import { useEffect, useRef, useState } from 'react';
import { getAdConsent } from '../lib/adConsent';
import { loadAdsenseScript, getAdsenseClientId } from '../lib/adsense';
import './AdInterstitial.css';

const WAIT_SECONDS = 5;

export default function AdInterstitial({ onContinue, onClose }) {
  const { t } = useT();

  const [countdown, setCountdown] = useState(WAIT_SECONDS);
  const intervalRef = useRef(null);  const consent = getAdConsent();
  const hasAdsense = !!getAdsenseClientId();

  useEffect(() => {
    if (consent !== 'accepted' || !hasAdsense) return;

    loadAdsenseScript();
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}

    intervalRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(intervalRef.current); return 0; }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [consent, hasAdsense]);

  // Si pas de pub à montrer → ne rien rendre (onContinue déjà appelé)
  if (consent !== 'accepted' || !hasAdsense) return null;

  return (
    <div className="ad-interstitial-overlay">
      <div className="ad-interstitial-panel">
        <div className="ad-interstitial-header">
          <span className="ad-interstitial-label">{t('ad_label')}</span>
          {countdown === 0 && (
            <button className="ad-interstitial-close" onClick={onClose}>✕</button>
          )}
        </div>

        <ins
          className="adsbygoogle ad-interstitial-slot"
          style={{ display: 'block' }}
          data-ad-client={getAdsenseClientId()}
          data-ad-slot="INTERSTITIAL_SLOT_ID"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />

        <div className="ad-interstitial-footer">
          {countdown > 0 ? (
            <p>{t('ad_wait', { n: countdown, s: countdown > 1 ? 's' : '' })}</p>
          ) : (
            <button className="ad-interstitial-btn" onClick={onContinue}>{t('ad_continue')}</button>
          )}
        </div>
      </div>
    </div>
  );
}
