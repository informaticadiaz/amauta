'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSyncStatus } from '@/hooks/useSyncStatus';

export function SyncStatusBadge() {
  const { isOnline } = useNetworkStatus();
  const { pendingCount, loading } = useSyncStatus();

  if (loading) {
    return (
      <span className="text-xs font-semibold text-[var(--muted)]">
        Verificando sincronizacion...
      </span>
    );
  }

  if (!isOnline) {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
        Sin conexion
      </span>
    );
  }

  if (pendingCount > 0) {
    return (
      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
        Sincronizacion pendiente ({pendingCount})
      </span>
    );
  }

  return (
    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
      Sincronizado
    </span>
  );
}
