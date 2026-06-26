// src/components/DifficultySelector.jsx
import { useRef, useState } from 'react';
import ChallengeComposer from './ChallengeComposer';
import './DifficultySelector.css';

const OPTIONS = [
  { id: 'moyen', label: 'Moyen', tier: 'Image commune', icon: '🙂' },
  { id: 'complique', label: 'Compliqué', tier: 'Image rare', icon: '😬' },
  { id: 'enfer', label: 'Enfer', tier: 'Image légendaire', icon: '🔥' }
];

function formatChallengeDate(dateString) {
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  } catch {
    return '';
  }
}

export default function DifficultySelector({ onSelect, pendingChallenges, onPlayChallenge }) {
  const [customImage, setCustomImage] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const fileInputRef = useRef(null);

  const handlePickPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (customImage) URL.revokeObjectURL(customImage);
    const url = URL.createObjectURL(file);
    setCustomImage(url);
  };

  const handleCancelCustom = () => {
    if (customImage) URL.revokeObjectURL(customImage);
    setCustomImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectDifficulty = (difficultyId) => {
    onSelect(difficultyId, customImage);
  };

  return (
    <div className="difficulty-selector">
      <h1>Sudoku Art</h1>
      <p className="subtitle">
        {customImage
          ? 'Photo personnelle prête — choisis maintenant la difficulté.'
          : "Choisis ta difficulté. Plus c'est dur, plus la récompense est rare."}
      </p>

      {pendingChallenges && pendingChallenges.length > 0 && (
        <div className="pending-challenges">
          <p className="pending-challenges-title">🎯 Défis reçus</p>
          {pendingChallenges.map(challenge => (
            <div className="pending-challenge-card" key={challenge.id}>
              <div className="pending-challenge-info">
                <strong>{challenge.sender_email}</strong> t'a envoyé un défi
                <span className="pending-challenge-date">
                  {' '}le {formatChallengeDate(challenge.created_at)}
                </span>
              </div>
              <button
                className="pending-challenge-play"
                onClick={() => onPlayChallenge(challenge)}
              >
                Jouer
              </button>
            </div>
          ))}
        </div>
      )}

      {customImage && (
        <div className="custom-photo-preview">
          <img src={customImage} alt="Photo choisie pour le filigrane" />
          <button className="custom-photo-cancel" onClick={handleCancelCustom}>
            ✕ Retirer la photo
          </button>
        </div>
      )}

      <div className="difficulty-grid">
        {OPTIONS.map(opt => (
          <button
            key={opt.id}
            className={`difficulty-card difficulty-${opt.id}`}
            onClick={() => handleSelectDifficulty(opt.id)}
          >
            <span className="difficulty-icon">{opt.icon}</span>
            <span className="difficulty-label">{opt.label}</span>
            <span className="difficulty-tier">{opt.tier}</span>
          </button>
        ))}
      </div>

      {!customImage && (
        <>
          <p className="custom-photo-divider">— ou —</p>
          <button className="custom-photo-btn" onClick={handlePickPhoto}>
            📷 Utiliser une photo personnelle comme filigrane
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </>
      )}

      <p className="custom-photo-divider">— ou —</p>
      <button className="send-challenge-btn" onClick={() => setShowComposer(true)}>
        🎯 Envoyer une grille personnalisée à un ami
      </button>

      {showComposer && (
        <ChallengeComposer onClose={() => setShowComposer(false)} />
      )}
    </div>
  );
}
