'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 border-b border-amber-200 bg-amber-500/95 px-4 py-2 text-center text-xs font-semibold text-white shadow-sm"
      role="status"
      aria-live="polite"
    >
      Sin conexion — usando contenido descargado
    </div>
  );
}
