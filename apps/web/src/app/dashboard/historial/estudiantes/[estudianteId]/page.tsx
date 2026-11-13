'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthorization } from '@/hooks/useAuthorization';
import {
  HistorialAcademico,
  type HistorialData,
} from '@/components/historial/HistorialAcademico';

export default function EstudianteHistorialPage() {
  const { isLoading, isAuthenticated, isAdminEscuela } = useAuthorization();
  const router = useRouter();
  const params = useParams<{ estudianteId: string }>();
  const estudianteId = params.estudianteId;
  const [historial, setHistorial] = useState<HistorialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdminEscuela)) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isAdminEscuela, isLoading, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !isAdminEscuela) return;
    let active = true;
    async function loadHistory() {
      try {
        const institutionResponse = await fetch('/api/mi-institucion');
        const institution = await institutionResponse.json();
        if (!institutionResponse.ok)
          throw new Error(
            institution.message || 'No se pudo obtener la institución'
          );
        const response = await fetch(
          `/api/instituciones/${institution.institucionId}/estudiantes/${estudianteId}/historial`
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(
            data.message || 'No se pudo cargar el historial académico'
          );
        if (active) setHistorial(data as HistorialData);
      } catch (reason: unknown) {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : 'No se pudo cargar el historial académico'
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    loadHistory();
    return () => {
      active = false;
    };
  }, [estudianteId, isAuthenticated, isAdminEscuela, isLoading]);

  if (isLoading || loading) {
    return (
      <p className="py-12 text-center text-[var(--muted)]">
        Cargando historial académico...
      </p>
    );
  }
  if (!isAuthenticated || !isAdminEscuela) return null;

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => router.push('/dashboard/historial/estudiantes')}
          className="text-sm text-primary hover:underline"
        >
          ← Volver a estudiantes
        </button>
        <h1 className="mt-3 text-2xl font-bold text-[var(--foreground)]">
          Historial académico del estudiante
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Vista administrativa de solo lectura.
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
