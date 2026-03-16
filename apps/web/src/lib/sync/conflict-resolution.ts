import type { ProgresoOffline } from '@/lib/db/offline-db';

export function resolveProgresoLocal(
  local: ProgresoOffline | null,
  incoming: ProgresoOffline
): ProgresoOffline {
  if (!local) {
    return incoming;
  }

  if (local.completada || incoming.completada) {
    return {
      ...incoming,
      completada: true,
      timestamp:
        local.timestamp > incoming.timestamp
          ? local.timestamp
          : incoming.timestamp,
      sincronizado: local.sincronizado && incoming.sincronizado ? 1 : 0,
    };
  }

  return local.timestamp > incoming.timestamp ? local : incoming;
}
