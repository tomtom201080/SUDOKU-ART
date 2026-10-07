// src/lib/sharedMedia.test.js
// Couvre la détection de provider vidéo (YouTube/Vimeo/direct), le point le
// plus sensible aux régressions silencieuses (un format d'URL raté = lien
// refusé à tort, ou pire, mal classé).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./supabaseClient', () => ({ supabase: { rpc: vi.fn(), from: vi.fn(), storage: { from: vi.fn() }, auth: { getSession: vi.fn() } } }));
vi.mock('./deviceToken', () => ({ getOrCreateDeviceToken: () => 'device-token-123' }));

import { supabase } from './supabaseClient';
import {
  detectVideoProvider, extractYoutubeId, extractVimeoId,
  youtubeThumbnailUrl, youtubeEmbedUrl, vimeoEmbedUrl,
  createSharedMedia, fetchVimeoOEmbed
} from './sharedMedia';

describe('extractYoutubeId', () => {
  it('reconnaît watch?v=', () => {
    expect(extractYoutubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });
  it('reconnaît youtu.be', () => {
    expect(extractYoutubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });
  it('reconnaît /shorts/', () => {
    expect(extractYoutubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });
  it('renvoie null pour un lien non YouTube', () => {
    expect(extractYoutubeId('https://vimeo.com/123456')).toBeNull();
  });
});

describe('extractVimeoId', () => {
  it('reconnaît vimeo.com/<id>', () => {
    expect(extractVimeoId('https://vimeo.com/123456789')).toBe('123456789');
  });
  it('reconnaît player.vimeo.com/video/<id>', () => {
    expect(extractVimeoId('https://player.vimeo.com/video/123456789')).toBe('123456789');
  });
});

describe('detectVideoProvider', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube'],
    ['https://youtu.be/dQw4w9WgXcQ', 'youtube'],
    ['https://vimeo.com/123456789', 'vimeo'],
    ['https://example.com/clip.mp4', 'direct'],
    ['https://example.com/clip.webm?x=1', 'direct']
  ])('%s → %s', (url, expected) => {
    expect(detectVideoProvider(url)).toBe(expected);
  });

  it('renvoie null pour un lien invalide ou non supporté', () => {
    expect(detectVideoProvider('not a url')).toBeNull();
    expect(detectVideoProvider('https://example.com/page.html')).toBeNull();
    expect(detectVideoProvider('')).toBeNull();
  });
});

describe('youtubeThumbnailUrl / youtubeEmbedUrl / vimeoEmbedUrl', () => {
  it('construit les bonnes URLs', () => {
    expect(youtubeThumbnailUrl('abc')).toBe('https://img.youtube.com/vi/abc/hqdefault.jpg');
    expect(youtubeEmbedUrl('abc')).toContain('youtube-nocookie.com/embed/abc');
    expect(vimeoEmbedUrl('123')).toContain('player.vimeo.com/video/123');
  });
});

describe('createSharedMedia', () => {
  it('envoie les champs attendus à la RPC, avec le jeton d\'appareil', async () => {
    supabase.rpc.mockResolvedValue({ data: { id: 'm1' }, error: null });
    const result = await createSharedMedia({
      type: 'video', source: 'link', videoUrl: 'https://youtu.be/x', provider: 'youtube', posterPath: 'p/x.jpg'
    });
    expect(supabase.rpc).toHaveBeenCalledWith('create_shared_media', {
      p_type: 'video',
      p_source: 'link',
      p_video_url: 'https://youtu.be/x',
      p_video_path: null,
      p_provider: 'youtube',
      p_poster_path: 'p/x.jpg',
      p_duration_seconds: null,
      p_ratio: null,
      p_device_token: 'device-token-123'
    });
    expect(result).toEqual({ id: 'm1' });
  });
});

describe('fetchVimeoOEmbed', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retourne le JSON oEmbed en cas de succès', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ thumbnail_url: 'https://i.vimeocdn.com/x.jpg', duration: 42 }) });
    const data = await fetchVimeoOEmbed('https://vimeo.com/123');
    expect(data.thumbnail_url).toBe('https://i.vimeocdn.com/x.jpg');
  });

  it('lève une erreur claire si la vidéo est introuvable/privée', async () => {
    fetch.mockResolvedValue({ ok: false });
    await expect(fetchVimeoOEmbed('https://vimeo.com/999')).rejects.toThrow('introuvable');
  });
});
