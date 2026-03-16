'use client';

import { useEffect } from 'react';
import { initSyncManager } from '@/lib/sync/sync-manager';

export function SyncManagerClient() {
  useEffect(() => {
    initSyncManager();
  }, []);

  return null;
}
