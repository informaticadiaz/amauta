'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db/offline-db';

interface OfflineStorageStats {
  totalBytes: number;
  totalCursos: number;
  loading: boolean;
}

const REFRESH_MS = 5000;

export function useOfflineStorageStats(): OfflineStorageStats {
  const [totalBytes, setTotalBytes] = useState(0);
  const [totalCursos, setTotalCursos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function load() {
      try {
        const cursos = await db.cursos.toArray();
        if (!active) return;
        const bytes = cursos.reduce((acc, curso) => acc + curso.tamanoBytes, 0);
        setTotalBytes(bytes);
        setTotalCursos(cursos.length);
      } catch {
        if (!active) return;
        setTotalBytes(0);
        setTotalCursos(0);
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

  return { totalBytes, totalCursos, loading };
}
