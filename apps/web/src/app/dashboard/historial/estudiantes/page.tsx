'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthorization } from '@/hooks/useAuthorization';
import { EstudiantesHistorialList } from '@/components/historial/EstudiantesHistorialList';

export default function EstudiantesHistorialPage() {
  const { isLoading, isAuthenticated, isAdminEscuela } = useAuthorization();
  const router = useRouter();
  const [institucionId, setInstitucionId] = useState<string | null>(null);
  const [loadingInstitution, setLoadingInstitution] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdminEscuela)) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isAdminEscuela, isLoading, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !isAdminEscuela) return;
    let active = true;
    fetch('/api/mi-institucion')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || 'No se pudo obtener la institución');
        if (active) setInstitucionId(data.institucionId);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : 'No se pudo obtener la institución'
          );
      })
      .finally(() => {
        if (active) setLoadingInstitution(false);
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, isAdminEscuela, isLoading]);

  if (isLoading || loadingInstitution) {
    return (
      <p className="py-12 text-center text-[var(--muted)]">
        Cargando historial de estudiantes...
      </p>
    );
  }
  if (!isAuthenticated || !isAdminEscuela) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Historial de estudiantes
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Consultá el historial académico de los estudiantes de tu institución.
        </p>
      </div>
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : institucionId ? (
        <EstudiantesHistorialList institucionId={institucionId} />
      ) : null}
    </div>
  );
}
