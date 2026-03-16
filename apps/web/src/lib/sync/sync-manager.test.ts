import 'fake-indexeddb/auto';

import { db } from '@/lib/db/offline-db';
import { encolarSync, procesarColaSync } from './sync-manager';

const mockFetch = jest.fn();

global.fetch = mockFetch;

if (
  typeof (globalThis as { structuredClone?: unknown }).structuredClone !==
  'function'
) {
  (
    globalThis as { structuredClone: (value: unknown) => unknown }
  ).structuredClone = (value) => JSON.parse(JSON.stringify(value));
}

describe('sync-manager', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await db.delete();
    await db.open();
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      configurable: true,
    });
  });

  afterEach(async () => {
    db.close();
  });

  it('debería encolar y registrar Background Sync cuando está disponible', async () => {
    const registerMock = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { ready: Promise.resolve({ sync: { register: registerMock } }) },
      configurable: true,
    });
    (
      global as unknown as {
        ServiceWorkerRegistration: { prototype: { sync: unknown } };
      }
    ).ServiceWorkerRegistration = {
      prototype: { sync: {} },
    };

    await encolarSync('inscribir', { cursoId: 'curso-1' });

    const pendientes = await db.syncPendiente.toArray();
    expect(pendientes).toHaveLength(1);
    expect(registerMock).toHaveBeenCalledWith('amauta-sync');
  });

  it('debería sincronizar inmediatamente si no hay Background Sync y hay conexión', async () => {
    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
      configurable: true,
    });
    (
      global as unknown as {
        ServiceWorkerRegistration?: { prototype: { sync?: unknown } };
      }
    ).ServiceWorkerRegistration = {
      prototype: {},
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await encolarSync('inscribir', { cursoId: 'curso-1' });

    const pendientes = await db.syncPendiente.toArray();
    expect(pendientes).toHaveLength(0);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/cursos/curso-1/inscribir',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('debería aplicar last-write-wins en acciones de inscripción', async () => {
    await db.syncPendiente.add({
      tipo: 'inscribir',
      payload: JSON.stringify({
        cursoId: 'curso-1',
        timestamp: '2026-03-15T10:00:00.000Z',
      }),
      timestamp: new Date('2026-03-15T10:00:00.000Z'),
      intentos: 0,
    });
    await db.syncPendiente.add({
      tipo: 'cancelar-inscripcion',
      payload: JSON.stringify({
        cursoId: 'curso-1',
        timestamp: '2026-03-15T11:00:00.000Z',
      }),
      timestamp: new Date('2026-03-15T11:00:00.000Z'),
      intentos: 0,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => ({}),
    });

    await procesarColaSync();

    const pendientes = await db.syncPendiente.toArray();
    expect(pendientes).toHaveLength(0);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/cursos/curso-1/inscribir',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('debería eliminar la acción cuando supera el límite de reintentos', async () => {
    await db.syncPendiente.add({
      tipo: 'inscribir',
      payload: JSON.stringify({ cursoId: 'curso-1' }),
      timestamp: new Date('2026-03-15T12:00:00.000Z'),
      intentos: 4,
    });

    mockFetch.mockRejectedValueOnce(new Error('Network'));

    await procesarColaSync();

    const pendientes = await db.syncPendiente.toArray();
    expect(pendientes).toHaveLength(0);
  });
});
