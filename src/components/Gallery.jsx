import { translate as t, useT } from '../i18n/index.jsx';
// src/components/Gallery.jsx
import { useMemo, useState } from 'react';
import { TIER_LABELS } from '../data/imageLibrary';
import PaintingDetailModal from './PaintingDetailModal';
import './Gallery.css';

export default function Gallery({ gallery, onClose }) {
  const [activeTier, setActiveTier] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  const tiers = useMemo(() => {
    const set = new Set(gallery.map(img => img.tier));
    return Array.from(set);
  }, [gallery]);

  const filtered = activeTier === 'all'
    ? gallery
    : gallery.filter(img => img.tier === activeTier);

  return (
    <div className="gallery-overlay">
      <div className="gallery-panel">
        <div className="gallery-header">
          <h2>{t('gallery_title')} ({gallery.length})</h2>
          <button className="gallery-close" onClick={onClose}>✕</button>
        </div>

        {gallery.length === 0 ? (
          <p className="gallery-empty">
            {t('gallery_empty')}
          </p>
        ) : (
          <>
            <div className="gallery-filters">
              <button
                className={activeTier === 'all' ? 'active' : ''}
                onClick={() => setActiveTier('all')}
              >
                Tout
              </button>
              {tiers.map(tier => (
                <button
                  key={tier}
                  className={activeTier === tier ? 'active' : ''}
                  onClick={() => setActiveTier(tier)}
                >
                  {TIER_LABELS[tier] ?? tier}
                </button>
              ))}
            </div>

            <div className="gallery-grid">
              {filtered.map((img, idx) => (
                <button
                  type="button"
                  className={`gallery-item tier-${img.tier}`}
                  key={`${img.id}-${idx}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img.path} alt={img.title ?? lang === 'fr' ? 'Image débloquée' : 'Image unlocked'} loading="lazy" />
                  <span className="gallery-item-tier">{TIER_LABELS[img.tier] ?? img.tier}</span>
                  {img.title && (
                    <div className="gallery-item-info">
                      <span className="gallery-item-title">{img.title}</span>
                      <span className="gallery-item-artist">{img.artist}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedImage && (
        <PaintingDetailModal image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
}
