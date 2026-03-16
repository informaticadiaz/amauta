'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db/offline-db';

interface SyncStatus {
  pendingCount: number;
  loading: boolean;
}

const REFRESH_MS = 5000;

export function useSyncStatus(): SyncStatus {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function load() {
      try {
        const pendientes = await db.syncPendiente.toArray();
        if (!active) return;
        setPendingCount(pendientes.length);
      } catch {
        if (!active) return;
        setPendingCount(0);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    intervalId = setInterval(load, REFRESH_MS);

    return () => {
      active = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return { pendingCount, loading };
}
