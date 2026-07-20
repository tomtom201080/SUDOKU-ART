import { useT, getLang } from '../i18n/index.jsx';
// src/components/ChallengeComposer.jsx
import { useRef, useState, useEffect } from 'react';
import { uploadSharedPhoto, SHARE_EXPIRY_DAYS } from '../lib/sharedPhoto';
import { createChallenge, buildChallengeLink } from '../lib/challenges';
import { isMobileDevice } from '../utils/device';
import './ChallengeComposer.css';

const DIFFICULTY_OPTIONS = [
  { value: 'auto', label: t('_automatique_au_hasard') },
  // dynamique
];

const ERROR_OPTIONS = [
  { value: 1, label: '1' },
  { value: 3, label: '3' },
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  // dynamique2
];

const TIME_OPTIONS = [
  // dynamique2,
  { value: 3, label: '3 min' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' }
];

export default function ChallengeComposer({ onClose, preloadedPhotoUrl = null }) {
  const { t } = useT();

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(preloadedPhotoUrl);

  useEffect(() => {
    if (!preloadedPhotoUrl) return;
    fetch(preloadedPhotoUrl)
      .then(r => r.blob())
      .then(blob => {
        setPhotoFile(new File([blob], 'photo-perso.jpg', { type: blob.type || 'image/jpeg' }));
      })
      .catch(() => null);
  }, [preloadedPhotoUrl]);
  const [difficultyMode, setDifficultyMode] = useState('auto');
  const [maxErrors, setMaxErrors] = useState(3);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(null);  const [status, setStatus] = useState('idle'); // idle | sending | done | error
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
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
    } catch {
      // Le presse-papiers a refusé : pas grave, le lien reste visible à l'écran.
    }
  };

  const handleSend = async () => {
    setStatus('sending');
    try {
      const path = photoFile ? await uploadSharedPhoto(photoFile) : null;
      const challenge = await createChallenge({
        photoPath: path,
        difficultyMode,
        maxErrors,
        timeLimitMinutes
      });
      const link = buildChallengeLink(challenge.id);
      setShareLink(link);

      const message = path
        ? `🔮 Je te lance un défi Sudoku Art... avec une photo mystère cachée derrière la grille ! 🧩📸\n` +
          getLang() === 'fr' ? `Résous-la pour la découvrir 👀\n\n` : `Solve it to discover the photo 👀\n\n` +
          `${link}\n\n`
        : getLang() === 'fr' ? `🧩 Je te lance un défi Sudoku Art !\n` : `🧩 I'm challenging you on Sudoku Art!\n` +
          getLang() === 'fr' ? `Peux-tu résoudre cette grille ?\n\n` : `Can you solve this grid?\n\n` +
          `${link}\n\n`;

      const disclaimer = path
        ? getLang() === 'fr' ? `⚠️ Ce lien donne accès à la photo (supprimée dans ${SHARE_EXPIRY_DAYS} j). Ne pas transférer.` : `⚠️ This link gives access to the photo (deleted in ${SHARE_EXPIRY_DAYS} days). Don't forward.`
        : '';

      const fullMessage = message + disclaimer;
      if (isMobileDevice() && navigator.share) {
        try {
          await navigator.share({ title: t('cc_share_title'), text: fullMessage });
          setStatus('done');
          return;
        } catch {
          // partage annulé : on retombe sur WhatsApp Web ci-dessous
        }
      }
      window.open(`https://wa.me/?text=${encodeURIComponent(fullMessage)}`, '_blank');
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
          <h2>{t('cc_title')}</h2>
          <button className="challenge-close" onClick={onClose}>✕</button>
        </div>

        {status === 'done' ? (
          <>
            <p className="challenge-success">Défi envoyé ! Il sera valable {SHARE_EXPIRY_DAYS} jours.</p>
            {shareLink && (
              <div className="challenge-link-fallback">
                <p>{getLang() === 'fr' ? 'Le sélecteur WhatsApp ne s\'est pas ouvert ? Copie le lien :' : 'WhatsApp didn\'t open? Copy the link:'}</p>
                <button className="challenge-copy-btn" onClick={handleCopyLink}>
                  {linkCopied ? t('_lien_copi') : '📋 Copier le lien'}
                </button>
              </div>
            )}
            <button className="challenge-btn-primary" onClick={onClose}>{t('cc_close')}</button>
          </>
        ) : (
          <>
            <div className="challenge-step">
              <p className="challenge-step-title">{t('_1_choose_the_photo_to_reveal')}</p>
              {photoPreview ? (
                <img className="challenge-photo-preview" src={photoPreview} alt="Photo choisie" />
              ) : (
                <button className="challenge-pick-btn" onClick={handlePickPhoto}>
                  📷 Choisir une photo
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {photoPreview && (
                <button className="challenge-link-btn" onClick={handlePickPhoto}>
                  Changer de photo
                </button>
              )}
            </div>

            <div className="challenge-step">
              <p className="challenge-step-title">{t('_2_niveau_de_difficult')}</p>
              <div className="challenge-options">
                {DIFFICULTY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`challenge-option-btn ${difficultyMode === opt.value ? 'is-active' : ''}`}
                    onClick={() => setDifficultyMode(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="challenge-step">
              <p className="challenge-step-title">{t('cc_step3')}</p>
              <div className="challenge-options">
                {ERROR_OPTIONS.map(opt => (
                  <button
                    key={opt.label}
                    className={`challenge-option-btn ${maxErrors === opt.value ? 'is-active' : ''}`}
                    onClick={() => setMaxErrors(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="challenge-step">
              <p className="challenge-step-title">{t('_4_temps_respecter')}</p>
              <div className="challenge-options">
                {TIME_OPTIONS.map(opt => (
                  <button
                    key={opt.label}
                    className={`challenge-option-btn ${timeLimitMinutes === opt.value ? 'is-active' : ''}`}
                    onClick={() => setTimeLimitMinutes(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {status === 'error' && (
              <p className="challenge-error-note">{getLang() === 'fr' ? 'L\'envoi a échoué, réessaie.' : 'Send failed, try again.'}</p>
            )}

            <button
              className="challenge-btn-primary"
              onClick={handleSend}
              disabled={status === 'sending'}
            >
              {status === 'sending' ? t('defi_sending') : t('cc_send_btn')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
