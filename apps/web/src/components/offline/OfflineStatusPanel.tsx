'use client';

import { SyncStatusBadge } from './SyncStatusBadge';
import { OfflineStorageIndicator } from './OfflineStorageIndicator';

export function OfflineStatusPanel() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Estado de sincronizacion
        </span>
        <SyncStatusBadge />
      </div>
      <OfflineStorageIndicator />
    </div>
  );
}
