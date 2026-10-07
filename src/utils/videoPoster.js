// src/utils/videoPoster.js
// Extraction du poster (image de couverture) d'une vidéo, côté client,
// pour le mode partage/défis (voir MediaPicker.jsx) :
// - depuis un fichier local (upload) : jamais de souci CORS, l'URL objet
//   (URL.createObjectURL) est same-origin pour le navigateur, quel que soit
//   le codec (HEVC/.mov inclus, lu nativement par Safari).
// - depuis un lien direct distant (.mp4/.webm) : nécessite que l'hébergeur
//   serve des en-têtes CORS pour crossOrigin="anonymous" (même classe de
//   problème que les œuvres Wikimedia, voir wikimediaDirectUrl.js) ; échoue
//   proprement sinon — à charge de l'appelant de proposer un repli (poster
//   importé manuellement).
function loadVideoElement(src, { crossOrigin } = {}) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    if (crossOrigin) video.crossOrigin = crossOrigin;
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = () => resolve(video);
    video.onerror = () => reject(new Error('Impossible de lire cette vidéo.'));
    video.src = src;
  });
}

function seekTo(video, atSeconds) {
  return new Promise((resolve, reject) => {
    const duration = Number.isFinite(video.duration) ? video.duration : atSeconds + 1;
    const target = Math.min(Math.max(atSeconds, 0), Math.max(duration - 0.1, 0));
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    try {
      video.currentTime = target;
    } catch (err) {
      reject(err);
    }
  });
}

function captureFrame(video) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Extraction de l'image impossible."))),
      'image/jpeg',
      0.85
    );
  });
}

function ratioOf(video) {
  return video.videoWidth && video.videoHeight ? video.videoWidth / video.videoHeight : null;
}

// Extrait un poster depuis un fichier vidéo local (upload) à l'instant
// `atSeconds` (0,5 s par défaut, pour éviter une frame 0 souvent noire).
// Réutilisée telle quelle par le curseur "Choisir l'image de couverture"
// (ré-appelée avec un autre `atSeconds`). Retourne { blob, duration, ratio }.
export async function extractPosterFromFile(file, atSeconds = 0.5) {
  const url = URL.createObjectURL(file);
  try {
    const video = await loadVideoElement(url);
    await seekTo(video, atSeconds);
    const blob = await captureFrame(video);
    return { blob, duration: video.duration, ratio: ratioOf(video) };
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Tentative d'extraction depuis un lien vidéo direct distant — rejette si
// l'hébergeur ne sert pas d'en-têtes CORS (canvas "tainted").
export async function extractPosterFromRemoteUrl(url, atSeconds = 0.5) {
  const video = await loadVideoElement(url, { crossOrigin: 'anonymous' });
  await seekTo(video, atSeconds);
  const blob = await captureFrame(video);
  return { blob, duration: video.duration, ratio: ratioOf(video) };
}
