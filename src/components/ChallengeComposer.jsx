// src/components/ChallengeComposer.jsx
import { useRef, useState } from 'react';
import { uploadSharedPhoto, SHARE_EXPIRY_DAYS } from '../lib/sharedPhoto';
import { createChallenge, buildChallengeLink } from '../lib/challenges';
import { isMobileDevice } from '../utils/device';
import './ChallengeComposer.css';

const DIFFICULTY_OPTIONS = [
  { value: 'auto', label: 'Automatique (au hasard)' },
  { value: 'facile', label: 'Facile' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'complique', label: 'Compliqué' },
  { value: 'enfer', label: 'Enfer' }
];

const ERROR_OPTIONS = [
  { value: 1, label: '1' },
  { value: 3, label: '3' },
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: null, label: 'Illimité' }
];

const TIME_OPTIONS = [
  { value: null, label: 'Illimité' },
  { value: 3, label: '3 min' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' }
];

export default function ChallengeComposer({ onClose }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [difficultyMode, setDifficultyMode] = useState('auto');
  const [maxErrors, setMaxErrors] = useState(3);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [shareLink, setShareLink] = useState(null);
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
    if (!photoFile) return;
    setStatus('sending');
    try {
      const path = await uploadSharedPhoto(photoFile);
      const challenge = await createChallenge({
        photoPath: path,
        difficultyMode,
        maxErrors,
        timeLimitMinutes
      });
      const link = buildChallengeLink(challenge.id);
      setShareLink(link);

      const difficultyLabel = DIFFICULTY_OPTIONS.find(o => o.value === difficultyMode)?.label ?? '';
      const errorsLabel = maxErrors === null ? 'illimitées' : `${maxErrors} max`;
      const timeLabel = timeLimitMinutes === null ? 'illimité' : `${timeLimitMinutes} min`;
      const message =
        `Je t'envoie un défi Sudoku Art avec une photo à découvrir ! 🧩📷\n` +
        `Difficulté : ${difficultyLabel} — Erreurs ${errorsLabel} — Temps ${timeLabel}\n` +
        `${link}\n` +
        `⚠️ La photo sera supprimée de nos serveurs dans ${SHARE_EXPIRY_DAYS} jours, ne traîne pas !`;

      if (isMobileDevice() && navigator.share) {
        try {
          await navigator.share({ title: 'Défi Sudoku Art', text: message });
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
          <h2>🎯 Envoyer une grille personnalisée</h2>
          <button className="challenge-close" onClick={onClose}>✕</button>
        </div>

        {status === 'done' ? (
          <>
            <p className="challenge-success">Défi envoyé ! Il sera valable {SHARE_EXPIRY_DAYS} jours.</p>
            {shareLink && (
              <p className="challenge-link-fallback">
                Si le partage n'a pas fonctionné, copie ce lien :<br />
                <code>{shareLink}</code>
              </p>
            )}
            <button className="challenge-btn-primary" onClick={onClose}>Fermer</button>
          </>
        ) : (
          <>
            <div className="challenge-step">
              <p className="challenge-step-title">1. Choisis la photo à faire découvrir</p>
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
              <p className="challenge-step-title">2. Niveau de difficulté</p>
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
              <p className="challenge-step-title">3. Nombre d'erreurs autorisées</p>
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
              <p className="challenge-step-title">4. Temps à respecter</p>
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
              <p className="challenge-error-note">L'envoi a échoué, réessaie dans un instant.</p>
            )}

            <button
              className="challenge-btn-primary"
              onClick={handleSend}
              disabled={!photoFile || status === 'sending'}
            >
              {status === 'sending' ? 'Envoi en cours…' : 'Créer et envoyer le défi'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
