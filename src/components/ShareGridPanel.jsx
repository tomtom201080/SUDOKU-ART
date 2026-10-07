// src/components/ShareGridPanel.jsx
// QR code de partage affiché en permanence sous la grille : pointe par
// défaut vers la grille 'initial' (créée paresseusement, une seule fois par
// partie — voir useGame.js/requestShareGrid), et vers un 'snapshot' figé
// (saisies + notes) après un clic sur "Appel à un ami". Fonctionne pour une
// œuvre de bibliothèque ET pour une partie à média perso (photo/vidéo
// attachée via MediaPicker.jsx, watermark.media) — pas pour une photo perso
// "historique" sans ligne shared_media (jeu immédiat solo, image locale
// jamais hébergée, voir le garde plus bas) ni le mode classique.
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useT } from '../i18n/index.jsx';
import { buildSharedGridLink } from '../lib/sharedGrids';
import { resolveWikimediaDirectUrl } from '../utils/wikimediaDirectUrl';
import { renderShareImage } from '../utils/shareGridImage';
import { isMobileDevice } from '../utils/device';
import './ShareGridPanel.css';

export default function ShareGridPanel({
  puzzleData, userGrid, watermark, isCellRevealed,
  sharedGrid, shareGridStatus, onRequestShareGrid, onSwitchToInitial,
  userId, onRequestSignup,
  captureMode, onToggleCaptureMode
}) {
  const { t } = useT();
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [showSignupBanner, setShowSignupBanner] = useState(true);
  const [shareStatus, setShareStatus] = useState('idle'); // idle | sharing | copied
  const [downloading, setDownloading] = useState(false);

  // Création paresseuse de la grille 'initial' au tout premier affichage du
  // panneau pour cette partie — jamais recréée ensuite (voir sharedGrid côté
  // useGame.js), donc pas de doublon même si ce composant se ré-affiche.
  useEffect(() => {
    if (!watermark) return;
    if (watermark.isCustom && !watermark.media) return;
    if (sharedGrid.activeId || sharedGrid.initialId) return;
    if (shareGridStatus !== 'idle') return;
    onRequestShareGrid('initial');
  }, [watermark, sharedGrid.activeId, sharedGrid.initialId, shareGridStatus, onRequestShareGrid]);

  // Régénère l'image QR (data URL) à chaque fois que la grille active change.
  useEffect(() => {
    if (!sharedGrid.activeId) { setQrDataUrl(null); return; }
    let cancelled = false;
    const link = buildSharedGridLink(sharedGrid.activeId);
    QRCode.toDataURL(link, { width: 480, margin: 1, color: { dark: '#1A1A1A', light: '#FFFFFF' } })
      .then(url => { if (!cancelled) setQrDataUrl(url); })
      .catch(() => { if (!cancelled) setQrDataUrl(null); });
    return () => { cancelled = true; };
  }, [sharedGrid.activeId]);

  // Pas de QR possible pour une photo perso "historique" sans ligne
  // shared_media (ex. jeu immédiat solo depuis l'accueil) : son image n'a
  // jamais été hébergée, rien à pointer depuis un autre appareil.
  if (!watermark || (watermark.isCustom && !watermark.media)) return null;

  const isSnapshot = sharedGrid.activeType === 'snapshot';
  const label = isSnapshot ? t('share_label_snapshot') : t('share_label_initial');
  const updatedAtText = isSnapshot && sharedGrid.updatedAt
    ? t('share_updated_at', {
      time: new Date(sharedGrid.updatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    })
    : null;

  const computeRevealedSet = () => {
    const set = new Set();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (isCellRevealed(r, c)) set.add(`${r}-${c}`);
      }
    }
    return set;
  };
  const computeFilledMask = () => userGrid.map(row => row.map(v => v !== 0));

  const buildShareCanvas = async () => {
    // Une œuvre de bibliothèque (Wikimedia) a besoin de la résolution CORS
    // dédiée ; un poster de media perso vit déjà dans notre propre Storage
    // (CORS ouvert en direct, sans redirection) — voir le plan.
    const artworkSrc = watermark.isCustom
      ? watermark.path
      : await resolveWikimediaDirectUrl(watermark.path);
    return renderShareImage({
      puzzle: userGrid,
      givenMask: computeFilledMask(),
      revealedCells: computeRevealedSet(),
      artworkSrc,
      qrDataUrl,
      label,
      isVideo: !!watermark.isVideo
    });
  };

  const shareLink = sharedGrid.activeId ? buildSharedGridLink(sharedGrid.activeId) : null;
  const shareText = shareLink
    ? t(isSnapshot ? 'share_message_snapshot' : 'share_message_initial', { link: shareLink })
    : '';

  const handleShare = async () => {
    if (!shareLink) return;
    setShareStatus('sharing');
    try {
      const canvas = await buildShareCanvas();
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'sudoku-art-grille.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Sudoku Art', text: shareText });
        setShareStatus('idle');
        return;
      }
    } catch {
      // Image indisponible (CORS, hors ligne...) : repli sur un partage texte seul.
    }
    try {
      await navigator.share({ title: 'Sudoku Art', text: shareText });
    } catch {
      // Partage annulé par la personne — rien à faire de plus.
    }
    setShareStatus('idle');
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch {
      // Presse-papiers indisponible : le lien reste affichable autrement si besoin.
    }
  };

  const handleDownloadImage = async () => {
    if (!shareLink || !qrDataUrl) return;
    setDownloading(true);
    try {
      const canvas = await buildShareCanvas();
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'sudoku-art-grille.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      // Pas de message dédié pour ce repli secondaire — le lien/QR restent utilisables.
    } finally {
      setDownloading(false);
    }
  };

  const canNativeShare = isMobileDevice() && typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className={`share-grid-panel${captureMode ? ' is-capture-mode' : ''}`}>
      <div className="share-grid-qr-block">
        {qrDataUrl ? (
          <img className="share-grid-qr" src={qrDataUrl} alt={t('share_qr_alt')} />
        ) : (
          <div className="share-grid-qr-placeholder" aria-hidden="true" />
        )}
        <p className="share-grid-label">{label}</p>
        {updatedAtText && <p className="share-grid-updated">{updatedAtText}</p>}
        {shareGridStatus === 'queued' && <p className="share-grid-offline">{t('share_offline_queued')}</p>}
      </div>

      {captureMode ? (
        <button type="button" className="share-grid-exit-capture" onClick={onToggleCaptureMode}>
          ✕ {t('share_exit_capture')}
        </button>
      ) : (
        <>
          <div className="share-grid-actions">
            <button
              type="button"
              className="share-grid-btn"
              onClick={() => onRequestShareGrid('snapshot')}
              disabled={shareGridStatus === 'creating'}
            >
              {shareGridStatus === 'creating' ? t('share_creating') : `🆘 ${t('share_call_friend')}`}
            </button>
            {isSnapshot && sharedGrid.initialId && (
              <button type="button" className="share-grid-btn share-grid-btn-ghost" onClick={onSwitchToInitial}>
                ↺ {t('share_back_to_initial')}
              </button>
            )}
            <button type="button" className="share-grid-btn share-grid-btn-ghost" onClick={onToggleCaptureMode}>
              📸 {t('share_capture_mode')}
            </button>
          </div>

          <div className="share-grid-actions">
            {canNativeShare ? (
              <button
                type="button"
                className="share-grid-btn share-grid-btn-primary"
                onClick={handleShare}
                disabled={!shareLink || shareStatus === 'sharing'}
              >
                📤 {t('share_send')}
              </button>
            ) : (
              <>
                <button type="button" className="share-grid-btn" onClick={handleCopyLink} disabled={!shareLink}>
                  🔗 {shareStatus === 'copied' ? t('share_link_copied') : t('share_copy_link')}
                </button>
                <button type="button" className="share-grid-btn" onClick={handleDownloadImage} disabled={!shareLink || downloading}>
                  {downloading ? t('share_generating') : `🖼️ ${t('share_download_image')}`}
                </button>
              </>
            )}
          </div>

          {!userId && showSignupBanner && (
            <div className="share-grid-signup-banner">
              <span>{t('share_signup_hint')}</span>
              <button type="button" onClick={onRequestSignup}>{t('share_signup_cta')}</button>
              <button
                type="button"
                className="share-grid-signup-dismiss"
                onClick={() => setShowSignupBanner(false)}
                aria-label={t('share_dismiss')}
              >
                ✕
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
