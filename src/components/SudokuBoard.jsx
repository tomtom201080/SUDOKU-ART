// src/components/SudokuBoard.jsx
import { forwardRef } from 'react';
import './SudokuBoard.css';

// Calcule la position de fond pour afficher la tranche (row, col) d'une image
// découpée en 9x9, avec background-size: 900% 900%.
function backgroundPositionFor(row, col) {
  const x = (col / 8) * 100;
  const y = (row / 8) * 100;
  return `${x}% ${y}%`;
}

function sameBox(r1, c1, r2, c2) {
  return Math.floor(r1 / 3) === Math.floor(r2 / 3) && Math.floor(c1 / 3) === Math.floor(c2 / 3);
}

function boxIndexOf(row, col) {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

const SudokuBoard = forwardRef(function SudokuBoard({
  puzzleData,
  userGrid,
  watermark,
  watermarkVisible,
  imageIntensity,
  notesGrid,
  errorCells,
  isCellRevealed,
  selectedCell,
  highlightValue,
  celebrate,
  isComplete,
  hintHighlight,
  hintTargetCell,
  onSelectCell
}, ref) {
  if (!puzzleData || !userGrid) return null;

  const watermarkDisabled = (imageIntensity ?? 0.28) <= 0;
  const hintActive = !!hintHighlight;

  const showPeerHighlight = !!selectedCell && !isComplete && !hintActive;
  const showSameValueHighlight = !!highlightValue && highlightValue !== 0 && !isComplete && !hintActive;
  // Une fois la grille terminée, on laisse voir la photo dans ses couleurs
  // pleines, sans le voile dosé par le curseur d'intensité.
  const veilOpacity = isComplete ? 0 : 1 - (imageIntensity ?? 0.28);

  return (
    <div className="sudoku-board" role="grid" ref={ref}>
      {Array.from({ length: 9 }).map((_, row) => (
        <div className="sudoku-row" key={row}>
          {Array.from({ length: 9 }).map((_, col) => {
            const value = userGrid[row][col];
            const isGiven = puzzleData.givenMask[row][col];
            const isValidated = value !== 0 && value === puzzleData.solution[row][col];
            const isLocked = isGiven || isValidated;
            const rawRevealed = isCellRevealed(row, col);
            const finalRevealed = watermarkVisible && rawRevealed && !showPeerHighlight;
            const hasError = errorCells.has(`${row}-${col}`);
            const isSelected = selectedCell?.row === row && selectedCell?.col === col;
            const isCelebrating =
              !watermarkDisabled &&
              (celebrate ?? []).some(c =>
                c.type === 'all' ||
                (c.type === 'box' && boxIndexOf(row, col) === c.index) ||
                (c.type === 'row' && row === c.index) ||
                (c.type === 'col' && col === c.index)
              );

            const isPeer =
              showPeerHighlight &&
              !isSelected &&
              (row === selectedCell.row ||
                col === selectedCell.col ||
                sameBox(row, col, selectedCell.row, selectedCell.col));

            const isSameValue = showSameValueHighlight && value === highlightValue;

            const isHintZone =
              hintHighlight?.cells.some(c => c.row === row && c.col === col);
            const isHintTarget =
              hintTargetCell?.row === row && hintTargetCell?.col === col;

            const thickRight = col === 2 || col === 5;
            const thickBottom = row === 2 || row === 5;

            const bgStyle =
              watermark && watermarkVisible && !watermarkDisabled
                ? {
                    backgroundImage: `url(${watermark.path})`,
                    backgroundSize: '900% 900%',
                    backgroundPosition: backgroundPositionFor(row, col)
                  }
                : undefined;

            const cellNotes = notesGrid ? notesGrid[row][col] : null;
            const showNotes = value === 0 && cellNotes && cellNotes.some(Boolean);

            return (
              <button
                key={col}
                type="button"
                className={[
                  'sudoku-cell',
                  isLocked ? 'is-given' : '',
                  isSelected ? 'is-selected' : '',
                  isPeer ? 'is-peer' : '',
                  isSameValue ? 'is-same-value' : '',
                  hasError ? 'has-error' : '',
                  isHintZone ? `hint-zone-${hintHighlight.color}` : '',
                  isHintTarget ? 'hint-target' : '',
                  thickRight ? 'thick-right' : '',
                  thickBottom ? 'thick-bottom' : ''
                ].join(' ').trim()}
                onClick={() => onSelectCell(row, col)}
              >
                {bgStyle && <span className="cell-bg" style={bgStyle} aria-hidden="true" />}
                <span
                  className="cell-cover"
                  style={{ opacity: finalRevealed ? veilOpacity : 1 }}
                  aria-hidden="true"
                />
                {showNotes ? (
                  <span className="cell-notes" aria-hidden="true">
                    {cellNotes.map((active, i) => (
                      <span key={i} className="note-digit">
                        {active ? i + 1 : ''}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="cell-value">{value !== 0 ? value : ''}</span>
                )}
                {isCelebrating && <span className="cell-sparkle" aria-hidden="true">✨</span>}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
});

export default SudokuBoard;
