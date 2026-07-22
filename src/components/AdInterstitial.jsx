import { useT } from '../i18n/index.jsx';
// src/components/AdInterstitial.jsx
// S'affiche avant une action "premium" (envoi de défi, grille avec photo).
// La pub s'affiche toujours si AdSense est configuré : le consentement ne
// conditionne que sa personnalisation (voir pushAdsenseAd dans lib/adsense),
// jamais son affichage.
import { useEffect, useRef, useState } from 'react';
import { getAdConsent } from '../lib/adConsent';
import { loadAdsenseScript, pushAdsenseAd, getAdsenseClientId } from '../lib/adsense';
import './AdInterstitial.css';

const WAIT_SECONDS = 5;

export default function AdInterstitial({ onContinue, onClose }) {
  const { t } = useT();

  const [countdown, setCountdown] = useState(WAIT_SECONDS);
  const intervalRef = useRef(null);
  const consent = getAdConsent();
  const hasAdsense = !!getAdsenseClientId();

  useEffect(() => {
    if (!hasAdsense) return;

    loadAdsenseScript();
    pushAdsenseAd(consent === 'accepted');

    intervalRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(intervalRef.current); return 0; }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [hasAdsense]); // eslint-disable-line react-hooks/exhaustive-deps

  // Si pas de pub à montrer (AdSense non configuré) → ne rien rendre
  if (!hasAdsense) return null;

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
          data-ad-slot="1388673635"
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
