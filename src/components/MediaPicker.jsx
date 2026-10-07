// src/components/MediaPicker.jsx
// Sélecteur unifié "photo OU vidéo" pour le mode partage et les défis —
// remplace le simple <input type=file> photo utilisé jusqu'ici dans
// ChallengeComposer.jsx / DefiComposer.jsx / RematchComposer.jsx. Gère les
// 3 chemins : photo, lien vidéo (YouTube/Vimeo/direct), upload vidéo (tab
// masqué si non connecté, voir src/lib/sharedMedia.js).
//
// Une fois le média créé (ligne shared_media en base), le composant appelle
// onMediaReady({ mediaId, type, posterUrl, media }) — `media` est la ligne
// shared_media complète (utile pour attacher directement au watermark côté
// useGame.js sans refetch, voir DefiComposer.jsx) ; le parent n'a le plus
// souvent besoin que de mediaId pour son createChallenge/createRematch.
import { useEffect, useRef, useState } from 'react';
import { useT } from '../i18n/index.jsx';
import {
  uploadPhotoFile, uploadVideoFile, uploadPosterBlob, copyRemoteThumbnailToPoster,
  createSharedMedia, detectVideoProvider, extractYoutubeId,
  youtubeThumbnailUrl, fetchVimeoOEmbed, getSharedMediaPublicUrl,
  ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE_MB, MAX_VIDEO_DURATION_SECONDS
} from '../lib/sharedMedia';
import { extractPosterFromFile, extractPosterFromRemoteUrl } from '../utils/videoPoster';
import './MediaPicker.css';

