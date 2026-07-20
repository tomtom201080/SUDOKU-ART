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
        <h2 className="maxerr-title">{t('maxerr_ad_title')}</h2>
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
        <h2 className="maxerr-title">{t('maxerr_granted')}</h2>
        <p className="maxerr-desc">{t('maxerr_granted_desc', { n: maxErrors - 1, max: maxErrors + 1 })}</p>
        <button className="maxerr-btn-continue" onClick={onContinue}>
          {t('maxerr_continue_btn')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="maxerr-overlay">
      <div className="maxerr-panel">
        <p className="maxerr-icon">😬</p>
        <h2 className="maxerr-title">{t('maxerr_title', { n: errorCount })}</h2>
        <p className="maxerr-desc">
          {t('maxerr_desc')}
        </p>
        <div className="maxerr-actions">
          {canShowAd ? (
            <button className="maxerr-btn-ad" onClick={() => setPhase('ad')}>
              {t('maxerr_watch_ad_full')}
            </button>
          ) : (
            <button className="maxerr-btn-ad" onClick={onContinue}>
              {t('maxerr_continue')}
            </button>
          )}
          <button className="maxerr-btn-quit" onClick={onGameOver}>
            {t('maxerr_quit_full')}
          </button>
        </div>
      </div>
    </div>
  );
}
