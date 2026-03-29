const VIDEO_CACHE_NAME = 'amauta-video-cache-v1';
const VIDEO_CACHE_PREFIX = '/offline/videos/';

export type VideoProvider = 'youtube' | 'vimeo' | 'local';

function buildCacheKey(leccionId: string) {
  return `${VIDEO_CACHE_PREFIX}${leccionId}`;
}

export function inferVideoProvider(
  videoUrl: string,
  provider?: VideoProvider
): VideoProvider {
  if (provider) {
    return provider;
  }

  if (/youtube\.com|youtu\.be/.test(videoUrl)) {
    return 'youtube';
  }

  if (/vimeo\.com/.test(videoUrl)) {
    return 'vimeo';
  }

  return 'local';
}

export function isVideoCacheableOffline(
  videoUrl: string,
  provider?: VideoProvider
): boolean {
  return inferVideoProvider(videoUrl, provider) === 'local';
}

export async function cacheVideo(
  leccionId: string,
  videoUrl: string
): Promise<string> {
  if (typeof caches === 'undefined') {
    throw new Error('Cache API no disponible en este navegador.');
  }

  const response = await fetch(videoUrl);
  if (!response.ok) {
    throw new Error('No se pudo descargar el video.');
  }

  const cache = await caches.open(VIDEO_CACHE_NAME);
  const cacheKey = buildCacheKey(leccionId);

  await cache.put(cacheKey, response.clone());

  return cacheKey;
}

export async function getVideoOfflineUrl(
  cacheKey: string
): Promise<string | null> {
  if (typeof caches === 'undefined') {
    return null;
  }

  const cache = await caches.open(VIDEO_CACHE_NAME);
  const response = await cache.match(cacheKey);

  if (!response) {
    return null;
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function deleteVideoCache(cacheKey: string): Promise<boolean> {
  if (typeof caches === 'undefined') {
    return false;
  }

  const cache = await caches.open(VIDEO_CACHE_NAME);
  return cache.delete(cacheKey);
}
