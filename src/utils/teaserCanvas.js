// src/utils/teaserCanvas.js
// Logique pure (pas de React, pas de DOM au-delà de <canvas>/<img>) pour le
// générateur de grille teaser admin : tirage des cases révélées, chargement
// d'image et rendu du visuel final sur un <canvas> hors-écran, réutilisée par
// TeaserGridGenerator.jsx aussi bien pour l'aperçu que pour l'export.

// Couleurs reprises telles quelles de src/index.css (voir --grid-border,
// --grid-line, --card-bg) : le rendu canvas n'a pas accès aux variables CSS,
// donc on duplique ici les deux jeux de valeurs pour rester visuellement
// identique à la vraie grille du jeu.
export const TEASER_THEMES = {
  light: {
    bg: '#F7F1E4',
    cardBg: '#FFFFFF',
    cellBg: '#FFFFFF',
    gridBorder: '#0F7B6C',
    gridLine: '#3A332A',
    text: '#2E2A22',
    textMuted: '#8C8268',
    accent: '#0F7B6C',
    accentText: '#FFFFFF'
  },
  dark: {
    bg: '#14181F',
    cardBg: '#1F2530',
    cellBg: '#232A35',
    gridBorder: '#14A892',
    gridLine: '#3A4150',
    text: '#ECEAE3',
    textMuted: '#9AA3B2',
    accent: '#14A892',
    accentText: '#0A1F1C'
  }
};

export const TEASER_FORMATS = {
  square: {
    label: 'Carré 1080×1080 (post Instagram / Facebook)',
    width: 1080,
    height: 1080,
    mode: 'stacked'
  },
  story: {
    label: 'Vertical 1080×1920 (story / reel / TikTok)',
    width: 1080,
    height: 1920,
    mode: 'stacked'
  },
  landscape: {
    label: 'Paysage 1200×630 (partage lien / X)',
    width: 1200,
    height: 630,
    mode: 'side'
  }
};

// Petit PRNG déterministe (mulberry32) : à seed identique, le même tirage de
// cases révélées est reproduit — utile pour que changer un réglage sans
// changer la seed (ex. la tagline) ne redistribue pas les cases déjà validées
// par l'admin, et pour que les tests soient reproductibles.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function cellKey(row, col) {
  return `${row}-${col}`;
}

// Tire un sous-ensemble de cases (row-col) de la grille 9x9 correspondant à
// `percent` % de révélation, mélangé de façon déterministe à partir de
// `seed` (change à chaque clic sur "nouveau tirage").
export function pickRandomCells(percent, seed = 1) {
  const clamped = Math.min(100, Math.max(0, percent));
  const count = Math.round((clamped / 100) * 81);
  const indices = Array.from({ length: 81 }, (_, i) => i);
  const random = mulberry32(seed);
  // Fisher-Yates
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const picked = new Set();
  for (let i = 0; i < count; i++) {
    const idx = indices[i];
    picked.add(cellKey(Math.floor(idx / 9), idx % 9));
  }
  return picked;
}

export function loadImage(src, { crossOrigin } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Impossible de charger l'image : ${src}`));
    img.src = src;
  });
}

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawCells(ctx, { x, y, size, revealedCells, artworkImg, colors }) {
  const cell = size / 9;
  const iw = artworkImg?.naturalWidth || artworkImg?.width || 0;
  const ih = artworkImg?.naturalHeight || artworkImg?.height || 0;

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cx = x + col * cell;
      const cy = y + row * cell;
      const revealed = revealedCells.has(cellKey(row, col));
      if (revealed && artworkImg && iw && ih) {
        const sx = col * (iw / 9);
        const sy = row * (ih / 9);
        ctx.drawImage(artworkImg, sx, sy, iw / 9, ih / 9, cx, cy, cell, cell);
      } else {
        ctx.fillStyle = colors.cellBg;
        ctx.fillRect(cx, cy, cell, cell);
      }
    }
  }
}

