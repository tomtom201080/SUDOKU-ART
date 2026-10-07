import { useT } from '../i18n/index.jsx';
// src/components/RematchComposer.jsx
import { useState } from 'react';
import { SHARE_EXPIRY_DAYS, uploadSharedPhoto } from '../lib/sharedPhoto';
import { createRematch, buildRematchLink } from '../lib/rematches';
import { isMobileDevice } from '../utils/device';
import { resolveWikimediaDirectUrl } from '../utils/wikimediaDirectUrl';
import MediaPicker from './MediaPicker';
import './ChallengeComposer.css';
import './DefiComposer.css';

const DIFFICULTY_KEYS = { facile: 'diff_facile', moyen: 'diff_moyen', complique: 'diff_complique', enfer: 'diff_enfer' };

// defaultMedia : ligne shared_media déjà en base associée à defaultImageUrl
// (ex. game.watermark.media) — "garder" réutilise alors le même media_id
// sans re-upload.
export default function RematchComposer({
  puzzleData, difficulty, errorCount, hintsUsed = 0, elapsedSeconds,
  userId, userEmail, defaultImageUrl = null, defaultMedia = null, onClose
}) {
  const { t } = useT();
  const [media, setMedia] = useState(null); // { mediaId, type, posterUrl } posé par MediaPicker (choix "new")
  const [imageChoice, setImageChoice] = useState(defaultImageUrl ? 'keep' : 'none'); // 'keep' | 'new' | 'none'
  const [groupMode, setGroupMode] = useState(false);
  const [defiName, setDefiName] = useState('');
  const [challengerName, setChallengerName] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [shareLink, setShareLink] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
    } catch {
      // presse-papiers indisponible : le lien reste visible à l'écran
    }
  };

  const handleSend = async () => {
    setStatus('sending');
    try {
      let mediaId = null;
      let photoPath = null; // repli uniquement pour une photo "historique" sans media_id
      if (imageChoice === 'new' && media) {
        mediaId = media.mediaId;
      } else if (imageChoice === 'keep' && defaultMedia) {
        mediaId = defaultMedia.id; // déjà en base, pas de ré-upload
      } else if (imageChoice === 'keep' && defaultImageUrl) {
        // Le fichier d'origine n'est plus disponible ici (seule l'URL locale
        // l'est) : on le récupère depuis le blob local pour le réenvoyer sous
        // un nouveau chemin propre à ce défi. Si c'est un tableau de la
        // bibliothèque (Wikimedia), il faut d'abord résoudre l'URL directe —
        // voir wikimediaDirectUrl.js.
        const fetchUrl = await resolveWikimediaDirectUrl(defaultImageUrl);
        const response = await fetch(fetchUrl);
        const blob = await response.blob();
        const file = new File([blob], 'photo-defi.jpg', { type: blob.type || 'image/jpeg' });
        photoPath = await uploadSharedPhoto(file);
      }
      const classicMode = imageChoice === 'none';

      const rematch = await createRematch({
        puzzle: puzzleData.puzzle,
        solution: puzzleData.solution,
        difficulty,
        photoPath,
        mediaId,
        challengerName: userEmail ?? (challengerName.trim() || null),
        challengerUserId: userId ?? null,
        challengerErrors: errorCount,
        challengerSeconds: elapsedSeconds,
        challengerHints: hintsUsed,
        groupMode,
        classicMode,
        label: defiName.trim() || null
      });

      const link = buildRematchLink(rematch.number);
      const diffLabel = DIFFICULTY_KEYS[difficulty] ? t(DIFFICULTY_KEYS[difficulty]) : difficulty;
      const message =
        t('rematch_share_text', {
          diff: diffLabel,
          errors: errorCount,
          s: errorCount === 1 ? '' : 's',
          hints: hintsUsed,
          hs: hintsUsed === 1 ? '' : 's',
          min: Math.floor(elapsedSeconds / 60),
          sec: elapsedSeconds % 60,
          link
        }) + ((mediaId || photoPath) ? t('rematch_photo_share_warning', { days: SHARE_EXPIRY_DAYS }) : '');

      // navigator.share()/window.open() arrivent après des appels réseau
      // (upload photo + création du défi) : voir DefiComposer.jsx pour le
      // détail de pourquoi le partage natif peut être bloqué silencieusement.
      // On affiche donc toujours un lien de repli, sans jamais se fier
      // uniquement au partage natif.
      if (isMobileDevice() && navigator.share) {
        try {
          await navigator.share({ title: t('rc_share_title'), text: message });
        } catch {
          // partage annulé ou bloqué : le lien de secours ci-dessous prend le relais
        }
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      }
      setShareLink(link);
      setStatus('done');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="challenge-overlay">
      <div className="challenge-panel">
        <div className="challenge-header">
          <h2>{t('rematch_title')}</h2>
          <button className="challenge-close" onClick={onClose}>✕</button>
        </div>

        {status === 'done' ? (
          <>
            <p className="challenge-success">{t('rematch_success')}</p>
            {shareLink && (
              <div className="challenge-link-fallback">
                <p>{t('cc_whatsapp_fallback')}</p>
                <button className="challenge-copy-btn" onClick={handleCopyLink}>
                  {linkCopied ? t('cc_link_copied') : t('cc_copy_link_btn')}
                </button>
              </div>
            )}
            <button className="challenge-btn-primary" onClick={onClose}>{t('rc_close_btn')}</button>
          </>
        ) : (
          <>
            <p className="hint-step-text">
              {t('rc_desc')}
            </p>

            {!userEmail && (
              <div className="challenge-step">
                <p className="challenge-step-title">{t('rematch_prenom_title')}</p>
                <input
                  type="text"
                  className="challenge-name-input"
                  value={challengerName}
                  onChange={(e) => setChallengerName(e.target.value)}
                  placeholder={t('defi_prenom_placeholder')}
                />
              </div>
            )}

            {/* Nom du défi (facultatif) */}
            <div className="challenge-step">
              <p className="challenge-step-title">{t('defi_name_label')}</p>
              <input
                type="text"
                className="challenge-name-input"
                value={defiName}
                onChange={(e) => setDefiName(e.target.value)}
                placeholder={t('defi_name_placeholder')}
                maxLength={40}
              />
            </div>

            {/* Perso ou groupe */}
            <div className="challenge-step">
              <p className="challenge-step-title">{t('defi_step1_label')}</p>
              <div className="defi-mode-toggle">
                <button
                  className={`defi-mode-btn ${!groupMode ? 'is-selected' : ''}`}
                  onClick={() => setGroupMode(false)}
                >
                  <span className="defi-mode-icon">🎯</span>
                  <span className="defi-mode-label">{t('defi_mode_perso_label')}</span>
                  <span className="defi-mode-desc">{t('defi_mode_perso_desc')}</span>
                </button>
                <button
                  className={`defi-mode-btn ${groupMode ? 'is-selected' : ''}`}
                  onClick={() => setGroupMode(true)}
                >
                  <span className="defi-mode-icon">👨‍👩‍👧</span>
                  <span className="defi-mode-label">{t('defi_mode_group_label')}</span>
                  <span className="defi-mode-desc">{t('defi_mode_group_desc')}</span>
                </button>
              </div>
            </div>

            {/* Choix de l'image : garder / nouvelle / aucune */}
            <div className="challenge-step">
              <p className="challenge-step-title">{t('rematch_photo_title')}</p>
              <div className="defi-mode-toggle-3">
                <button
                  className={`defi-mode-btn ${imageChoice === 'keep' ? 'is-selected' : ''}`}
                  onClick={() => setImageChoice('keep')}
                  disabled={!defaultImageUrl}
                >
                  <span className="defi-mode-icon">🖼️</span>
                  <span className="defi-mode-label">{t('share_image_keep')}</span>
                </button>
                <button
                  className={`defi-mode-btn ${imageChoice === 'new' ? 'is-selected' : ''}`}
                  onClick={() => setImageChoice('new')}
                >
                  <span className="defi-mode-icon">📷</span>
                  <span className="defi-mode-label">{t('share_image_new')}</span>
                </button>
                <button
                  className={`defi-mode-btn ${imageChoice === 'none' ? 'is-selected' : ''}`}
                  onClick={() => setImageChoice('none')}
                >
                  <span className="defi-mode-icon">🔢</span>
                  <span className="defi-mode-label">{t('share_image_none')}</span>
                </button>
              </div>
              {imageChoice === 'keep' && defaultImageUrl && (
                <img className="challenge-photo-preview" src={defaultImageUrl} alt={t('cc_photo_selected_alt')} />
              )}
              {imageChoice === 'new' && (
                <MediaPicker
                  userId={userId}
                  onMediaReady={setMedia}
                  onClear={() => setMedia(null)}
                />
              )}
            </div>

            {status === 'error' && (
              <p className="challenge-error-note">{t('rematch_error')}</p>
            )}

            {!userId && (
              <div className="defi-no-account-warning">
                {t('rematch_no_account')}
              </div>
            )}

            <button
              className="challenge-btn-primary"
              onClick={handleSend}
              disabled={status === 'sending'}
            >
              {status === 'sending' ? t('rematch_sending') : t('rematch_send')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
