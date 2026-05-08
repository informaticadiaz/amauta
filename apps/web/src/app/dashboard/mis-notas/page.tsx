'use client';

import { useState, useEffect } from 'react';
import { useAuthorization } from '@/hooks/useAuthorization';
import { useRouter } from 'next/navigation';

interface Calificacion {
  materia: string;
  nota: number;
  observaciones: string | null;
  updatedAt: string;
  grupo: { nombre: string };
  periodoAcademico: { id: string; nombre: string };
}

interface MisCalificacionesResponse {
  calificaciones: Calificacion[];
}

export default function MisNotasPage() {
  const { isEstudiante, isLoading, isAuthenticated } = useAuthorization();
  const router = useRouter();
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isEstudiante) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, isEstudiante, router]);

  useEffect(() => {
    if (!isLoading && isEstudiante) {
      fetch('/api/me/calificaciones')
        .then((res) => res.json())
        .then((data: MisCalificacionesResponse) => {
          setCalificaciones(data.calificaciones ?? []);
        })
        .catch(() => setError('No se pudieron cargar tus calificaciones.'))
        .finally(() => setLoading(false));
    }
  }, [isLoading, isEstudiante]);

  const porPeriodo = calificaciones.reduce<Record<string, Calificacion[]>>(
    (acc, cal) => {
      const key = cal.periodoAcademico.nombre;
      if (!acc[key]) acc[key] = [];
      acc[key].push(cal);
      return acc;
    },
    {}
  );

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[var(--muted)]">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Mis calificaciones
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Tu historial de notas por periodo y materia.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && calificaciones.length === 0 && (
        <div className="rounded-lg border border-[var(--border)] p-8 text-center">
          <p className="text-[var(--muted)]">
            Todavía no tenés calificaciones registradas.
          </p>
        </div>
      )}

      {Object.entries(porPeriodo).map(([periodo, cals]) => {
        const promedio = cals.reduce((sum, c) => sum + c.nota, 0) / cals.length;
        return (
          <div
            key={periodo}
            className="overflow-hidden rounded-lg border border-[var(--border)]"
          >
            <div className="flex items-center justify-between bg-[var(--background)] px-4 py-3">
              <h2 className="font-semibold text-[var(--foreground)]">
                {periodo}
              </h2>
              <span className="text-sm text-[var(--muted)]">
                Promedio: <strong>{promedio.toFixed(1)}</strong>
              </span>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--border)]/20">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-[var(--muted)]">
                    Materia
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-[var(--muted)]">
                    Grupo
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-[var(--muted)]">
                    Nota
                  </th>
                </tr>
              </thead>
              <tbody>
                {cals.map((cal, i) => (
                  <tr
                    key={`${cal.materia}-${i}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="px-4 py-3 text-[var(--foreground)]">
                      {cal.materia}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">
                      {cal.grupo.nombre}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[var(--foreground)]">
                      {cal.nota.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