// autoUploadFile (optionnel) : fichier photo déjà choisi par le parent avant
// le montage (ex. ChallengeComposer ouvert depuis l'accueil avec une photo
// déjà sélectionnée) — uploadé automatiquement au montage, comme si l'input
// photo venait d'être utilisé.
export default function MediaPicker({ userId, onMediaReady, onClear, autoUploadFile = null }) {
  const { t } = useT();
  const [tab, setTab] = useState('photo'); // 'photo' | 'link' | 'upload'
  const [status, setStatus] = useState('idle'); // idle | working | adjusting | ready | error
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(null); // { type, posterUrl }

  // Étape d'ajustement du poster (upload vidéo uniquement, avant envoi).
  const [pendingFile, setPendingFile] = useState(null);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState(null);
  const [posterBlob, setPosterBlob] = useState(null);
  const [posterSeconds, setPosterSeconds] = useState(0.5);
  const [videoDuration, setVideoDuration] = useState(null);
  const [videoRatio, setVideoRatio] = useState(null);

  const [linkValue, setLinkValue] = useState('');

  const abortRef = useRef(null);
  const videoInputRef = useRef(null);

  const revokePosterPreview = () => {
    if (posterPreviewUrl) URL.revokeObjectURL(posterPreviewUrl);
  };

  const reset = () => {
    abortRef.current?.abort();
    revokePosterPreview();
    setStatus('idle');
    setError(null);
    setProgress(0);
    setReady(null);
    setPendingFile(null);
    setPosterBlob(null);
    setPosterPreviewUrl(null);
    setLinkValue('');
    onClear?.();
  };

  // ─── Photo ──────────────────────────────────────────────────────────
  const uploadPhoto = async (file) => {
    setStatus('working');
    setError(null);
    try {
      const path = await uploadPhotoFile(file);
      const media = await createSharedMedia({ type: 'photo', source: 'upload', posterPath: path });
      const posterUrl = getSharedMediaPublicUrl(path);
      setReady({ type: 'photo', posterUrl });
      setStatus('ready');
      onMediaReady({ mediaId: media.id, type: 'photo', posterUrl, media });
    } catch (err) {
      setError(err.message || t('media_error_generic'));
      setStatus('error');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) uploadPhoto(file);
  };

  useEffect(() => {
    if (autoUploadFile) uploadPhoto(autoUploadFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Lien vidéo ─────────────────────────────────────────────────────
  const handleLinkSubmit = async () => {
    const url = linkValue.trim();
    const provider = detectVideoProvider(url);
    if (!provider) {
      setError(t('media_error_invalid_link'));
      setStatus('error');
      return;
    }

    setStatus('working');
    setError(null);
    try {
      let posterPath;
      let duration = null;
      let ratio = null;

      if (provider === 'youtube') {
        const id = extractYoutubeId(url);
        posterPath = await copyRemoteThumbnailToPoster(youtubeThumbnailUrl(id));
      } else if (provider === 'vimeo') {
        const oembed = await fetchVimeoOEmbed(url);
        duration = oembed.duration ?? null;
        ratio = oembed.width && oembed.height ? oembed.width / oembed.height : null;
        posterPath = await copyRemoteThumbnailToPoster(oembed.thumbnail_url);
      } else {
        // Lien direct (.mp4/.webm) : extraction client, repli manuel si CORS bloque.
        try {
          const extracted = await extractPosterFromRemoteUrl(url);
          duration = extracted.duration;
          ratio = extracted.ratio;
          posterPath = await uploadPosterBlob(extracted.blob);
        } catch {
          setError(t('media_error_direct_cors'));
          setStatus('error');
          return;
        }
      }

      const media = await createSharedMedia({
        type: 'video', source: 'link', videoUrl: url, provider,
        posterPath, durationSeconds: duration, ratio
      });
      const posterUrl = getSharedMediaPublicUrl(posterPath);
      setReady({ type: 'video', posterUrl });
      setStatus('ready');
      onMediaReady({ mediaId: media.id, type: 'video', posterUrl, media });
    } catch (err) {
      setError(err.message || t('media_error_generic'));
      setStatus('error');
    }
  };

  // ─── Upload vidéo : 1) choix du fichier + poster par défaut ────────
  const handleVideoFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setError(t('media_error_video_format'));
      setStatus('error');
      return;
    }
    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      setError(t('media_error_video_too_large', { max: MAX_VIDEO_SIZE_MB }));
      setStatus('error');
      return;
    }

    setStatus('working');
    setError(null);
    try {
      const { blob, duration, ratio } = await extractPosterFromFile(file, 0.5);
      if (duration > MAX_VIDEO_DURATION_SECONDS) {
        setError(t('media_error_video_too_long', { max: MAX_VIDEO_DURATION_SECONDS }));
        setStatus('error');
        return;
      }
      setPendingFile(file);
      setPosterBlob(blob);
      setPosterPreviewUrl(URL.createObjectURL(blob));
      setPosterSeconds(0.5);
      setVideoDuration(duration);
      setVideoRatio(ratio);
      setStatus('adjusting');
    } catch {
      setError(t('media_error_poster_extraction'));
      setStatus('error');
    }
  };

  // ─── Upload vidéo : 2) curseur "choisir l'image de couverture" ─────
  const handleAdjustSeek = async (seconds) => {
    setPosterSeconds(seconds);
    if (!pendingFile) return;
    try {
      const { blob } = await extractPosterFromFile(pendingFile, seconds);
      revokePosterPreview();
      setPosterBlob(blob);
      setPosterPreviewUrl(URL.createObjectURL(blob));
    } catch {
      // Essai raté (rare) : on garde le dernier poster valide affiché.
    }
  };

  // ─── Upload vidéo : 3) envoi (poster + fichier, avec progression) ──
  const handleConfirmUpload = async () => {
    if (!pendingFile || !posterBlob) return;
    setStatus('working');
    setError(null);
    setProgress(0);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const posterPath = await uploadPosterBlob(posterBlob);
      const videoPath = await uploadVideoFile(pendingFile, { onProgress: setProgress, signal: controller.signal });
      const media = await createSharedMedia({
        type: 'video', source: 'upload', provider: 'storage',
        videoPath, posterPath, durationSeconds: videoDuration, ratio: videoRatio
      });
      const posterUrl = getSharedMediaPublicUrl(posterPath);
      setReady({ type: 'video', posterUrl });
      setStatus('ready');
      onMediaReady({ mediaId: media.id, type: 'video', posterUrl, media });
    } catch (err) {
      if (err.name === 'AbortError') {
        setStatus('adjusting');
      } else {
        setError(err.message || t('media_error_generic'));
        setStatus('error');
      }
    } finally {
      abortRef.current = null;
    }
  };

  if (status === 'ready' && ready) {
    return (
      <div className="media-picker media-picker-ready">
        <div className="media-picker-preview">
          <img src={ready.posterUrl} alt="" />
          {ready.type === 'video' && <span className="media-picker-play-badge">▶</span>}
        </div>
        <p className="media-picker-ready-label">
          {ready.type === 'video' ? t('media_ready_video') : t('media_ready_photo')}
        </p>
        <button type="button" className="media-picker-change-btn" onClick={reset}>
          {t('media_change')}
        </button>
      </div>
    );
  }

  if (status === 'adjusting') {
    return (
      <div className="media-picker">
        <p className="media-picker-step-title">{t('media_choose_cover')}</p>
        {posterPreviewUrl && <img className="media-picker-poster-preview" src={posterPreviewUrl} alt="" />}
        <input
          type="range"
          min={0}
          max={Math.max(videoDuration - 0.2, 0.1)}
          step={0.1}
          value={posterSeconds}
          onChange={(e) => handleAdjustSeek(Number(e.target.value))}
        />
        <div className="media-picker-actions">
          <button type="button" className="media-picker-btn media-picker-btn-primary" onClick={handleConfirmUpload}>
            {t('media_confirm_upload')}
          </button>
          <button type="button" className="media-picker-btn" onClick={reset}>
            {t('media_cancel')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="media-picker">
      <div className="media-picker-tabs">
        <button type="button" className={tab === 'photo' ? 'is-active' : ''} onClick={() => { setTab('photo'); setError(null); }}>
          📷 {t('media_tab_photo')}
        </button>
        <button type="button" className={tab === 'link' ? 'is-active' : ''} onClick={() => { setTab('link'); setError(null); }}>
          🔗 {t('media_tab_link')}
        </button>
        <button
          type="button"
          className={tab === 'upload' ? 'is-active' : ''}
          onClick={() => { if (userId) { setTab('upload'); setError(null); } }}
          disabled={!userId}
          title={!userId ? t('media_upload_login_required') : undefined}
        >
          📹 {t('media_tab_upload')}
        </button>
      </div>

      {tab === 'photo' && (
        <label className="media-picker-upload-btn">
          {status === 'working' ? t('media_working') : t('media_pick_photo')}
          <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={status === 'working'} hidden />
        </label>
      )}

      {tab === 'link' && (
        <div className="media-picker-link-row">
          <input
            type="url"
            className="media-picker-link-input"
            placeholder={t('media_link_placeholder')}
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            disabled={status === 'working'}
          />
          <button
            type="button"
            className="media-picker-btn media-picker-btn-primary"
            onClick={handleLinkSubmit}
            disabled={status === 'working' || !linkValue.trim()}
          >
            {status === 'working' ? t('media_working') : t('media_link_submit')}
          </button>
        </div>
      )}

      {tab === 'upload' && userId && (
        <>
          <p className="media-picker-hint">
            {t('media_video_limits', { size: MAX_VIDEO_SIZE_MB, duration: MAX_VIDEO_DURATION_SECONDS })}
          </p>
          <label className="media-picker-upload-btn">
            {status === 'working' ? t('media_working') : t('media_pick_video')}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              onChange={handleVideoFileChange}
              disabled={status === 'working'}
              hidden
            />
          </label>
          {status === 'working' && progress > 0 && (
            <div className="media-picker-progress">
              <div className="media-picker-progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          )}
          {status === 'working' && abortRef.current && (
            <button type="button" className="media-picker-btn" onClick={() => abortRef.current?.abort()}>
              {t('media_cancel')}
            </button>
          )}
        </>
      )}

      {error && <p className="media-picker-error">{error}</p>}
    </div>
  );
}
