// src/components/HintModal.jsx
// Nouveau flux : pub → choix du chiffre → révélation animée dans la grille
import { useState, useEffect, useCallback } from 'react';
import { useT } from '../i18n/index.jsx';
import { getAdConsent } from '../lib/adConsent';
import { loadAdsenseScript, getAdsenseClientId } from '../lib/adsense';
import './HintModal.css';

const AD_WAIT = 5;

// mode: 'random' (choisir un chiffre, l'app pioche une case au hasard) ou
// 'pick' (l'utilisateur désigne lui-même la case sur la grille — la
// sélection se fait alors hors de ce composant, via onReadyToPick).
export default function HintModal({
  mode = 'random',
  userGrid,
  puzzleSolution,
  onRevealHint,   // (row, col, value) → place le chiffre + animation
  onReadyToPick,  // appelé une fois la pub passée, en mode 'pick'
  onClose,
  hintsUsed = 0,
  maxHints = null
}) {
  const { t } = useT();
  const [phase, setPhase] = useState('ad'); // 'ad' | 'pick'
  const [countdown, setCountdown] = useState(AD_WAIT);
  const consent = getAdConsent();
  const hasAdsense = !!getAdsenseClientId();
  const showAd = consent === 'accepted' && hasAdsense;

  useEffect(() => {
    if (!showAd) {
      // Pas de pub à montrer (refusée ou non configurée) : on passe
      // directement à la suite, sans jamais bloquer l'indice.
      if (mode === 'pick') onReadyToPick?.();
      else setPhase('pick');
      return;
    }
    loadAdsenseScript();
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
    const iv = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(iv);
          if (mode === 'pick') onReadyToPick?.();
          else setPhase('pick');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [showAd, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Calcule quels chiffres ont encore des cases vides
  const availableDigits = useCallback(() => {
    if (!userGrid || !puzzleSolution) return [];
    const available = new Set();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (userGrid[r][c] === 0) {
          available.add(puzzleSolution[r][c]);
        }
      }
    }
    return Array.from(available).sort((a, b) => a - b);
  }, [userGrid, puzzleSolution]);

  const handlePickDigit = (digit) => {
    // Trouver une case vide pour ce chiffre (au hasard parmi toutes)
    const candidates = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (userGrid[r][c] === 0 && puzzleSolution[r][c] === digit) {
          candidates.push({ row: r, col: c });
        }
      }
    }
    if (candidates.length === 0) return;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    onRevealHint(pick.row, pick.col, digit);
    onClose();
  };

  const digits = availableDigits();
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
      <p className="hint-step-text">
        {t('hint_wait', { n: countdown, s: countdown > 1 ? 's' : '' })}
      </p>
    </div>
  );

  return (
    <div className="hint-bar">
      <div className="hint-bar-header">
        <span className="hint-step-label">💡 {counterLabel}</span>
        <button className="hint-btn-close" onClick={onClose}>✕</button>
      </div>
      <p className="hint-pick-question">{t('hint_question')}</p>
      <div className="hint-digit-grid">
        {digits.map(d => (
          <button key={d} className="hint-digit-btn" onClick={() => handlePickDigit(d)}>
            {d}
          </button>
        ))}
        {digits.length === 0 && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t('hint_none')}</p>}
      </div>
    </div>
  );
}
