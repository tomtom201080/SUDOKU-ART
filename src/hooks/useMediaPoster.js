// src/hooks/useMediaPoster.js
// Résout la vignette (poster) d'un défi/grille partagée pour l'affichage
// (listes DefiDashboard/MemoriesDashboard, détail) — média unifié
// (media_id → shared_media, voir src/lib/sharedMedia.js) en priorité, repli
// sur l'ancien système (photo_path → bucket sudoku-images) pour les défis
// créés avant cette fonctionnalité.
import { useEffect, useState } from 'react';
import { fetchSharedMedia, getSharedMediaPublicUrl } from '../lib/sharedMedia';
import { getSharedPhotoPublicUrl } from '../lib/sharedPhoto';

export function useMediaPoster(mediaId, legacyPhotoPath) {
  const [state, setState] = useState({ posterUrl: null, isVideo: false });

  useEffect(() => {
    if (mediaId) {
      let cancelled = false;
      fetchSharedMedia(mediaId)
        .then(media => {
          if (cancelled) return;
          setState({
            posterUrl: media ? getSharedMediaPublicUrl(media.poster_path) : null,
            isVideo: media?.type === 'video'
          });
        })
        .catch(() => { if (!cancelled) setState({ posterUrl: null, isVideo: false }); });
      return () => { cancelled = true; };
    }
    if (legacyPhotoPath) {
      setState({ posterUrl: getSharedPhotoPublicUrl(legacyPhotoPath), isVideo: false });
      return;
    }
    setState({ posterUrl: null, isVideo: false });
  }, [mediaId, legacyPhotoPath]);

  return state;
}
