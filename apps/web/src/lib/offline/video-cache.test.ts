/**
 * Tests para utilidades de cache de video offline.
 */

import {
  cacheVideo,
  deleteVideoCache,
  getVideoOfflineUrl,
} from './video-cache';

describe('video-cache', () => {
  const cacheMock = {
    put: jest.fn(),
    match: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global as typeof globalThis).caches = {
      open: jest.fn().mockResolvedValue(cacheMock),
    } as CacheStorage;
    global.fetch = jest.fn();
  });

  it('debería cachear el video y devolver la key', async () => {
    const response = {
      ok: true,
      clone: () => response,
    } as unknown as Response;

    (global.fetch as jest.Mock).mockResolvedValue(response);

    const cacheKey = await cacheVideo('leccion-1', 'https://videos.test/1.mp4');

    expect((global as typeof globalThis).caches.open).toHaveBeenCalledWith(
      'amauta-video-cache-v1'
    );
    expect(cacheMock.put).toHaveBeenCalledWith(
      '/offline/videos/leccion-1',
      response
    );
    expect(cacheKey).toBe('/offline/videos/leccion-1');
  });

  it('debería devolver null cuando no hay video cacheado', async () => {
    cacheMock.match.mockResolvedValue(undefined);

    const url = await getVideoOfflineUrl('/offline/videos/leccion-1');

    expect(url).toBeNull();
  });

  it('debería crear un object URL cuando hay video cacheado', async () => {
    const response = {
      blob: jest.fn().mockResolvedValue(new Blob(['video'])),
    } as unknown as Response;

    const createObjectURL = jest.fn().mockReturnValue('blob:video');
    (global as typeof globalThis).URL.createObjectURL = createObjectURL;

    cacheMock.match.mockResolvedValue(response);

    const url = await getVideoOfflineUrl('/offline/videos/leccion-1');

    expect(response.blob).toHaveBeenCalled();
    expect(createObjectURL).toHaveBeenCalled();
    expect(url).toBe('blob:video');
  });

  it('debería eliminar el video cacheado', async () => {
    cacheMock.delete.mockResolvedValue(true);

    const result = await deleteVideoCache('/offline/videos/leccion-1');

    expect(cacheMock.delete).toHaveBeenCalledWith('/offline/videos/leccion-1');
    expect(result).toBe(true);
  });
});
