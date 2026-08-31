// src/utils/teaserCanvas.test.js
// Couvre la partie pure (sans <canvas>) du générateur de grille teaser admin :
// le tirage aléatoire des cases révélées doit être déterministe (même seed
// -> même tirage, pour ne pas redistribuer les cases à chaque re-render) et
// respecter le pourcentage demandé ; la mise en page doit garder la grille
// dans les limites du visuel quel que soit le format.
import { describe, it, expect } from 'vitest';
import { pickRandomCells, computeLayout, TEASER_FORMATS, cellKey } from './teaserCanvas';

describe('pickRandomCells', () => {
  it('révèle le bon nombre de cases pour un pourcentage donné', () => {
    const cells = pickRandomCells(25, 1);
    expect(cells.size).toBe(Math.round(0.25 * 81));
  });

  it('est déterministe pour une même seed', () => {
    const a = pickRandomCells(30, 42);
    const b = pickRandomCells(30, 42);
    expect([...a].sort()).toEqual([...b].sort());
  });

  it('change de tirage quand la seed change', () => {
    const a = pickRandomCells(30, 1);
    const b = pickRandomCells(30, 2);
    expect([...a].sort()).not.toEqual([...b].sort());
  });

  it('ne révèle aucune case à 0 % et toute la grille à 100 %', () => {
    expect(pickRandomCells(0, 7).size).toBe(0);
    expect(pickRandomCells(100, 7).size).toBe(81);
  });

  it("ne renvoie que des clés 'row-col' valides (0-8)", () => {
    const cells = pickRandomCells(40, 3);
    for (const key of cells) {
      const [row, col] = key.split('-').map(Number);
      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThanOrEqual(8);
      expect(col).toBeGreaterThanOrEqual(0);
      expect(col).toBeLessThanOrEqual(8);
      expect(key).toBe(cellKey(row, col));
    }
  });
});

describe('computeLayout', () => {
  it('garde la grille carrée entièrement dans le canevas (formats empilés)', () => {
    for (const key of ['square', 'story']) {
      const format = TEASER_FORMATS[key];
      const layout = computeLayout(format);
      expect(layout.gridX).toBeGreaterThanOrEqual(0);
      expect(layout.gridY).toBeGreaterThanOrEqual(0);
      expect(layout.gridX + layout.gridSize).toBeLessThanOrEqual(format.width + 0.5);
      expect(layout.gridY + layout.gridSize).toBeLessThanOrEqual(format.height + 0.5);
      expect(layout.gridSize).toBeGreaterThan(0);
    }
  });

  it('place la grille et la colonne latérale sans chevauchement (format paysage)', () => {
    const format = TEASER_FORMATS.landscape;
    const layout = computeLayout(format);
    expect(layout.mode).toBe('side');
    expect(layout.gridX + layout.gridSize).toBeLessThanOrEqual(layout.sideX + 0.5);
    expect(layout.sideX + layout.sideWidth).toBeLessThanOrEqual(format.width + 0.5);
    expect(layout.gridY + layout.gridSize).toBeLessThanOrEqual(format.height + 0.5);
  });
});
