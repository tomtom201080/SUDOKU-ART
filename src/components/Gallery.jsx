// src/components/Gallery.jsx
import { useMemo, useState } from 'react';
import { SEASON_LABELS, TIER_LABELS } from '../data/imageLibrary';
import './Gallery.css';

export default function Gallery({ gallery, onClose }) {
  const [activeSeason, setActiveSeason] = useState('all');

  const seasons = useMemo(() => {
    const set = new Set(gallery.map(img => img.season));
    return Array.from(set);
  }, [gallery]);

  const filtered = activeSeason === 'all'
    ? gallery
    : gallery.filter(img => img.season === activeSeason);

  return (
    <div className="gallery-overlay">
      <div className="gallery-panel">
        <div className="gallery-header">
          <h2>Galerie ({gallery.length})</h2>
          <button className="gallery-close" onClick={onClose}>✕</button>
        </div>

        {gallery.length === 0 ? (
          <p className="gallery-empty">
            Termine un sudoku pour débloquer ta première image !
          </p>
        ) : (
          <>
            <div className="gallery-filters">
              <button
                className={activeSeason === 'all' ? 'active' : ''}
                onClick={() => setActiveSeason('all')}
              >
                Tout
              </button>
              {seasons.map(season => (
                <button
                  key={season}
                  className={activeSeason === season ? 'active' : ''}
                  onClick={() => setActiveSeason(season)}
                >
                  {SEASON_LABELS[season] ?? season}
                </button>
              ))}
            </div>

            <div className="gallery-grid">
              {filtered.map((img, idx) => (
                <div className={`gallery-item tier-${img.tier}`} key={`${img.id}-${idx}`}>
                  <img src={img.path} alt={img.title ?? 'Image débloquée'} loading="lazy" />
                  <span className="gallery-item-tier">{TIER_LABELS[img.tier] ?? img.tier}</span>
                  {img.title && (
                    <div className="gallery-item-info">
                      <span className="gallery-item-title">{img.title}</span>
                      <span className="gallery-item-artist">{img.artist}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
