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
        `🧩 Je te défie sur LA MÊME grille de Sudoku Art que je viens de finir !\n` +
        `Mon résultat : ${errorCount} erreur${errorCount === 1 ? '' : 's'}, ${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s. À toi de faire mieux !\n` +
        `${link}` +
        (photoPath ? `\n⚠️ Ce lien donne accès à une photo : ne le transfère qu'à la bonne personne (supprimée dans ${SHARE_EXPIRY_DAYS} jours).` : '');

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
          <h2>🎯 Défier un ami avec cette grille</h2>
          <button className="challenge-close" onClick={onClose}>✕</button>
        </div>

        {status === 'done' ? (
          <>
            <p className="challenge-success">Défi envoyé ! On te dira qui a gagné dès que ton ami aura fini.</p>
            <button className="challenge-btn-primary" onClick={onClose}>Fermer</button>
          </>
        ) : (
          <>
            <p className="hint-step-text">
              Ton ami jouera exactement la même grille que toi, et on comparera
              vos résultats (erreurs et temps) une fois qu'il aura terminé.
            </p>

            {!userEmail && (
              <div className="challenge-step">
                <p className="challenge-step-title">Ton prénom (optionnel, pour qu'on sache qui a gagné)</p>
                <input
                  type="text"
                  className="challenge-name-input"
                  value={challengerName}
                  onChange={(e) => setChallengerName(e.target.value)}
                  placeholder="Ex : Thomas"
                />
              </div>
            )}

            <div className="challenge-step">
              <p className="challenge-step-title">Ajouter une photo perso à découvrir (optionnel)</p>
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
              <p className="challenge-error-note">L'envoi a échoué, réessaie dans un instant.</p>
            )}

            <button
              className="challenge-btn-primary"
              onClick={handleSend}
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Envoi en cours…' : 'Envoyer le défi'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
