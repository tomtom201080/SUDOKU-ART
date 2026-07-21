// src/utils/device.js

// Sur ordinateur (Mac/Windows), le sélecteur de partage natif du système
// n'inclut jamais WhatsApp (son application ne s'y intègre pas, contrairement
// à des apps comme Messages ou Notes). On préfère donc ouvrir directement
// WhatsApp Web sur ordinateur, et réserver le partage natif au mobile, où il
// fonctionne correctement avec WhatsApp installé.
export function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// Catégorise document.referrer en quelques familles larges, sans jamais
// renvoyer l'URL complète (peut contenir des paramètres de tracking tiers).
export function classifyReferrer(referrer) {
  if (!referrer) return 'direct';
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '');
    if (/google\.|bing\.|duckduckgo\.|yahoo\./.test(host)) return 'search';
    if (/facebook\.|instagram\.|twitter\.|x\.com|tiktok\.|linkedin\.|whatsapp\.|t\.me/.test(host)) return 'social';
    if (host === window.location.hostname) return 'internal';
    return 'other';
  } catch {
    return 'other';
  }
}

// Partage un texte simple : partage natif sur mobile, WhatsApp Web sur
// ordinateur (voir isMobileDevice plus haut pour le pourquoi).
export async function shareText(text, title = 'Sudoku Art') {
  if (isMobileDevice() && navigator.share) {
    try {
      await navigator.share({ title, text });
      return;
    } catch {
      // partage annulé : on retombe sur WhatsApp Web ci-dessous
    }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}
