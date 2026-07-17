// src/components/HintModal.jsx
import { useState, useEffect } from 'react';
import { getAdConsent } from '../lib/adConsent';
import { loadAdsenseScript, getAdsenseClientId } from '../lib/adsense';
import './HintModal.css';

const AD_WAIT = 5;

export default function HintModal({ hint, onFill, onClose, hintsUsed = 0, maxHints = null }) {
  const [phase, setPhase] = useState('ad'); // 'ad' | 'reveal'
  const [countdown, setCountdown] = useState(AD_WAIT);
  const consent = getAdConsent();
  const hasAdsense = !!getAdsenseClientId();
  const showAd = consent === 'accepted' && hasAdsense;

  useEffect(() => {
    if (!showAd) {
      setPhase('reveal');
      return;
    }
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

  const hintCounterLabel = maxHints != null
    ? `Indice ${hintsUsed + 1} / ${maxHints}`
    : `Indice utilisé (${hintsUsed + 1})`;

  if (phase === 'ad') {
    return (
      <div className="hint-bar">
        <div className="hint-bar-header">
          <span className="hint-step-label">📢 Publicité</span>
          <span className="hint-step-progress">{countdown}s</span>
        </div>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', minHeight: 80 }}
          data-ad-client={getAdsenseClientId()}
          data-ad-slot="HINT_SLOT_ID"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <p className="hint-step-text" style={{ margin: '8px 0 0', fontSize: '0.78rem' }}>
          L'indice sera disponible dans {countdown} seconde{countdown > 1 ? 's' : ''}…
        </p>
      </div>
    );
  }

  // Phase reveal : afficher le chiffre révélé
  if (!hint || !hint.row === undefined) {
    return (
      <div className="hint-bar">
        <p>Aucun indice disponible.</p>
        <button className="hint-btn-secondary" onClick={onClose}>Fermer</button>
      </div>
    );
  }

  return (
    <div className="hint-bar">
      <div className="hint-bar-header">
        <span className="hint-step-label">💡 {hintCounterLabel}</span>
      </div>
      <div className="hint-reveal">
        <span className="hint-reveal-number">{hint.value}</span>
      </div>
      <p className="hint-step-text">
        La case surlignée en vert contient le chiffre <strong>{hint.value}</strong>.
      </p>
      <div className="hint-bar-actions">
        <button className="hint-btn-primary" onClick={() => onFill(hint.row, hint.col, hint.value)}>
          Placer le {hint.value}
        </button>
        <button className="hint-btn-close" onClick={onClose}>✕</button>
      </div>
    </div>
  );
}
