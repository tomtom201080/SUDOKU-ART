// src/components/TeaserGridGenerator.jsx
// Générateur de grille "teaser" réservé à l'admin (voir la garde
// session?.user?.email dans App.jsx, identique à celle de KpiDashboard /
// PlatformStatsDashboard) : produit un visuel réseaux sociaux (grille
// partiellement révélée + habillage) à partir d'une œuvre de la
// bibliothèque, sans jamais créer de vraie partie/défi en base.
//
// Double protection du rôle admin, comme get_platform_stats() : le bouton
// qui ouvre ce panneau est déjà cascadé derrière la garde e-mail dans
// App.jsx, ET ce composant revérifie lui-même côté serveur via le RPC
// is_platform_admin() avant d'afficher quoi que ce soit — un utilisateur qui
// contournerait la garde React (ex. en forçant l'affichage depuis les
// devtools) tombe sur ce même mur côté base.
import { useEffect, useMemo, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import { supabase } from '../lib/supabaseClient';
import { listAllImages } from '../data/imageLibrary';
import { generateSudoku, DIFFICULTIES } from '../sudoku/generator';
import { saveNumberedPuzzle, buildNumberedPuzzleLink } from '../lib/numberedPuzzles';
import {
  TEASER_FORMATS,
  TEASER_THEMES,
  pickRandomCells,
  cellKey,
  loadImage,
  computeLayout,
  renderTeaser
} from '../utils/teaserCanvas';
import './TeaserGridGenerator.css';

const SHARE_URL = 'https://sudokuart.com';
const SHARE_LABEL = 'sudokuart.com';
const DEFAULT_TAGLINE = 'Devine l’œuvre 🎨';
const DIFFICULTY_LABELS = { facile: 'Facile', moyen: 'Moyen', complique: 'Compliqué', enfer: 'Enfer' };

export default function TeaserGridGenerator({ manifest, onClose }) {
  const [adminStatus, setAdminStatus] = useState('checking'); // checking | ok | denied

  useEffect(() => {
    let cancelled = false;
    supabase.rpc('is_platform_admin')
      .then(({ data, error }) => {
        if (cancelled) return;
        setAdminStatus(!error && data === true ? 'ok' : 'denied');
      })
      .catch(() => { if (!cancelled) setAdminStatus('denied'); });
    return () => { cancelled = true; };
  }, []);

  const allImages = useMemo(() => (manifest ? listAllImages(manifest) : []), [manifest]);

  const [customImage, setCustomImage] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (!selectedId && allImages.length > 0) setSelectedId(allImages[0].id);
  }, [allImages, selectedId]);

  const selectedImage = selectedId === 'custom'
    ? customImage
    : allImages.find(img => img.id === selectedId) ?? null;

  const [revealPercent, setRevealPercent] = useState(22);
  const [shuffleSeed, setShuffleSeed] = useState(1);
  const [manualMode, setManualMode] = useState(false);
  const [manualCells, setManualCells] = useState(null);

  const autoCells = useMemo(() => pickRandomCells(revealPercent, shuffleSeed), [revealPercent, shuffleSeed]);

  useEffect(() => {
    if (manualMode && !manualCells) setManualCells(new Set(autoCells));
  }, [manualMode, manualCells, autoCells]);

  const revealedCells = manualMode ? (manualCells ?? autoCells) : autoCells;
  const revealedCount = revealedCells.size;
  const revealedPercentActual = Math.round((revealedCount / 81) * 100);

  const toggleCell = useCallback((row, col) => {
    setManualCells(prev => {
      const base = prev ?? new Set(autoCells);
      const next = new Set(base);
      const key = cellKey(row, col);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, [autoCells]);

  const resetManualFromPercent = () => setManualCells(new Set(autoCells));

  const [theme, setTheme] = useState('light');
  const [tagline, setTagline] = useState(DEFAULT_TAGLINE);
  const [showTagline, setShowTagline] = useState(true);
  const [showLink, setShowLink] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const [formatKey, setFormatKey] = useState('square');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  // Numérotation (catalogue admin, voir src/lib/numberedPuzzles.js) : une
  // fois enregistrée, la grille numérotée sert de cible au lien/QR code de
  // l'export à la place de la simple page d'accueil — quiconque l'ouvre
  // démarre EXACTEMENT cette grille (même œuvre, même puzzle) depuis le
  // début, en rapport avec le fragment révélé sur le visuel. Réservé aux
  // œuvres de la bibliothèque : une image de test importée n'a pas d'id
  // stable à enregistrer.
  const [puzzleDifficulty, setPuzzleDifficulty] = useState('moyen');
  const [savedNumber, setSavedNumber] = useState(null);
  const [savingNumber, setSavingNumber] = useState(false);
  const [saveNumberError, setSaveNumberError] = useState(null);

  useEffect(() => {
    setSavedNumber(null);
    setSaveNumberError(null);
  }, [selectedId, puzzleDifficulty]);

  const handleSaveNumber = async () => {
    if (!selectedImage || selectedImage.isCustom) return;
    setSavingNumber(true);
    setSaveNumberError(null);
    try {
      const { puzzle, solution } = generateSudoku(puzzleDifficulty);
      const entry = await saveNumberedPuzzle({
        puzzle,
        solution,
        difficulty: puzzleDifficulty,
        paintingId: selectedImage.id
      });
      setSavedNumber(entry.number);
    } catch (err) {
      setSaveNumberError(err?.message || "Échec de l'enregistrement.");
    } finally {
      setSavingNumber(false);
    }
  };

  const shareUrl = savedNumber ? buildNumberedPuzzleLink(savedNumber) : SHARE_URL;
  const shareLabel = savedNumber ? `${SHARE_LABEL} — Grille #${savedNumber}` : SHARE_LABEL;

  const colors = TEASER_THEMES[theme];

  const handleUploadChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCustomImage({ id: 'custom', title: file.name, path: reader.result, isCustom: true });
      setSelectedId('custom');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDownload = async () => {
    if (!selectedImage) return;
    setDownloading(true);
    setError(null);
    try {
      const format = TEASER_FORMATS[formatKey];
      const layout = computeLayout(format);

      const [artworkImg, logoImg] = await Promise.all([
        loadImage(selectedImage.path, { crossOrigin: selectedImage.isCustom ? undefined : 'anonymous' }),
        loadImage('/favicon.svg')
      ]);

      let qrImg = null;
      if (showQr) {
        const qrDataUrl = await QRCode.toDataURL(shareUrl, {
          width: 480,
          margin: 1,
          color: { dark: '#1A1A1A', light: '#FFFFFF' }
        });
        qrImg = await loadImage(qrDataUrl);
      }

      const canvas = document.createElement('canvas');
      renderTeaser(canvas, {
        format,
        layout,
        theme,
        revealedCells,
        assets: { artworkImg, logoImg, qrImg },
        branding: { tagline, showTagline, showLink, linkLabel: shareLabel }
      });

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `teaser-${(selectedImage.id || 'custom')}-${formatKey}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      const blocked = err?.name === 'SecurityError' || /tainted/i.test(err?.message || '');
      setError(blocked
        ? "Export impossible : cette image vient d'un hébergeur qui bloque son export (CORS). Essaie une autre œuvre de la bibliothèque, ou importe une image de test."
        : (err?.message || "Échec de la génération de l'image."));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="teaser-overlay" onClick={onClose}>
      <div className="teaser-panel" onClick={(e) => e.stopPropagation()}>
        <div className="teaser-header">
          <h2>🎬 Générateur de grille teaser</h2>
          <button className="teaser-close" onClick={onClose}>✕</button>
        </div>

        {adminStatus === 'checking' && <p>Vérification des droits…</p>}
        {adminStatus === 'denied' && <p className="teaser-error">Accès refusé.</p>}

        {adminStatus === 'ok' && (
          <div className="teaser-body">
            <div className="teaser-controls">
              <section className="teaser-section">
                <h3>Œuvre</h3>
                <select
                  className="teaser-select"
                  value={selectedId ?? ''}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  {customImage && <option value="custom">🧪 {customImage.title}</option>}
                  {allImages.map(img => (
                    <option key={img.id} value={img.id}>{img.title ?? img.id}</option>
                  ))}
                </select>
                <label className="teaser-upload-btn">
                  Importer une image de test
                  <input type="file" accept="image/*" onChange={handleUploadChange} hidden />
                </label>
              </section>

              <section className="teaser-section">
                <h3>Révélation</h3>
                <label className="teaser-field">
                  <span>% de cases révélées ({revealPercent}%, {manualMode ? `${revealedCount}/81 en mode manuel` : `${Math.round((revealPercent / 100) * 81)}/81`})</span>
                  <input
                    type="range"
                    min={5}
                    max={60}
                    value={revealPercent}
                    disabled={manualMode}
                    onChange={(e) => setRevealPercent(Number(e.target.value))}
                  />
                </label>
                <div className="teaser-row">
                  <button
                    type="button"
                    className="teaser-btn"
                    disabled={manualMode}
                    onClick={() => setShuffleSeed(s => s + 1)}
                  >
                    🎲 Nouveau tirage
                  </button>
                  <label className="teaser-checkbox">
                    <input
                      type="checkbox"
                      checked={manualMode}
                      onChange={(e) => setManualMode(e.target.checked)}
                    />
                    Mode manuel (cliquer les cases)
                  </label>
                </div>
                {manualMode && (
                  <button type="button" className="teaser-btn teaser-btn-ghost" onClick={resetManualFromPercent}>
                    Réinitialiser depuis le % ({revealedPercentActual}% actuellement révélé)
                  </button>
                )}
              </section>

              <section className="teaser-section">
                <h3>Habillage</h3>
                <label className="teaser-checkbox">
                  <input type="checkbox" checked={showTagline} onChange={(e) => setShowTagline(e.target.checked)} />
                  Accroche
                </label>
                <input
                  type="text"
                  className="teaser-text-input"
                  value={tagline}
                  disabled={!showTagline}
                  maxLength={60}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder={DEFAULT_TAGLINE}
                />
                <label className="teaser-checkbox">
                  <input type="checkbox" checked={showLink} onChange={(e) => setShowLink(e.target.checked)} />
                  Lien ({shareLabel})
                </label>
                <label className="teaser-checkbox">
                  <input type="checkbox" checked={showQr} onChange={(e) => setShowQr(e.target.checked)} />
                  QR code
                </label>
                <div className="teaser-theme-toggle">
                  <button
                    type="button"
                    className={theme === 'light' ? 'active' : ''}
                    onClick={() => setTheme('light')}
                  >
                    ☀️ Clair
                  </button>
                  <button
                    type="button"
                    className={theme === 'dark' ? 'active' : ''}
                    onClick={() => setTheme('dark')}
                  >
                    🌙 Sombre
                  </button>
                </div>
              </section>

              <section className="teaser-section">
                <h3>Numérotation</h3>
                <p className="teaser-preview-hint" style={{ margin: '0 0 4px' }}>
                  Enregistre une vraie grille jouable pour cette œuvre, sous un numéro stable —
                  le lien/QR code de l'export pointera alors directement vers cette grille
                  (n'importe qui l'ouvre et démarre exactement la même, depuis le début).
                </p>
                <div className="teaser-row">
                  <select
                    className="teaser-select"
                    style={{ width: 'auto', flex: '0 0 auto' }}
                    value={puzzleDifficulty}
                    onChange={(e) => setPuzzleDifficulty(e.target.value)}
                  >
                    {DIFFICULTIES.map(d => (
                      <option key={d} value={d}>{DIFFICULTY_LABELS[d] ?? d}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="teaser-btn"
                    disabled={!selectedImage || selectedImage.isCustom || savingNumber || !!savedNumber}
                    onClick={handleSaveNumber}
                  >
                    {savingNumber ? 'Génération…' : savedNumber ? `✅ Grille #${savedNumber}` : '🔢 Enregistrer et numéroter'}
                  </button>
                </div>
                {selectedImage?.isCustom && (
                  <p className="teaser-preview-hint">Indisponible pour une image de test importée.</p>
                )}
                {saveNumberError && <p className="teaser-error">{saveNumberError}</p>}
              </section>

              <section className="teaser-section">
                <h3>Export</h3>
                <div className="teaser-format-list">
                  {Object.entries(TEASER_FORMATS).map(([key, fmt]) => (
                    <label key={key} className="teaser-radio">
                      <input
                        type="radio"
                        name="teaser-format"
                        checked={formatKey === key}
                        onChange={() => setFormatKey(key)}
                      />
                      {fmt.label}
                    </label>
                  ))}
                </div>
                {error && <p className="teaser-error">{error}</p>}
                <button
                  type="button"
                  className="teaser-btn teaser-btn-primary"
                  disabled={!selectedImage || downloading}
                  onClick={handleDownload}
                >
                  {downloading ? 'Génération…' : '⬇️ Télécharger l’image (PNG)'}
                </button>
              </section>
            </div>

            <div className="teaser-preview">
              <div
                className="teaser-preview-grid"
                style={{
                  '--t-cell-bg': colors.cellBg,
                  '--t-grid-border': colors.gridBorder,
                  '--t-grid-line': colors.gridLine,
                  '--t-bg': colors.bg
                }}
              >
                {Array.from({ length: 9 }).map((_, row) => (
                  <div className="teaser-preview-row" key={row}>
                    {Array.from({ length: 9 }).map((_, col) => {
                      const key = cellKey(row, col);
                      const revealed = revealedCells.has(key);
                      const thickRight = col === 2 || col === 5;
                      const thickBottom = row === 2 || row === 5;
                      return (
                        <button
                          type="button"
                          key={col}
                          disabled={!manualMode}
                          onClick={() => toggleCell(row, col)}
                          className={[
                            'teaser-cell',
                            revealed ? 'is-revealed' : '',
                            manualMode ? 'is-clickable' : '',
                            thickRight ? 'thick-right' : '',
                            thickBottom ? 'thick-bottom' : ''
                          ].join(' ').trim()}
                          style={revealed && selectedImage ? {
                            backgroundImage: `url(${selectedImage.path})`,
                            backgroundSize: '900% 900%',
                            backgroundPosition: `${(col / 8) * 100}% ${(row / 8) * 100}%`
                          } : undefined}
                          aria-label={`case ligne ${row + 1}, colonne ${col + 1}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <p className="teaser-preview-caption">
                {selectedImage ? (selectedImage.title ?? 'Image de test') : 'Choisis une œuvre'}
                {' — '}{revealedCount}/81 cases révélées ({revealedPercentActual}%)
              </p>
              <p className="teaser-preview-hint">
                Cet aperçu montre le tirage des cases ; l'habillage (logo, accroche, lien, QR)
                n'apparaît que sur l'image téléchargée, mise en page pour le format choisi.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
