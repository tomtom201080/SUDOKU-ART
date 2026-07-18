// src/components/HintModal.jsx
import { useState, useEffect } from 'react';
import { useT } from '../i18n/index.jsx';
import { getAdConsent } from '../lib/adConsent';
import { loadAdsenseScript, getAdsenseClientId } from '../lib/adsense';
import './HintModal.css';

const AD_WAIT = 5;

export default function HintModal({ hint, onFill, onClose, hintsUsed = 0, maxHints = null }) {
  const { t } = useT();
  const [phase, setPhase] = useState('ad');
  const [countdown, setCountdown] = useState(AD_WAIT);
  const consent = getAdConsent();
  const hasAdsense = !!getAdsenseClientId();
  const showAd = consent === 'accepted' && hasAdsense;

  useEffect(() => {
    if (!showAd) { setPhase('reveal'); return; }
    loadAdsenseScript();
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
    const iv = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(iv); setPhase('reveal'); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [showAd]);

  const counterLabel = maxHints != null
    ? t('hint_counter_max', { n: hintsUsed + 1, max: maxHints })
    : t('hint_counter', { n: hintsUsed + 1 });

  if (phase === 'ad') return (
    <div className="hint-bar">
      <div className="hint-bar-header">
        <span className="hint-step-label">{t('hint_ad_label')}</span>
        <span className="hint-step-progress">{countdown}s</span>
      </div>
      <ins className="adsbygoogle" style={{ display: 'block', minHeight: 80 }}
        data-ad-client={getAdsenseClientId()} data-ad-slot="HINT_SLOT_ID"
        data-ad-format="auto" data-full-width-responsive="true" />
      <p className="hint-step-text" style={{ margin: '8px 0 0', fontSize: '0.78rem' }}>
        {t('hint_wait', { n: countdown, s: countdown > 1 ? 's' : '' })}
      </p>
    </div>
  );

  if (!hint) return (
    <div className="hint-bar">
      <p>{t('hint_none')}</p>
      <button className="hint-btn-secondary" onClick={onClose}>{t('hint_close')}</button>
    </div>
  );

  return (
    <div className="hint-bar">
      <div className="hint-bar-header">
        <span className="hint-step-label">💡 {counterLabel}</span>
      </div>
      <div className="hint-reveal">
        <span className="hint-reveal-number">{hint.value}</span>
      </div>
      <p className="hint-step-text">{t('hint_revealed', { v: hint.value })}</p>
      <div className="hint-bar-actions">
        <button className="hint-btn-primary" onClick={() => onFill(hint.row, hint.col, hint.value)}>
          {t('hint_place', { v: hint.value })}
        </button>
        <button className="hint-btn-close" onClick={onClose}>✕</button>
      </div>
    </div>
  );
}
