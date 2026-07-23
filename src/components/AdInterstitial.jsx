import { useT } from '../i18n/index.jsx';
// src/components/AdInterstitial.jsx
// S'affiche avant une action "premium" (envoi de défi, grille avec photo).
// La pub s'affiche toujours si AdSense est configuré : le consentement ne
// conditionne que sa personnalisation (voir pushAdsenseAd dans lib/adsense),
// jamais son affichage.
import { useEffect, useRef, useState } from 'react';
import { getAdConsent } from '../lib/adConsent';
import { loadAdsenseScript, pushAdsenseAd, getAdsenseClientId, getAdProvider } from '../lib/adsense';
import InternalPromo from './InternalPromo';
import { trackInternalPromoClose } from '../lib/tracking';
import './AdInterstitial.css';

const WAIT_SECONDS = 5;

export default function AdInterstitial({ onContinue, onClose }) {
  const { t, lang } = useT();

  const [countdown, setCountdown] = useState(WAIT_SECONDS);
  const intervalRef = useRef(null);
  const consent = getAdConsent();
  const provider = getAdProvider();
  const clientId = getAdsenseClientId();
  const showAdsense = provider === 'adsense' && !!clientId;
  // Rien à montrer (ni pub, ni promo interne) → ne jamais bloquer l'action
  // en attente derrière cet interstitiel.
  const showNothing = provider === 'off';

  useEffect(() => {
    if (showNothing) return;

    if (showAdsense) {
      loadAdsenseScript();
      pushAdsenseAd(consent === 'accepted');
    }

    intervalRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(intervalRef.current); return 0; }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [showAdsense, showNothing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Échap ferme l'interstitiel dès que la fermeture est possible (même
  // condition que le bouton ✕), sans jamais la devancer.
  useEffect(() => {
    if (showNothing || countdown > 0) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') handleClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showNothing, countdown, onClose, showAdsense, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  // Ni pub ni promo interne à montrer (provider "off") → laisse l'action en
  // attente se poursuivre immédiatement plutôt que de rester bloquée.
  useEffect(() => {
    if (showNothing) onContinue?.();
  }, [showNothing, onContinue]); // eslint-disable-line react-hooks/exhaustive-deps

  if (showNothing) return null;

  const handleClose = () => {
    if (!showAdsense) {
      trackInternalPromoClose({ placement: 'challenge_interstitial', format: 'interstitial', language: lang, route: window.location.pathname });
    }
    onClose?.();
  };

  return (
    <div className="ad-interstitial-overlay">
      <div className="ad-interstitial-panel">
        <div className="ad-interstitial-header">
          <span className="ad-interstitial-label">{t('ad_label')}</span>
          {countdown === 0 && (
            <button className="ad-interstitial-close" onClick={handleClose}>✕</button>
          )}
        </div>

        {showAdsense ? (
          <ins
            className="adsbygoogle ad-interstitial-slot"
            style={{ display: 'block' }}
            data-ad-client={clientId}
            data-ad-slot="1388673635"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <InternalPromo format="interstitial" placement="challenge_interstitial" />
        )}

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
