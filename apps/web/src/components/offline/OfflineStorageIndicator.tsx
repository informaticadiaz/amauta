'use client';

import { useOfflineStorageStats } from '@/hooks/useOfflineStorageStats';

function formatBytes(bytes: number): string {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const decimals = value >= 10 || unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(decimals)} ${units[unitIndex]}`;
}

export function OfflineStorageIndicator() {
  const { totalBytes, totalCursos, loading } = useOfflineStorageStats();

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        Espacio usado por descargas
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-lg font-semibold text-[var(--foreground)]">
          {loading ? '...' : formatBytes(totalBytes)}
        </span>
        <span className="text-xs text-[var(--muted)]">
          {loading ? '' : `${totalCursos} cursos`}
        </span>
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">
        Estimado segun contenido descargado.
      </p>
    </div>
  );
}
