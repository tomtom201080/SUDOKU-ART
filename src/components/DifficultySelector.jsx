// src/components/DifficultySelector.jsx
import { useRef, useState, useEffect } from 'react';
import { uploadSharedPhoto, buildShareLink, SHARE_EXPIRY_DAYS } from '../lib/sharedPhoto';
import './DifficultySelector.css';

const OPTIONS = [
  { id: 'moyen', label: 'Moyen', tier: 'Image commune', icon: '🙂' },
  { id: 'complique', label: 'Compliqué', tier: 'Image rare', icon: '😬' },
  { id: 'enfer', label: 'Enfer', tier: 'Image légendaire', icon: '🔥' }
];

export default function DifficultySelector({ onSelect, sharedPhoto }) {
  const [customImage, setCustomImage] = useState(null);
  const [customFile, setCustomFile] = useState(null);
  const [isFromSharedLink, setIsFromSharedLink] = useState(false);
  const [shareState, setShareState] = useState('idle'); // idle | uploading | done | error
  const fileInputRef = useRef(null);

  // Si la page a été ouverte via un lien de partage reçu d'un ami, on
  // pré-remplit directement la photo personnelle avec celle-ci.
  useEffect(() => {
    if (sharedPhoto?.publicUrl) {
      setCustomImage(sharedPhoto.publicUrl);
      setIsFromSharedLink(true);
    }
  }, [sharedPhoto]);

  const handlePickPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (customImage && !isFromSharedLink) URL.revokeObjectURL(customImage);
    const url = URL.createObjectURL(file);
    setCustomImage(url);
    setCustomFile(file);
    setIsFromSharedLink(false);
    setShareState('idle');
  };

  const handleCancelCustom = () => {
    if (customImage && !isFromSharedLink) URL.revokeObjectURL(customImage);
    setCustomImage(null);
    setCustomFile(null);
    setIsFromSharedLink(false);
    setShareState('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectDifficulty = (difficultyId) => {
    onSelect(difficultyId, customImage);
  };

  const handleShareLink = async () => {
    if (!customFile) return;
    setShareState('uploading');
    try {
      const path = await uploadSharedPhoto(customFile);
      const link = buildShareLink(path);
      const message =
        `Je te défie de finir mon Sudoku Art pour découvrir ma photo ! 🧩📷\n` +
        `${link}\n` +
        `⚠️ Cette photo sera supprimée de nos serveurs dans ${SHARE_EXPIRY_DAYS} jours, ne traîne pas !`;

      if (navigator.share) {
        try {
          await navigator.share({ title: 'Sudoku Art', text: message });
          setShareState('done');
          return;
        } catch {
          // partage annulé : on retombe sur WhatsApp Web ci-dessous
        }
      }
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      setShareState('done');
    } catch (err) {
      console.error(err);
      setShareState('error');
    }
  };

  return (
    <div className="difficulty-selector">
      <h1>Sudoku Art</h1>
      <p className="subtitle">
        {customImage
          ? 'Photo personnelle prête — choisis maintenant la difficulté.'
          : "Choisis ta difficulté. Plus c'est dur, plus la récompense est rare."}
      </p>

      {isFromSharedLink && (
        <p className="shared-photo-banner">
          📷 Un ami t'a envoyé une photo à découvrir ! Elle sera supprimée de nos
          serveurs {SHARE_EXPIRY_DAYS} jours après son envoi, alors ne tarde pas trop.
        </p>
      )}

      {customImage && (
        <div className="custom-photo-preview">
          <img src={customImage} alt="Photo choisie pour le filigrane" />
          <button className="custom-photo-cancel" onClick={handleCancelCustom}>
            ✕ Retirer la photo
          </button>

          {!isFromSharedLink && (
            <>
              <button
                className="custom-photo-share"
                onClick={handleShareLink}
                disabled={shareState === 'uploading'}
              >
                {shareState === 'uploading'
                  ? 'Envoi en cours…'
                  : '🔗 Envoyer cette photo à un ami (lien de jeu)'}
              </button>
              {shareState === 'done' && (
                <p className="custom-photo-share-note">
                  Lien envoyé ! Il sera valable {SHARE_EXPIRY_DAYS} jours.
                </p>
              )}
              {shareState === 'error' && (
                <p className="custom-photo-share-error">
                  L'envoi a échoué, réessaie dans un instant.
                </p>
              )}
            </>
          )}
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
    </div>
  );
}
