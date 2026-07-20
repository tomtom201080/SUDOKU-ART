// src/components/OnboardingModal.jsx
import { useState } from 'react';
import { useT } from '../i18n/index.jsx';
import './OnboardingModal.css';

export default function OnboardingModal({ onClose }) {
  const { t } = useT();
  const SLIDES = [
    { icon: '🧩', title: t('onboarding_s1_title'), text: t('onboarding_s1_text') },
    { icon: '🖼️', title: t('onboarding_s2_title'), text: t('onboarding_s2_text') },
    { icon: '✨', title: t('onboarding_s3_title'), text: t('onboarding_s3_text') },
    { icon: '🎯', title: t('onboarding_s4_title'), text: t('onboarding_s4_text') },
  ];
  const [idx, setIdx] = useState(0);
  const slide = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;
  return (
    <div className="onboarding-overlay">
      <div className="onboarding-panel">
        <button className="onboarding-skip" onClick={onClose}>{t('onboarding_skip')}</button>
        <div className="onboarding-icon">{slide.icon}</div>
        <h2 className="onboarding-title">{slide.title}</h2>
        <p className="onboarding-text">{slide.text}</p>
        <div className="onboarding-dots">
          {SLIDES.map((_, i) => (
            <span key={i} className={`onboarding-dot ${i === idx ? 'active' : ''}`} onClick={() => setIdx(i)} />
          ))}
        </div>
        <button className="onboarding-btn" onClick={() => isLast ? onClose() : setIdx(i => i + 1)}>
          {isLast ? t('onboarding_start') : t('onboarding_next')}
        </button>
      </div>
    </div>
  );
}
