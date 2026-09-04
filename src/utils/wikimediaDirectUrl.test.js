// src/utils/wikimediaDirectUrl.test.js
// Couvre le bug corrigé : exporter/partager une œuvre (fetch().blob() ou
// <img crossorigin> pour <canvas>) échouait pour TOUTE la bibliothèque
// (49/49 œuvres hébergées sur Wikimedia Commons) car Special:FilePath répond
// par une redirection sans en-tête CORS avant d'atteindre la réponse finale
// qui, elle, en a un.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isWikimediaFilePathUrl, resolveWikimediaDirectUrl } from './wikimediaDirectUrl';

const SPECIAL_FILE_PATH = 'https://commons.wikimedia.org/wiki/Special:FilePath/Mona_Lisa_headcrop.jpg';
const DIRECT_URL = 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Mona_Lisa_headcrop.jpg';

describe('isWikimediaFilePathUrl', () => {
  it('reconnaît une URL Special:FilePath', () => {
    expect(isWikimediaFilePathUrl(SPECIAL_FILE_PATH)).toBe(true);
  });

  it('rejette une URL locale ou déjà directe', () => {
    expect(isWikimediaFilePathUrl('/images/commune/la-joconde.jpg')).toBe(false);
    expect(isWikimediaFilePathUrl(DIRECT_URL)).toBe(false);
    expect(isWikimediaFilePathUrl(null)).toBe(false);
  });
});

describe('resolveWikimediaDirectUrl', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renvoie l\'URL telle quelle si ce n\'est pas une URL Special:FilePath', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const result = await resolveWikimediaDirectUrl('/images/commune/la-joconde.jpg');
    expect(result).toBe('/images/commune/la-joconde.jpg');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("résout vers l'URL directe upload.wikimedia.org via l'API MediaWiki", async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: () => Promise.resolve({
        query: { pages: { '123': { imageinfo: [{ url: DIRECT_URL }] } } }
      })
    });

    const result = await resolveWikimediaDirectUrl(SPECIAL_FILE_PATH);
    expect(result).toBe(DIRECT_URL);
  });

  it("retombe sur l'URL d'origine si l'API échoue", async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('network error'));
    const result = await resolveWikimediaDirectUrl(SPECIAL_FILE_PATH + '?cachebust=1');
    expect(result).toBe(SPECIAL_FILE_PATH + '?cachebust=1');
  });
});
