'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthorization } from '@/hooks/useAuthorization';
import {
  HistorialAcademico,
  type HistorialData,
} from '@/components/historial/HistorialAcademico';

export default function HistorialPage() {
  const { isEstudiante, isLoading, isAuthenticated } = useAuthorization();
  const router = useRouter();
  const [historial, setHistorial] = useState<HistorialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isEstudiante) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, isEstudiante, router]);

  useEffect(() => {
    if (!isLoading && isEstudiante) {
      fetch('/api/me/historial')
        .then((response) => {
          if (!response.ok) throw new Error('Error al cargar el historial');
          return response.json();
        })
        .then((data: HistorialData) => setHistorial(data))
        .catch(() => setError('No se pudo cargar tu historial académico.'))
        .finally(() => setLoading(false));
    }
  }, [isLoading, isEstudiante]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[var(--muted)]">Cargando historial académico...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isEstudiante) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Historial académico
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Consultá tus calificaciones, promedios y evolución por materia.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : historial ? (
        <HistorialAcademico data={historial} />
      ) : null}
    </div>
  );
}
