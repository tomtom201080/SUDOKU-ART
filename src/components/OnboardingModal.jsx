// src/components/OnboardingModal.jsx
import { useState } from 'react';
import './OnboardingModal.css';

const SLIDES = [
  {
    icon: '🧩',
    title: 'Un Sudoku pas comme les autres',
    text: 'Remplis la grille avec les chiffres de 1 à 9 : chaque ligne, colonne et carré de 3×3 doit contenir chaque chiffre une seule fois.'
  },
  {
    icon: '🖼️',
    title: 'Une photo cachée derrière',
    text: 'Une œuvre d\'art (ou ta propre photo) se cache derrière la grille. Elle se révèle case par case au fil de tes bonnes réponses.'
  },
  {
    icon: '✨',
    title: 'Complète une ligne, admire l\'image',
    text: 'Quand tu complètes une ligne, une colonne ou un carré, la grille s\'efface 2 secondes pour te laisser contempler la portion révélée.'
  },
  {
    icon: '🎯',
    title: 'Défie tes amis !',
    text: 'Termine une grille, puis envoie exactement la même à un ami via WhatsApp. Comparez vos scores et découvrez qui est le meilleur !'
  }
];

export default function OnboardingModal({ onClose }) {
  const [idx, setIdx] = useState(0);
  const slide = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-panel">
        <button className="onboarding-skip" onClick={onClose}>Passer</button>

        <div className="onboarding-icon">{slide.icon}</div>
        <h2 className="onboarding-title">{slide.title}</h2>
        <p className="onboarding-text">{slide.text}</p>

        <div className="onboarding-dots">
          {SLIDES.map((_, i) => (
            <span key={i} className={`onboarding-dot ${i === idx ? 'active' : ''}`} onClick={() => setIdx(i)} />
          ))}
        </div>

        <button
          className="onboarding-btn"
          onClick={() => isLast ? onClose() : setIdx(i => i + 1)}
        >
          {isLast ? 'C\'est parti ! 🚀' : 'Suivant →'}
        </button>
      </div>
    </div>
  );
}
