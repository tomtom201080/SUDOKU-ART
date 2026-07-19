// src/components/PaintingDetailModal.jsx
import '../components/WinModal.css';
import './PaintingDetailModal.css';

export default function PaintingDetailModal({ image, onClose }) {
  if (!image) return null;

  const { lang } = useT();
  return (
    <div className="painting-detail-overlay" onClick={onClose}>
      <div className="painting-detail-panel" onClick={(e) => e.stopPropagation()}>
        <button className="painting-detail-close" onClick={onClose}>✕</button>

        <img
          className="win-reward-image painting-detail-image"
          src={image.path}
          alt={image.title ?? lang === 'fr' ? 'Tableau débloqué' : 'Artwork unlocked'}
        />

        {image.title && (
          <div className="painting-info">
            <p className="painting-title">{image.title}</p>
            <p className="painting-meta">
              {image.artist}{image.year ? ` — ${image.year}` : ''}
            </p>
            {image.style && <p className="painting-meta">{image.style}</p>}
            {image.museum && (
              <p className="painting-museum">
                📍 {image.museum}
                {image.city ? `, ${image.city}` : ''}
                {image.country ? ` (${image.country})` : ''}
              </p>
            )}
            {image.funFact && (
              <p className="painting-fun-fact">💡 {image.funFact}</p>
            )}
            {image.observe && (
              <p className="painting-observe">👀 À observer : {image.observe}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
