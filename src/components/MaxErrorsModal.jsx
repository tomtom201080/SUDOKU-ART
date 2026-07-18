// src/components/MaxErrorsModal.jsx
import { useEffect, useState } from 'react';
import { useT } from '../i18n/index.jsx';
import { getAdConsent } from '../lib/adConsent';
import { loadAdsenseScript, getAdsenseClientId } from '../lib/adsense';
import './MaxErrorsModal.css';

const AD_WAIT = 5;

export default function MaxErrorsModal({ errorCount, maxErrors = 3, onContinue, onGameOver }) {
  const { t } = useT();
  const [phase, setPhase] = useState('ask'); // 'ask' | 'ad' | 'done'
  const [countdown, setCountdown] = useState(AD_WAIT);
  const consent = getAdConsent();
  const hasAdsense = !!getAdsenseClientId();
  const canShowAd = consent === 'accepted' && hasAdsense;

  useEffect(() => {
    if (phase !== 'ad') return;
    loadAdsenseScript();
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
    const iv = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(iv);
          setPhase('done');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [phase]);

  if (phase === 'ad') return (
    <div className="maxerr-overlay">
      <div className="maxerr-panel">
        <p className="maxerr-icon">📢</p>
        <h2 className="maxerr-title">Publicité en cours…</h2>
        <ins className="adsbygoogle maxerr-ad-slot"
          style={{ display: 'block', minHeight: 200 }}
          data-ad-client={getAdsenseClientId()}
          data-ad-slot="INTERSTITIAL_SLOT_ID"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <p className="maxerr-wait">{countdown}s…</p>
      </div>
    </div>
  );

  if (phase === 'done') return (
    <div className="maxerr-overlay">
      <div className="maxerr-panel">
        <p className="maxerr-icon">✅</p>
        <h2 className="maxerr-title">+1 chance accordée !</h2>
        <p className="maxerr-desc">Le compteur revient à {maxErrors - 1} / {maxErrors + 1}.</p>
        <button className="maxerr-btn-continue" onClick={onContinue}>
          ▶ Continuer la partie
        </button>
      </div>
    </div>
  );

  return (
    <div className="maxerr-overlay">
      <div className="maxerr-panel">
        <p className="maxerr-icon">😬</p>
        <h2 className="maxerr-title">{errorCount} erreurs !</h2>
        <p className="maxerr-desc">
          Tu as atteint la limite. Regarde une pub pour gagner une chance supplémentaire, ou termine la partie.
        </p>
        <div className="maxerr-actions">
          {canShowAd ? (
            <button className="maxerr-btn-ad" onClick={() => setPhase('ad')}>
              📺 Regarder une pub pour +1 chance
            </button>
          ) : (
            <button className="maxerr-btn-ad" onClick={onContinue}>
              ▶ Continuer quand même
            </button>
          )}
          <button className="maxerr-btn-quit" onClick={onGameOver}>
            Terminer la partie
          </button>
        </div>
      </div>
    </div>
  );
}
