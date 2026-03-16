const VIDEO_CACHE_NAME = 'amauta-video-cache-v1';
const VIDEO_CACHE_PREFIX = '/offline/videos/';

function buildCacheKey(leccionId: string) {
  return `${VIDEO_CACHE_PREFIX}${leccionId}`;
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
