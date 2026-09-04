// src/components/TeaserGridGenerator.jsx
// Générateur de grille "teaser" réservé à l'admin (voir la garde
// session?.user?.email dans App.jsx, identique à celle de KpiDashboard /
// PlatformStatsDashboard) : produit un visuel réseaux sociaux (grille
// partiellement révélée + habillage) à partir d'une œuvre de la
// bibliothèque, sans jamais créer de vraie partie/défi en base tant que
// l'admin ne clique pas explicitement sur "Enregistrer et numéroter".
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
import { resolveWikimediaDirectUrl } from '../utils/wikimediaDirectUrl';
import {
  TEASER_FORMATS,
  TEASER_THEMES,
  REVEAL_VEIL_OPACITY,
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

  // La grille affichée est une VRAIE grille de sudoku générée normalement
  // (comme une vraie partie), pas un décor : c'est ce qui permet d'afficher
  // les chiffres des cases données, et c'est CETTE MÊME grille (mêmes
  // chiffres, même œuvre) qui est enregistrée par "Enregistrer et
  // numéroter" — jamais une grille générée séparément. Quelqu'un qui tape le
  // numéro obtient donc garanti la même œuvre ET le même départ de grille
  // que ce qui a été composé ici.
  const [puzzleDifficulty, setPuzzleDifficulty] = useState('moyen');
  const [puzzleSeed, setPuzzleSeed] = useState(0);
  const puzzleData = useMemo(() => generateSudoku(puzzleDifficulty), [puzzleDifficulty, puzzleSeed]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cases éligibles à la révélation : uniquement les cases "données" de la
  // grille (les seules à porter un chiffre avant même de jouer).
  const eligibleCells = useMemo(() => {
    const cells = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzleData.givenMask[r][c]) cells.push([r, c]);
      }
    }
    return cells;
  }, [puzzleData]);

  const [revealPercent, setRevealPercent] = useState(35);
  const [shuffleSeed, setShuffleSeed] = useState(1);
  const [manualMode, setManualMode] = useState(false);
  const [manualCells, setManualCells] = useState(null);

  const autoCells = useMemo(
    () => pickRandomCells(revealPercent, shuffleSeed, eligibleCells),
    [revealPercent, shuffleSeed, eligibleCells]
  );

  // Un changement de grille (difficulté ou nouvelle grille) invalide un
  // tirage manuel fait sur l'ancienne : les cases eligible ont changé.
  useEffect(() => {
    setManualCells(null);
  }, [puzzleData]);

  useEffect(() => {
    if (manualMode && !manualCells) setManualCells(new Set(autoCells));
  }, [manualMode, manualCells, autoCells]);

  const revealedCells = manualMode ? (manualCells ?? autoCells) : autoCells;
  const revealedCount = revealedCells.size;
  const revealedPercentActual = eligibleCells.length
    ? Math.round((revealedCount / eligibleCells.length) * 100)
    : 0;

  const toggleCell = useCallback((row, col) => {
    if (!puzzleData.givenMask[row][col]) return; // rien à révéler sur une case sans chiffre
    setManualCells(prev => {
      const base = prev ?? new Set(autoCells);
      const next = new Set(base);
      const key = cellKey(row, col);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, [autoCells, puzzleData]);

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
  // fois enregistrée, la grille numérotée sert de cible au lien/QR code ET
  // au badge "Grille du jour #N" affiché sur l'export, à la place de la
  // simple page d'accueil — quiconque tape ce numéro ou ouvre ce lien
  // démarre EXACTEMENT cette grille (même œuvre, mêmes chiffres) depuis le
  // début. Réservé aux œuvres de la bibliothèque : une image de test
  // importée n'a pas d'id stable à enregistrer.
  const [savedNumber, setSavedNumber] = useState(null);
  const [savingNumber, setSavingNumber] = useState(false);
  const [saveNumberError, setSaveNumberError] = useState(null);

  // Un numéro déjà enregistré ne correspond plus à rien dès que l'œuvre OU
  // la grille change (nouvelle difficulté, "nouvelle grille") — jamais le
  // laisser pointer vers une combinaison différente de celle enregistrée.
  useEffect(() => {
    setSavedNumber(null);
    setSaveNumberError(null);
  }, [selectedId, puzzleData]);

  const handleSaveNumber = async () => {
    if (!selectedImage || selectedImage.isCustom) return;
    setSavingNumber(true);
    setSaveNumberError(null);
    try {
      // On enregistre LA grille déjà affichée (puzzleData), jamais une
      // nouvelle grille générée à part : c'est ce qui garantit que quelqu'un
      // qui tape ce numéro voit exactement la même œuvre et les mêmes
      // chiffres que sur ce visuel, sans aucun risque de décalage.
      const entry = await saveNumberedPuzzle({
        puzzle: puzzleData.puzzle,
        solution: puzzleData.solution,
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

      // Les œuvres de la bibliothèque sont hébergées sur Wikimedia Commons
      // via une URL Special:FilePath, dont la redirection ne porte pas
      // d'en-tête CORS (voir wikimediaDirectUrl.js) — on résout d'abord
      // l'URL directe pour que le crossOrigin ci-dessous fonctionne.
      const artworkSrc = selectedImage.isCustom
        ? selectedImage.path
        : await resolveWikimediaDirectUrl(selectedImage.path);

      const [artworkImg, logoImg] = await Promise.all([
        loadImage(artworkSrc, { crossOrigin: selectedImage.isCustom ? undefined : 'anonymous' }),
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
        branding: { tagline, showTagline, showLink, linkLabel: shareLabel, gridNumber: savedNumber },
        puzzleData
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
                <h3>Grille</h3>
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
                  <button type="button" className="teaser-btn" onClick={() => setPuzzleSeed(s => s + 1)}>
                    🎲 Nouvelle grille
                  </button>
                </div>
                <label className="teaser-field">
                  <span>
                    % des indices révélés ({revealPercent}%,{' '}
                    {manualMode ? `${revealedCount}/${eligibleCells.length} en mode manuel` : `${Math.round((revealPercent / 100) * eligibleCells.length)}/${eligibleCells.length}`})
                  </span>
                  <input
                    type="range"
                    min={5}
                    max={70}
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
                    🔀 Nouveau tirage
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
                  Enregistre <strong>exactement la grille affichée ci-contre</strong> (même œuvre,
                  mêmes chiffres) sous un numéro stable et l'affiche en évidence sur l'image
                  ("Grille du jour #N") — n'importe qui tape ce numéro ou ouvre le lien/QR code et
                  démarre garanti la même grille, depuis le début.
                </p>
                <button
                  type="button"
                  className="teaser-btn"
                  disabled={!selectedImage || selectedImage.isCustom || savingNumber || !!savedNumber}
                  onClick={handleSaveNumber}
                >
                  {savingNumber ? 'Génération…' : savedNumber ? `✅ Grille #${savedNumber}` : '🔢 Enregistrer et numéroter'}
                </button>
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
                  '--t-bg': colors.bg,
                  '--t-cell-text': colors.cellText
                }}
              >
                {Array.from({ length: 9 }).map((_, row) => (
                  <div className="teaser-preview-row" key={row}>
                    {Array.from({ length: 9 }).map((_, col) => {
                      const key = cellKey(row, col);
                      const isGiven = puzzleData.givenMask[row][col];
                      const revealed = isGiven && revealedCells.has(key);
                      const digit = isGiven ? puzzleData.puzzle[row][col] : null;
                      const thickRight = col === 2 || col === 5;
                      const thickBottom = row === 2 || row === 5;
                      return (
                        <button
                          type="button"
                          key={col}
                          disabled={!manualMode || !isGiven}
                          onClick={() => toggleCell(row, col)}
                          className={[
                            'teaser-cell',
                            revealed ? 'is-revealed' : '',
                            manualMode && isGiven ? 'is-clickable' : '',
                            thickRight ? 'thick-right' : '',
                            thickBottom ? 'thick-bottom' : ''
                          ].join(' ').trim()}
                          style={revealed && selectedImage ? {
                            backgroundImage: `url(${selectedImage.path})`,
                            backgroundSize: '900% 900%',
                            backgroundPosition: `${(col / 8) * 100}% ${(row / 8) * 100}%`
                          } : undefined}
                          aria-label={`case ligne ${row + 1}, colonne ${col + 1}`}
                        >
                          {revealed && (
                            <span className="teaser-cell-veil" style={{ opacity: REVEAL_VEIL_OPACITY }} aria-hidden="true" />
                          )}
                          {digit ? <span className="teaser-cell-digit">{digit}</span> : null}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              <p className="teaser-preview-caption">
                {selectedImage ? (selectedImage.title ?? 'Image de test') : 'Choisis une œuvre'}
                {' — '}{DIFFICULTY_LABELS[puzzleDifficulty]}
                {' — '}{revealedCount}/{eligibleCells.length} indices révélés ({revealedPercentActual}%)
                {savedNumber != null && ` — Grille #${savedNumber}`}
              </p>
              <p className="teaser-preview-hint">
                Cet aperçu montre la vraie grille (chiffres compris) et le tirage des cases ;
                le reste de l'habillage (logo, badge numéro, accroche, lien, QR) n'apparaît que
                sur l'image téléchargée, mise en page pour le format choisi.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
