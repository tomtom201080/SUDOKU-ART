// src/components/HintModal.jsx
import './HintModal.css';

export default function HintModal({ hint, steps, stepIndex, onPrev, onNext, onFill, onClose }) {
  if (!hint || hint.certainty === 'none') {
    return (
      <div className="hint-bar">
        <p>
          Pas d'indice direct disponible pour le moment : aucune case n'est
          déductible à 100% ni même par une piste à 2 cases. Continue de
          jouer, de nouvelles déductions vont s'ouvrir !
        </p>
        <button className="hint-btn-secondary" onClick={onClose}>Fermer</button>
      </div>
    );
  }

  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const isCertain = hint.certainty === 'certain';

  return (
    <div className="hint-bar">
      <div className="hint-bar-header">
        <span className="hint-step-label">{step.label}</span>
        {isCertain && (
          <span className="hint-step-progress">Étape {stepIndex + 1} / {steps.length}</span>
        )}
      </div>

      <p className="hint-step-text">{step.text}</p>

      <div className="hint-bar-actions">
        {isCertain && (
          <button
            className="hint-btn-secondary"
            onClick={onPrev}
            disabled={stepIndex === 0}
          >
            ← Précédent
          </button>
        )}

        {isCertain && isLastStep && (
          <button className="hint-btn-primary" onClick={() => onFill(hint.row, hint.col, hint.value)}>
            Remplir avec {hint.value}
          </button>
        )}
        {isCertain && !isLastStep && (
          <button className="hint-btn-primary" onClick={onNext}>
            Suivant →
          </button>
        )}

        <button className="hint-btn-close" onClick={onClose}>✕</button>
      </div>
    </div>
  );
}
