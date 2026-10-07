// src/utils/shareGridImage.js
// Génère l'image PNG "grille + QR" proposée par le partage natif
// (ShareGridPanel.jsx) — réutilise le rendu de grille déjà construit pour
// l'outil admin (src/utils/teaserCanvas.js : drawGrid, loadImage,
// TEASER_THEMES, roundRectPath) plutôt que d'en récrire un, avec une mise en
// page différente (plus simple, sans habillage) : logo + nom en haut,
// grille fidèle à l'état courant de la partie, QR + libellé en bas.
import { TEASER_THEMES, drawGrid, loadImage, roundRectPath } from './teaserCanvas';

const WIDTH = 1000;
const HEIGHT = 1300;

export async function renderShareImage({ puzzle, givenMask, revealedCells, artworkSrc, qrDataUrl, label, isVideo = false }) {
  const colors = TEASER_THEMES.light;

  const [artworkImg, logoImg, qrImg] = await Promise.all([
    artworkSrc ? loadImage(artworkSrc, { crossOrigin: 'anonymous' }) : Promise.resolve(null),
    loadImage('/favicon.svg'),
    loadImage(qrDataUrl)
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Logo + nom, en haut.
  const logoSize = 64;
  const cx = WIDTH / 2;
  ctx.font = '800 44px system-ui, -apple-system, "Segoe UI", sans-serif';
  const nameWidth = ctx.measureText('Sudoku Art').width;
  const groupX = cx - (logoSize + 14 + nameWidth) / 2;
  ctx.drawImage(logoImg, groupX, 40, logoSize, logoSize);
  ctx.fillStyle = colors.text;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Sudoku Art', groupX + logoSize + 14, 40 + logoSize / 2 + 2);

  // Grille, fidèle à l'état courant (chiffres saisis + révélation réelle).
  const gridSize = 860;
  const gridX = (WIDTH - gridSize) / 2;
  const gridY = 140;
  drawGrid(ctx, { x: gridX, y: gridY, size: gridSize, revealedCells, artworkImg, colors, givenMask, puzzle });

  // Badge ▶ au centre de la grille : signale qu'une vidéo est à débloquer
  // une fois la grille résolue (jamais lue ici, juste indiquée).
  if (isVideo) {
    const badgeRadius = 56;
    ctx.beginPath();
    ctx.arc(cx, gridY + gridSize / 2, badgeRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 48px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('▶', cx + 4, gridY + gridSize / 2 + 2);
  }

  // QR + libellé, en bas.
  const qrSize = 260;
  const qrY = gridY + gridSize + 40;
  const qrX = cx - qrSize / 2;
  ctx.fillStyle = '#FFFFFF';
  roundRectPath(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 16);
  ctx.fill();
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  ctx.fillStyle = colors.textMuted;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '600 32px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillText(label, cx, qrY + qrSize + 56);

  return canvas;
}
