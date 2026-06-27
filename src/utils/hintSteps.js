// src/utils/hintSteps.js
function formatList(numbers) {
  if (!numbers || numbers.length === 0) return 'aucun';
  return numbers.join(', ');
}

// Construit les 4 étapes du raisonnement pour un indice donné, chacune avec
// les cases à surligner sur la grille et le texte d'explication associé.
export function buildHintSteps(hint) {
  if (!hint) return [];
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
