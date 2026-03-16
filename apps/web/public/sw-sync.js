const DB_NAME = 'AmautaOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'syncPendiente';
const SYNC_TAG = 'amauta-sync';
const MAX_INTENTOS = 5;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore(mode, fn) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const result = fn(store, tx);
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
      })
  );
}

function getAllItems() {
  return withStore(
    'readonly',
    (store) =>
      new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      })
  );
}

function deleteItems(ids) {
  if (!ids.length) return Promise.resolve();
  return withStore('readwrite', (store) => {
    ids.forEach((id) => store.delete(id));
  });
}

function updateItem(id, data) {
  return withStore('readwrite', (store) => {
    store.put({ ...data, id });
  });
}

function parsePayload(item) {
  try {
    const payload = JSON.parse(item.payload);
    return { ...payload, tipo: item.tipo };
  } catch {
    return null;
  }
}

function getSyncKey(payload) {
  if (payload.tipo === 'completar-leccion') {
    return `leccion:${payload.leccionId}`;
  }
  return `curso:${payload.cursoId}`;
}

function normalizeTimestamp(value) {
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function elegirGanador(actual, actualPayload, nuevo, nuevoPayload) {
  if (actualPayload.tipo === 'completar-leccion') {
    if (actualPayload.completada !== nuevoPayload.completada) {
      return nuevoPayload.completada ? nuevo : actual;
    }
  }

  return normalizeTimestamp(actual.timestamp) >
    normalizeTimestamp(nuevo.timestamp)
    ? actual
    : nuevo;
}

function consolidarPendientes(pendientes) {
  const resultado = new Map();
  const descartados = [];

  pendientes.forEach((item) => {
    if (!item.id) return;
    const payload = parsePayload(item);
    if (!payload) {
      descartados.push(item.id);
      return;
    }

    const key = getSyncKey(payload);
    const existente = resultado.get(key);

    if (!existente) {
      resultado.set(key, item);
      return;
    }

    const existentePayload = parsePayload(existente);
    if (!existentePayload) {
      descartados.push(existente.id);
      resultado.set(key, item);
      return;
    }

    const ganador = elegirGanador(existente, existentePayload, item, payload);
    if (ganador.id === existente.id) {
      descartados.push(item.id);
    } else {
      descartados.push(existente.id);
      resultado.set(key, item);
    }
  });

  const ordenados = Array.from(resultado.values()).sort((a, b) => {
    return normalizeTimestamp(a.timestamp) - normalizeTimestamp(b.timestamp);
  });

  return { ordenados, descartados };
}

async function ejecutarSync(item, payload) {
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

async function procesarColaSync() {
  const pendientes = await getAllItems();
  if (!pendientes.length) return;

  const { ordenados, descartados } = consolidarPendientes(pendientes);
  await deleteItems(descartados);

  for (const item of ordenados) {
    if (!item.id) continue;
    const payload = parsePayload(item);
    if (!payload) {
      await deleteItems([item.id]);
      continue;
    }

    try {
      await ejecutarSync(item, payload);
      await deleteItems([item.id]);
    } catch {
      const intentos = (item.intentos || 0) + 1;
      if (intentos >= MAX_INTENTOS) {
        await deleteItems([item.id]);
      } else {
        await updateItem(item.id, { ...item, intentos });
      }
    }
  }
}

self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(procesarColaSync());
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === SYNC_TAG) {
    event.waitUntil(procesarColaSync());
  }
});
