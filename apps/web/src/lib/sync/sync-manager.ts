import {
  db,
  type ProgresoOffline,
  type SyncPendiente,
} from '@/lib/db/offline-db';
import { resolveProgresoLocal } from './conflict-resolution';

const SYNC_TAG = 'amauta-sync';
const MAX_INTENTOS = 5;

type SyncPayloadBase = {
  timestamp?: string;
};

type SyncPayload =
  | (SyncPayloadBase & {
      tipo: 'completar-leccion';
      leccionId: string;
      cursoId: string;
      completada: boolean;
    })
  | (SyncPayloadBase & {
      tipo: 'inscribir';
      cursoId: string;
    })
  | (SyncPayloadBase & {
      tipo: 'cancelar-inscripcion';
      cursoId: string;
    });

function supportsBackgroundSync() {
  if (typeof window === 'undefined') return false;
  if (!('serviceWorker' in navigator)) return false;
  if (typeof ServiceWorkerRegistration === 'undefined') return false;
  return 'sync' in ServiceWorkerRegistration.prototype;
}

async function registrarBackgroundSync(): Promise<void> {
  if (!supportsBackgroundSync()) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration?.sync?.register) {
      await registration.sync.register(SYNC_TAG);
    }
  } catch {
    // No bloquear la app si falla el registro
  }
}

export async function guardarProgresoOffline(
  progreso: Omit<ProgresoOffline, 'sincronizado'> & { sincronizado: 0 | 1 }
) {
  const existing = await db.progreso.get(progreso.leccionId);
  const resolved = resolveProgresoLocal(existing ?? null, progreso);
  await db.progreso.put(resolved);
}

export async function marcarProgresoSincronizado(
  leccionId: string
): Promise<void> {
  await db.progreso.update(leccionId, { sincronizado: 1 });
}

export async function encolarSync(
  tipo: SyncPayload['tipo'],
  payload: Omit<SyncPayload, 'tipo'>
): Promise<void> {
  const now = new Date();
  const payloadConTimestamp = {
    ...payload,
    timestamp: payload.timestamp ?? now.toISOString(),
  };

  await db.syncPendiente.add({
    tipo,
    payload: JSON.stringify(payloadConTimestamp),
    timestamp: now,
    intentos: 0,
  });

  await registrarBackgroundSync();

  if (!supportsBackgroundSync() && navigator.onLine) {
    await procesarColaSync();
  }
}

function parsePayload(item: SyncPendiente): SyncPayload | null {
  try {
    const data = JSON.parse(item.payload) as Omit<SyncPayload, 'tipo'>;
    return { ...data, tipo: item.tipo } as SyncPayload;
  } catch {
    return null;
  }
}

function getSyncKey(payload: SyncPayload): string {
  if (payload.tipo === 'completar-leccion') {
    return `leccion:${payload.leccionId}`;
  }
  return `curso:${payload.cursoId}`;
}

function elegirGanador(
  actual: SyncPendiente,
  actualPayload: SyncPayload,
  nuevo: SyncPendiente,
  nuevoPayload: SyncPayload
) {
  if (actualPayload.tipo === 'completar-leccion') {
    if (actualPayload.completada !== nuevoPayload.completada) {
      return nuevoPayload.completada ? nuevo : actual;
    }
  }

  return actual.timestamp > nuevo.timestamp ? actual : nuevo;
}

function consolidarPendientes(pendientes: SyncPendiente[]) {
  const resultado = new Map<string, SyncPendiente>();
  const descartados: number[] = [];

  for (const item of pendientes) {
    if (!item.id) continue;
    const payload = parsePayload(item);
    if (!payload) {
      descartados.push(item.id);
      continue;
    }

    const key = getSyncKey(payload);
    const existente = resultado.get(key);

    if (!existente) {
      resultado.set(key, item);
      continue;
    }

    const existentePayload = parsePayload(existente);
    if (!existentePayload) {
      descartados.push(existente.id!);
      resultado.set(key, item);
      continue;
    }

    const ganador = elegirGanador(existente, existentePayload, item, payload);

    if (ganador.id === existente.id) {
      descartados.push(item.id);
    } else {
      descartados.push(existente.id!);
      resultado.set(key, item);
    }
  }

  const ordenados = Array.from(resultado.values()).sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  return { ordenados, descartados };
}

async function ejecutarSync(item: SyncPendiente, payload: SyncPayload) {
  if (payload.tipo === 'completar-leccion') {
    const response = await fetch(
      `/api/lecciones/${payload.leccionId}/completar`,
      {
        method: 'POST',
        credentials: 'include',
      }
    );
    if (!response.ok) {
      throw new Error('Error al completar lección');
    }
    await marcarProgresoSincronizado(payload.leccionId);
    return;
  }

  const endpoint = `/api/cursos/${payload.cursoId}/inscribir`;
  const method = payload.tipo === 'inscribir' ? 'POST' : 'DELETE';
  const response = await fetch(endpoint, {
    method,
    credentials: 'include',
  });

  if (!response.ok && response.status !== 204) {
    throw new Error('Error al sincronizar inscripción');
  }
}

export async function procesarColaSync(): Promise<void> {
  const pendientes = await db.syncPendiente.orderBy('timestamp').toArray();

  if (!pendientes.length) return;

  const { ordenados, descartados } = consolidarPendientes(pendientes);

  if (descartados.length) {
    await db.syncPendiente.bulkDelete(descartados);
  }

  for (const item of ordenados) {
    if (!item.id) continue;
    const payload = parsePayload(item);
    if (!payload) {
      await db.syncPendiente.delete(item.id);
      continue;
    }

    try {
      await ejecutarSync(item, payload);
      await db.syncPendiente.delete(item.id);
    } catch {
      const intentos = item.intentos + 1;
      if (intentos >= MAX_INTENTOS) {
        await db.syncPendiente.delete(item.id);
      } else {
        await db.syncPendiente.update(item.id, { intentos });
      }
    }
  }
}

export function initSyncManager(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', () => {
    void procesarColaSync();
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === SYNC_TAG) {
        void procesarColaSync();
      }
    });
  }

  if (navigator.onLine) {
    void procesarColaSync();
  }
}
