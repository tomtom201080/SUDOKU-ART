// src/components/HintModal.jsx
import { useState } from 'react';
import './HintModal.css';

function formatList(numbers) {
  if (numbers.length === 0) return 'aucun';
  return numbers.join(', ');
}

export default function HintModal({ hint, onFill, onClose }) {
  const [revealed, setRevealed] = useState(false);

  if (!hint) {
    return (
      <div className="hint-overlay">
        <div className="hint-panel">
          <h2>Indice</h2>
          <p>Sélectionne d'abord une case vide de la grille pour obtenir un indice.</p>
          <button className="hint-btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    );
  }

  const { usedInRow, usedInCol, usedInBox, candidates, value } = hint;
  const isObvious = candidates.length === 1;

  return (
    <div className="hint-overlay">
      <div className="hint-panel">
        <h2>Indice — case ligne {hint.row + 1}, colonne {hint.col + 1}</h2>

        <p>
          Dans la <strong>ligne</strong>, les chiffres déjà posés sont : {formatList(usedInRow)}.
        </p>
        <p>
          Dans la <strong>colonne</strong>, les chiffres déjà posés sont : {formatList(usedInCol)}.
        </p>
        <p>
          Dans le <strong>carré</strong> 3x3, les chiffres déjà posés sont : {formatList(usedInBox)}.
        </p>

        {isObvious ? (
          <p className="hint-conclusion">
            En combinant tout ça, le seul chiffre qui n'apparaît encore ni dans la ligne,
            ni dans la colonne, ni dans le carré est <strong>{candidates[0]}</strong>.
            C'est donc la valeur de cette case.
          </p>
        ) : (
          <p className="hint-conclusion">
            Plusieurs chiffres restent possibles par simple élimination ({formatList(candidates)}),
            mais en regardant plus loin dans le reste de la grille, la valeur correcte ici est <strong>{value}</strong>.
          </p>
        )}

        {!revealed ? (
          <button className="hint-btn-primary" onClick={() => setRevealed(true)}>
            Révéler la valeur
          </button>
        ) : (
          <button className="hint-btn-primary" onClick={() => onFill(hint.row, hint.col, value)}>
            Remplir la case avec {value}
          </button>
        )}

        <button className="hint-btn-secondary" onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
}
