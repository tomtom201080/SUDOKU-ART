import { useT } from '../i18n/index.jsx';
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
  onHint,
  hintsDisabled,
  completedDigits
}, ref) {
  return (
    <div className="number-pad" ref={ref}>
      <div className="number-pad-digits">
        {Array.from({ length: 9 }, (_, i) => i + 1).map(num =>
          completedDigits?.has(num) ? (
            <span key={num} className="number-pad-btn number-pad-btn-hidden" aria-hidden="true" />
          ) : (
            <button
              key={num}
              className="number-pad-btn"
              onClick={() => onInput(num)}
              disabled={disabled}
            >
              {num}
            </button>
          )
        )}
      </div>

      <div className="number-pad-actions">
        <button
          className="number-pad-btn number-pad-erase"
          onClick={() => onInput(0)}
          disabled={disabled}
        >
          {t('game_erase')}
        </button>

        <button
          className={`number-pad-btn number-pad-notes ${notesMode ? 'is-active' : ''}`}
          onClick={onToggleNotes}
          disabled={disabled}
        >
          {notesMode ? '✏️ Off' : t('game_notes')}
        </button>

        <button
          className="number-pad-btn number-pad-undo"
          onClick={onUndo}
          disabled={disabled || !canUndo}
        >
          {t('game_undo')}
        </button>

        <button
          className={`number-pad-btn number-pad-hint ${hintsDisabled ? 'is-disabled' : ''}`}
          onClick={hintsDisabled ? undefined : onHint}
          disabled={disabled || hintsDisabled}
          title={hintsDisabled ? true /* fr fallback */ ? 'Limite d\'indices atteinte' : 'Hint limit reached' : undefined}
        >
          {t('game_hint')}{hintsDisabled ? ' 🚫' : ''}
        </button>
      </div>
    </div>
  );
});

export default NumberPad;
