// src/components/VideoPlayerOverlay.jsx
// Lecture de la vidéo jointe, déclenchée par le bouton ▶ sur le poster une
// fois la grille résolue (WinModal.jsx). Surimpression fermable, jamais
// bloquante pour la victoire : si la vidéo est indisponible, affiche un
// message clair plutôt que de planter.
import { useEffect, useState } from 'react';
import { useT } from '../i18n/index.jsx';
import { resolvePlaybackSource, incrementMediaPlay, reportSharedMedia } from '../lib/sharedMedia';
import './VideoPlayerOverlay.css';

export default function VideoPlayerOverlay({ media, onClose }) {
  const { t } = useT();
  const source = resolvePlaybackSource(media);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    if (media?.id) incrementMediaPlay(media.id);
  }, [media?.id]);

  const handleReport = () => {
    if (!media?.id || reported) return;
    setReported(true);
    reportSharedMedia(media.id).catch(() => null);
  };

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="video-player-overlay" onClick={onClose}>
      <button type="button" className="video-player-close" onClick={onClose} aria-label={t('video_player_close')}>✕</button>
      <div className="video-player-stage" onClick={(e) => e.stopPropagation()}>
        {source?.kind === 'iframe' && (
          <iframe
            className="video-player-iframe"
            src={source.url}
            title="video"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
          />
        )}
        {source?.kind === 'video' && (
          // playsInline : indispensable sur iOS Safari pour éviter le plein
          // écran natif forcé ; autoPlay + muted={false} : le son est voulu
          // actif ici (clic explicite du joueur, pas une lecture surprise).
          <video
            className="video-player-video"
            src={source.url}
            controls
            autoPlay
            playsInline
          />
        )}
        {!source && (
          <div className="video-player-unavailable">
            <p>🎬 {t('video_player_unavailable')}</p>
          </div>
        )}
      </div>
      {source && media?.id && (
        <button type="button" className="video-player-report" onClick={(e) => { e.stopPropagation(); handleReport(); }}>
          {reported ? t('video_player_reported') : t('video_player_report')}
        </button>
      )}
    </div>
  );
}