function drawGridLines(ctx, { x, y, size, colors }) {
  const cell = size / 9;

  ctx.strokeStyle = colors.gridLine;
  ctx.lineWidth = 1;
  for (let i = 1; i < 9; i++) {
    if (i % 3 === 0) continue;
    ctx.beginPath();
    ctx.moveTo(x + i * cell, y);
    ctx.lineTo(x + i * cell, y + size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + i * cell);
    ctx.lineTo(x + size, y + i * cell);
    ctx.stroke();
  }

  ctx.lineWidth = 3;
  for (const i of [3, 6]) {
    ctx.beginPath();
    ctx.moveTo(x + i * cell, y);
    ctx.lineTo(x + i * cell, y + size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + i * cell);
    ctx.lineTo(x + size, y + i * cell);
    ctx.stroke();
  }

  ctx.strokeStyle = colors.gridBorder;
  ctx.lineWidth = 4;
  roundRectPath(ctx, x + 2, y + 2, size - 4, size - 4, 14);
  ctx.stroke();
}

// Dessine la grille (cases + traits) dans le carré [x, y, size, size],
// avec des angles arrondis cohérents avec le style .sudoku-board de l'appli.
export function drawGrid(ctx, { x, y, size, revealedCells, artworkImg, colors }) {
  ctx.save();
  roundRectPath(ctx, x, y, size, size, 16);
  ctx.clip();
  drawCells(ctx, { x, y, size, revealedCells, artworkImg, colors });
  ctx.restore();
  drawGridLines(ctx, { x, y, size, colors });
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Calcule où placer la grille + les zones d'habillage pour un format donné.
export function computeLayout(format) {
  const { width, height, mode } = format;

  if (mode === 'side') {
    const margin = Math.round(height * 0.08);
    const gridSize = height - margin * 2;
    const gridX = margin;
    const gridY = margin;
    const sideX = gridX + gridSize + margin;
    const sideWidth = width - sideX - margin;
    return { mode, width, height, gridX, gridY, gridSize, sideX, sideWidth, margin };
  }

  const margin = Math.round(width * 0.055);
  const headerH = Math.round(height * (mode === 'stacked' && height > width ? 0.115 : 0.16));
  const footerH = Math.round(height * (height > width ? 0.135 : 0.135));
  const availW = width - margin * 2;
  const availH = height - headerH - footerH;
  const gridSize = Math.min(availW, availH);
  const gridX = (width - gridSize) / 2;
  const usedH = headerH + gridSize + footerH;
  const extra = Math.max(0, height - usedH);
  const gridY = headerH + extra / 2;
  return { mode, width, height, gridX, gridY, gridSize, headerH, footerH, margin, extra };
}

function drawLogo(ctx, logoImg, x, y, size) {
  if (!logoImg) return;
  ctx.drawImage(logoImg, x, y, size, size);
}

function drawTagline(ctx, text, centerX, y, maxWidth, colors, fontSize) {
  ctx.font = `700 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  const lines = wrapText(ctx, text, maxWidth - 48);
  const boxHeight = fontSize * 1.28 * lines.length + 24;
  const boxWidth = Math.min(maxWidth, Math.max(...lines.map(l => ctx.measureText(l).width)) + 56);
  const boxX = centerX - boxWidth / 2;

  ctx.fillStyle = colors.accent;
  roundRectPath(ctx, boxX, y, boxWidth, boxHeight, boxHeight / 2);
  ctx.fill();

  ctx.fillStyle = colors.accentText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  lines.forEach((line, i) => {
    ctx.fillText(line, centerX, y + boxHeight / 2 + (i - (lines.length - 1) / 2) * fontSize * 1.15);
  });
  return boxHeight;
}

// Rendu complet du visuel : fond, grille, habillage (logo, nom, accroche,
// lien, QR code). `layout` vient de computeLayout(format). `assets` regroupe
// les images déjà chargées (logoImg, artworkImg, qrImg ou null si désactivé).
export function renderTeaser(canvas, { format, layout, theme, revealedCells, assets, branding }) {
  const { width, height } = format;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const colors = TEASER_THEMES[theme] ?? TEASER_THEMES.light;
  const { logoImg, artworkImg, qrImg } = assets;
  const { tagline, showTagline, showLink, linkLabel } = branding;

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  if (layout.mode === 'side') {
    drawGrid(ctx, { x: layout.gridX, y: layout.gridY, size: layout.gridSize, revealedCells, artworkImg, colors });

    const cx = layout.sideX + layout.sideWidth / 2;
    let cursorY = layout.gridY + 12;
    const logoSize = Math.round(layout.sideWidth * 0.22);
    drawLogo(ctx, logoImg, cx - logoSize / 2, cursorY, logoSize);
    cursorY += logoSize + 20;

    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `800 ${Math.round(layout.sideWidth * 0.13)}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    ctx.fillText('Sudoku Art', cx, cursorY + layout.sideWidth * 0.1);
    cursorY += layout.sideWidth * 0.16;

    if (showTagline && tagline) {
      cursorY += 18;
      const boxH = drawTagline(ctx, tagline, cx, cursorY, layout.sideWidth, colors, Math.round(layout.sideWidth * 0.078));
      cursorY += boxH + 24;
    }

    if (qrImg) {
      const qrSize = Math.min(layout.sideWidth * 0.62, layout.gridY + layout.gridSize - cursorY - 60);
      if (qrSize > 40) {
        ctx.drawImage(qrImg, cx - qrSize / 2, cursorY, qrSize, qrSize);
        cursorY += qrSize + 16;
      }
    }
    if (showLink && linkLabel) {
      ctx.fillStyle = colors.textMuted;
      ctx.font = `600 ${Math.round(layout.sideWidth * 0.068)}px system-ui, -apple-system, "Segoe UI", sans-serif`;
      ctx.fillText(linkLabel, cx, cursorY + layout.sideWidth * 0.05);
    }
    return canvas;
  }

  // Formats "stacked" (carré / story) : logo + nom + accroche en haut,
  // grille au centre, lien / QR code en bas.
  drawGrid(ctx, { x: layout.gridX, y: layout.gridY, size: layout.gridSize, revealedCells, artworkImg, colors });

  const cx = width / 2;
  const logoSize = Math.round(layout.headerH * 0.4);
  const nameFontSize = Math.round(layout.headerH * 0.24);
  const headerCenterY = layout.headerH * 0.34;

  ctx.font = `800 ${nameFontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  const nameWidth = ctx.measureText('Sudoku Art').width;
  const groupWidth = logoSize + 14 + nameWidth;
  const groupX = cx - groupWidth / 2;

  drawLogo(ctx, logoImg, groupX, headerCenterY - logoSize / 2, logoSize);
  ctx.fillStyle = colors.text;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Sudoku Art', groupX + logoSize + 14, headerCenterY + logoSize * 0.05);

  if (showTagline && tagline) {
    drawTagline(ctx, tagline, cx, headerCenterY + logoSize / 2 + 20, width - layout.margin * 2, colors, nameFontSize * 0.82);
  }

  const footerTop = height - layout.footerH;
  let footerCursorY = footerTop + layout.footerH * 0.16;

  if (qrImg) {
    const qrSize = Math.min(layout.footerH * 0.72, 220);
    ctx.drawImage(qrImg, cx - qrSize / 2, footerCursorY, qrSize, qrSize);
    footerCursorY += qrSize + 10;
  }
  if (showLink && linkLabel) {
    ctx.fillStyle = colors.textMuted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `600 ${Math.round(layout.footerH * 0.16)}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    ctx.fillText(linkLabel, cx, footerCursorY + layout.footerH * 0.12);
  }

  return canvas;
}
