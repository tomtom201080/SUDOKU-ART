import { translate as t, useT } from '../i18n/index.jsx';
// src/components/RematchComposer.jsx
import { useRef, useState } from 'react';
import { uploadSharedPhoto, SHARE_EXPIRY_DAYS } from '../lib/sharedPhoto';
import { createRematch, buildRematchLink } from '../lib/rematches';
import { isMobileDevice } from '../utils/device';
import './ChallengeComposer.css';

export default function RematchComposer({ puzzleData, difficulty, errorCount, elapsedSeconds, userId, userEmail, onClose }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [challengerName, setChallengerName] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const fileInputRef = useRef(null);

  const handlePickPhoto = () => fileInputRef.current?.click();

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSend = async () => {
    setStatus('sending');
    try {
      let photoPath = null;
      if (photoFile) {
        photoPath = await uploadSharedPhoto(photoFile);
      }

      const rematch = await createRematch({
        puzzle: puzzleData.puzzle,
        solution: puzzleData.solution,
        difficulty,
        photoPath,
        challengerName: userEmail ?? (challengerName.trim() || null),
        challengerUserId: userId ?? null,
        challengerErrors: errorCount,
        challengerSeconds: elapsedSeconds
      });

      const link = buildRematchLink(rematch.id);
      const message =
        lang === 'fr'
        ? `🧩 Je te défie sur LA MÊME grille de Sudoku Art !\nMon résultat : ${errorCount} erreur${errorCount === 1 ? '' : 's'}, ${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s.\n${link}` + (photoPath ? `\n⚠️ Ce lien donne accès à une photo (supprimée dans ${SHARE_EXPIRY_DAYS} j).` : '')
        : `🧩 I challenge you on THE SAME Sudoku Art grid!\nMy result: ${errorCount} error${errorCount === 1 ? '' : 's'}, ${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s.\n${link}` + (photoPath ? `\n⚠️ This link gives access to a photo (deleted in ${SHARE_EXPIRY_DAYS} days).` : '');

      if (isMobileDevice() && navigator.share) {
        try {
          await navigator.share({ title: t('rc_share_title'), text: message });
          setStatus('done');
          return;
        } catch {
          // partage annulé : on retombe sur WhatsApp Web ci-dessous
        }
      }
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
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
            <button className="challenge-btn-primary" onClick={onClose}>{t('rc_close_btn')}</button>
          </>
        ) : (
          <>
            <p className="hint-step-text">
              {t('rc_desc')}
            </p>

            {!userEmail && (
              <div className="challenge-step">
                <p className="challenge-step-title">{lang === 'fr' ? 'Ton prénom (optionnel)' : 'Your name (optional)'}</p>
                <input
                  type="text"
                  className="challenge-name-input"
                  value={challengerName}
                  onChange={(e) => setChallengerName(e.target.value)}
                  placeholder={t('defi_prenom_placeholder')}
                />
              </div>
            )}

            <div className="challenge-step">
              <p className="challenge-step-title">{lang === 'fr' ? 'Ajouter une photo perso (optionnel)' : 'Add a personal photo (optional)'}</p>
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
