import { useT } from '../i18n/index.jsx';
// src/components/ChallengeComposer.jsx
import { useRef, useState, useEffect } from 'react';
import { uploadSharedPhoto, SHARE_EXPIRY_DAYS } from '../lib/sharedPhoto';
import { createChallenge, buildChallengeLink } from '../lib/challenges';
import { isMobileDevice } from '../utils/device';
import MemoriesDashboard from './MemoriesDashboard';
import './ChallengeComposer.css';

const ERROR_OPTIONS = [
  { value: 1, label: '1' },
  { value: 3, label: '3' },
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  // dynamique2
];

const TIME_OPTIONS = [
  { value: null, label: null }, // Illimité — libellé traduit au rendu
  { value: 3, label: '3 min' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' }
];

const HINT_LIMIT_OPTIONS = [null, 1, 2, 3];

export default function ChallengeComposer({ onClose, preloadedPhotoUrl = null, userId = null }) {
  const { t } = useT();
  const [showHistory, setShowHistory] = useState(false);
  const DIFFICULTY_OPTIONS = [
    { value: 'facile', label: t('diff_facile') },
    { value: 'moyen', label: t('diff_moyen') },
    { value: 'complique', label: t('diff_complique') },
    { value: 'enfer', label: t('diff_enfer') },
  ];

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
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(null);
  const [hintsLimit, setHintsLimit] = useState(null);
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
        timeLimitMinutes,
        hintsLimit
      });
      const link = buildChallengeLink(challenge.id);
      setShareLink(link);

      const message = path
        ? t('cc_share_msg_with_photo', { link })
        : t('cc_share_msg_no_photo', { link });

      const disclaimer = path ? t('cc_share_disclaimer', { days: SHARE_EXPIRY_DAYS }) : '';

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
          <div className="challenge-header-actions">
            <button className="challenge-history-btn" onClick={() => setShowHistory(true)} title={t('mem_dash_title')}>🕘</button>
            <button className="challenge-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {status === 'done' ? (
          <>
            <p className="challenge-success">{t('cc_success_msg', { days: SHARE_EXPIRY_DAYS })}</p>
            {shareLink && (
              <div className="challenge-link-fallback">
                <p>{t('cc_whatsapp_fallback')}</p>
                <button className="challenge-copy-btn" onClick={handleCopyLink}>
                  {linkCopied ? t('cc_link_copied') : t('cc_copy_link_btn')}
                </button>
              </div>
            )}
            <button className="challenge-btn-primary" onClick={onClose}>{t('cc_close')}</button>
          </>
        ) : (
          <>
            <div className="challenge-step">
              <p className="challenge-step-title">{t('cc_step1')}</p>
              {photoPreview ? (
                <img className="challenge-photo-preview" src={photoPreview} alt={t('cc_photo_selected_alt')} />
              ) : (
                <button className="challenge-pick-btn" onClick={handlePickPhoto}>
                  {t('defi_pick_photo')}
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
                  {t('rematch_change')}
                </button>
              )}
            </div>

            <div className="challenge-step">
              <p className="challenge-step-title">{t('cc_step2')}</p>
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
              <p className="challenge-step-title">{t('cc_step4')}</p>
              <div className="challenge-options">
                {TIME_OPTIONS.map(opt => (
                  <button
                    key={String(opt.value)}
                    className={`challenge-option-btn ${timeLimitMinutes === opt.value ? 'is-active' : ''}`}
                    onClick={() => setTimeLimitMinutes(opt.value)}
                  >
                    {opt.value == null ? t('cc_unlimited') : opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="challenge-step">
              <p className="challenge-step-title">{t('cc_step5')}</p>
              <div className="challenge-options">
                {HINT_LIMIT_OPTIONS.map(v => (
                  <button
                    key={String(v)}
                    className={`challenge-option-btn ${hintsLimit === v ? 'is-active' : ''}`}
                    onClick={() => setHintsLimit(v)}
                  >
                    {v == null ? t('defi_hint_unlimited') : t('defi_hint_count', { v, s: v > 1 ? 's' : '' })}
                  </button>
                ))}
              </div>
            </div>

            {status === 'error' && (
              <p className="challenge-error-note">{t('cc_send_failed')}</p>
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

      {showHistory && (
        <MemoriesDashboard userId={userId} onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
}
