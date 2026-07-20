// src/utils/hintSteps.js
function formatList(numbers) {
  if (!numbers || numbers.length === 0) return 'aucun';
  return numbers.join(', ');
}

// Construit les étapes du raisonnement pour un indice donné. Gère les 3 cas
// possibles renvoyés par game.getHint() :
// - "certain" : une case où un seul chiffre est encore possible -> 4 étapes
//   (ligne, colonne, carré, conclusion) ;
// - "partial" : pas de certitude totale, mais un chiffre limité à 2 cases
//   d'une même ligne/colonne/carré -> 1 étape, sans réponse donnée ;
// - "none" : aucun indice direct disponible -> 0 étape.
export function buildHintSteps(hint) {
  if (!hint) return [];

  if (hint.certainty === 'certain') {
    const isObvious = hint.candidates.length === 1;

    const rowZone = Array.from({ length: 9 }, (_, c) => ({ row: hint.row, col: c }));
    const colZone = Array.from({ length: 9 }, (_, r) => ({ row: r, col: hint.col }));
    const boxRow = Math.floor(hint.row / 3) * 3;
    const boxCol = Math.floor(hint.col / 3) * 3;
    const boxZone = [];
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) boxZone.push({ row: r, col: c });
    }

    return [
      {
        color: 'row',
        cells: rowZone,
        label: '1. La ligne',
        text: `On regarde toute la ligne ${hint.row + 1} : les chiffres déjà posés sont ${formatList(hint.usedInRow)}.`
      },
      {
        color: 'col',
        cells: colZone,
        label: '2. La colonne',
        text: `On regarde toute la colonne ${hint.col + 1} : les chiffres déjà posés sont ${formatList(hint.usedInCol)}.`
      },
      {
        color: 'box',
        cells: boxZone,
        label: '3. Le carré',
        text: `On regarde le carré 3x3 qui contient la case : les chiffres déjà posés sont ${formatList(hint.usedInBox)}.`
      },
      {
        color: 'answer',
        cells: [{ row: hint.row, col: hint.col }],
        label: '4. La conclusion',
        text: isObvious
          ? `En combinant la ligne, la colonne et le carré, un seul chiffre n'apparaît nulle part : ${hint.value}. C'est la valeur de cette case !`
          : `Plusieurs chiffres restent possibles ici (${formatList(hint.candidates)}), mais en regardant plus loin dans la grille, la bonne valeur est ${hint.value}.`
      }
    ];
  }

  if (hint.certainty === 'partial') {
    return [
      {
        color: 'partial',
        cells: hint.cells,
        label: 'Piste (pas de certitude totale)',
        text: `Aucune case n'est encore déductible à 100% pour l'instant. Mais le chiffre ${hint.digit} ne peut se placer que dans l'une de ces deux cases, qui partagent la même ${hint.unitType}. Ça vaut le coup de réfléchir un peu plus de ce côté-là !`
      }
    ];
  }

  return [];
}
