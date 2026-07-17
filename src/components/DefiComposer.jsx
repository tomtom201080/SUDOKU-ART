// src/components/DefiComposer.jsx
// Flux Défi : configure (difficulté + photo optionnelle) → envoie → lance la grille
import { useRef, useState } from 'react';
import { generateSudoku } from '../sudoku/generator';
import { uploadSharedPhoto } from '../lib/sharedPhoto';
import { createRematch, buildRematchLink } from '../lib/rematches';
import { isMobileDevice } from '../utils/device';
import './ChallengeComposer.css';
import './DefiComposer.css';

const DIFFICULTY_OPTIONS = [
  { id: 'facile',    label: 'Facile',    icon: '😌' },
  { id: 'moyen',     label: 'Moyen',     icon: '🙂' },
  { id: 'complique', label: 'Compliqué', icon: '😬' },
  { id: 'enfer',     label: 'Enfer',     icon: '🔥' },
];

export default function DefiComposer({ onClose, onStartGame, userId, userEmail }) {
  const [step, setStep]               = useState('config'); // 'config' | 'sending' | 'done'
  const [difficulty, setDifficulty]   = useState(null);
  const [photoFile, setPhotoFile]     = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [challengerName, setChallengerName] = useState('');
  const [error, setError]             = useState(null);
  const fileInputRef = useRef(null);

  const handlePickPhoto = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSend = async () => {
    if (!difficulty) return;
    setStep('sending');
    setError(null);
    try {
      // 1. Générer la grille maintenant (même grille pour les deux joueurs)
      const puzzleData = generateSudoku(difficulty);

      // 2. Uploader la photo si choisie
      const photoPath = photoFile ? await uploadSharedPhoto(photoFile) : null;
      const photoUrl  = photoPreview ?? null;

      // 3. Créer le défi en base (le destinataire jouera cette même grille)
      const rematch = await createRematch({
        puzzle:            puzzleData.puzzle,
        solution:          puzzleData.solution,
        difficulty,
        photoPath,
        challengerName:    userEmail ?? (challengerName.trim() || 'Un ami'),
        challengerUserId:  userId ?? null,
        challengerErrors:  0,   // sera mis à jour à la fin de la partie de l'expéditeur
        challengerSeconds: 0,
      });

      const link = buildRematchLink(rematch.id);
      const photoDisclaimer = photoPath
        ? `\n⚠️ Ce lien donne accès à ta photo, envoie-le uniquement à la bonne personne.`
        : '';
      const message =
        `🎯 Je te défie sur Sudoku Art !\n` +
        `Résous cette grille${photoPath ? ' et découvre ma photo cachée' : ''} — qui finira le plus vite ?\n` +
        `${link}${photoDisclaimer}`;

      // 4. Envoyer le lien
      if (isMobileDevice() && navigator.share) {
        try { await navigator.share({ title: 'Défi Sudoku Art', text: message }); }
        catch {}
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      }

      setStep('done');

      // 5. Lancer la partie pour l'expéditeur avec la même grille
      setTimeout(() => {
        onStartGame({ rematch, puzzleData, photoUrl });
      }, 1200);

    } catch (err) {
      console.error(err);
      setError("L'envoi a échoué. Réessaie dans un instant.");
      setStep('config');
    }
  };

  return (
    <div className="challenge-overlay">
      <div className="challenge-panel">
        <div className="challenge-header">
          <h2>🎯 Créer un défi</h2>
          <button className="challenge-close" onClick={onClose}>✕</button>
        </div>

        {step === 'done' && (
          <div className="defi-done">
            <p className="challenge-success">✅ Défi envoyé ! La grille se lance…</p>
          </div>
        )}

        {(step === 'config' || step === 'sending') && (
          <>
            {/* Difficulté */}
            <p className="challenge-step-title">1. Choisis la difficulté</p>
            <div className="defi-difficulty-grid">
              {DIFFICULTY_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`defi-diff-btn ${difficulty === opt.id ? 'is-selected' : ''}`}
                  onClick={() => setDifficulty(opt.id)}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Photo optionnelle */}
            <p className="challenge-step-title">2. Ajouter une photo (optionnel)</p>
            {photoPreview ? (
              <div className="defi-photo-row">
                <img className="defi-photo-thumb" src={photoPreview} alt="Photo choisie" />
                <button className="challenge-link-btn" onClick={handlePickPhoto}>Changer</button>
                <button className="challenge-link-btn" onClick={() => { URL.revokeObjectURL(photoPreview); setPhotoFile(null); setPhotoPreview(null); }}>Retirer</button>
              </div>
            ) : (
              <button className="challenge-pick-btn" onClick={handlePickPhoto}>
                📷 Choisir une photo
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

            {/* Prénom si pas connecté */}
            {!userEmail && (
              <>
                <p className="challenge-step-title">3. Ton prénom (pour le résultat)</p>
                <input
                  className="challenge-name-input"
                  type="text"
                  value={challengerName}
                  onChange={e => setChallengerName(e.target.value)}
                  placeholder="Ex : Thomas"
                />
              </>
            )}

            {error && <p className="challenge-error-note">{error}</p>}

            <button
              className="challenge-btn-primary"
              disabled={!difficulty || step === 'sending'}
              onClick={handleSend}
            >
              {step === 'sending' ? 'Envoi en cours…' : '📤 Envoyer et jouer'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
