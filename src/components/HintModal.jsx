// src/components/HintModal.jsx
import './HintModal.css';

export default function HintModal({ hint, steps, stepIndex, onPrev, onNext, onFill, onClose }) {
  if (!hint) {
    return (
      <div className="hint-bar">
        <p>Sélectionne d'abord une case vide de la grille pour obtenir un indice.</p>
        <button className="hint-btn-secondary" onClick={onClose}>Fermer</button>
      </div>
    );
  }

  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  return (
    <div className="hint-bar">
      <div className="hint-bar-header">
        <span className="hint-step-label">{step.label}</span>
        <span className="hint-step-progress">Étape {stepIndex + 1} / {steps.length}</span>
      </div>

      <p className="hint-step-text">{step.text}</p>

      <div className="hint-bar-actions">
        <button
          className="hint-btn-secondary"
          onClick={onPrev}
          disabled={stepIndex === 0}
        >
          ← Précédent
        </button>

        {isLastStep ? (
          <button className="hint-btn-primary" onClick={() => onFill(hint.row, hint.col, hint.value)}>
            Remplir avec {hint.value}
          </button>
        ) : (
          <button className="hint-btn-primary" onClick={onNext}>
            Suivant →
          </button>
        )}

        <button className="hint-btn-close" onClick={onClose}>✕</button>
      </div>
    </div>
  );
}
