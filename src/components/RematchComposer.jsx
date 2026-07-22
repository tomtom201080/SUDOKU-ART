import { useT } from '../i18n/index.jsx';
// src/components/RematchComposer.jsx
import { useRef, useState } from 'react';
import { uploadSharedPhoto, SHARE_EXPIRY_DAYS } from '../lib/sharedPhoto';
import { createRematch, buildRematchLink } from '../lib/rematches';
import { isMobileDevice } from '../utils/device';
import './ChallengeComposer.css';
import './DefiComposer.css';

const DIFFICULTY_KEYS = { facile: 'diff_facile', moyen: 'diff_moyen', complique: 'diff_complique', enfer: 'diff_enfer' };

export default function RematchComposer({ puzzleData, difficulty, errorCount, hintsUsed = 0, elapsedSeconds, userId, userEmail, defaultImageUrl = null, onClose }) {
  const { t } = useT();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [imageChoice, setImageChoice] = useState(defaultImageUrl ? 'keep' : 'none'); // 'keep' | 'new' | 'none'
  const [groupMode, setGroupMode] = useState(false);
  const [defiName, setDefiName] = useState('');
  const [challengerName, setChallengerName] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [shareLink, setShareLink] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handlePickPhoto = () => fileInputRef.current?.click();

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setImageChoice('new');
  };

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
      let photoPath = null;
      if (imageChoice === 'new' && photoFile) {
        photoPath = await uploadSharedPhoto(photoFile);
      } else if (imageChoice === 'keep' && defaultImageUrl) {
        // Le fichier d'origine n'est plus disponible ici (seule l'URL locale
        // l'est) : on le récupère depuis le blob local pour le réenvoyer sous
        // un nouveau chemin propre à ce défi.
        const response = await fetch(defaultImageUrl);
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
        challengerName: userEmail ?? (challengerName.trim() || null),
        challengerUserId: userId ?? null,
        challengerErrors: errorCount,
        challengerSeconds: elapsedSeconds,
        challengerHints: hintsUsed,
        groupMode,
        classicMode,
        label: defiName.trim() || null
      });

      const link = buildRematchLink(rematch.id);
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
        }) + (photoPath ? t('rematch_photo_share_warning', { days: SHARE_EXPIRY_DAYS }) : '');

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
                  onClick={() => { setImageChoice('new'); handlePickPhoto(); }}
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
              {imageChoice === 'new' && photoPreview && (
                <img className="challenge-photo-preview" src={photoPreview} alt={t('cc_photo_selected_alt')} />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {imageChoice === 'new' && photoPreview && (
                <button className="challenge-link-btn" onClick={handlePickPhoto}>
                  {t('rematch_change')}
                </button>
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
