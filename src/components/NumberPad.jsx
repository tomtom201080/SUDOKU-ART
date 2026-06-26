// src/components/NumberPad.jsx
import { forwardRef } from 'react';
import './NumberPad.css';

const NumberPad = forwardRef(function NumberPad({
  onInput,
  disabled,
  notesMode,
  onToggleNotes,
  onUndo,
  canUndo,
  onHint
}, ref) {
  return (
    <div className="number-pad" ref={ref}>
      <div className="number-pad-digits">
        {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
          <button
            key={num}
            className="number-pad-btn"
            onClick={() => onInput(num)}
            disabled={disabled}
          >
            {num}
          </button>
        ))}
      </div>

      <div className="number-pad-actions">
        <button
          className="number-pad-btn number-pad-erase"
          onClick={() => onInput(0)}
          disabled={disabled}
        >
          ✕ Effacer
        </button>

        <button
          className={`number-pad-btn number-pad-notes ${notesMode ? 'is-active' : ''}`}
          onClick={onToggleNotes}
          disabled={disabled}
        >
          {notesMode ? '✏️ Désactiver' : '✏️ Notes'}
        </button>

        <button
          className="number-pad-btn number-pad-undo"
          onClick={onUndo}
          disabled={disabled || !canUndo}
        >
          ↩️ Annuler
        </button>

        <button
          className="number-pad-btn number-pad-hint"
          onClick={onHint}
          disabled={disabled}
        >
          💡 Indice
        </button>
      </div>
    </div>
  );
});

export default NumberPad;
