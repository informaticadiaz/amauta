'use client';

import { useState, useEffect } from 'react';
import { useAuthorization } from '@/hooks/useAuthorization';
import { useRouter } from 'next/navigation';

interface AsistenciaItem {
  fecha: string;
  estado: 'PRESENTE' | 'AUSENTE' | 'TARDANZA' | 'JUSTIFICADO';
  observaciones: string | null;
  grupo: { nombre: string };
}

interface Resumen {
  total: number;
  presente: number;
  ausente: number;
  tardanza: number;
  justificado: number;
  porcentaje: number;
}

interface MisAsistenciasResponse {
  asistencias: AsistenciaItem[];
  resumen: Resumen;
}

const ESTADO_LABEL: Record<string, string> = {
  PRESENTE: 'Presente',
  AUSENTE: 'Ausente',
  TARDANZA: 'Tardanza',
  JUSTIFICADO: 'Justificado',
};

const ESTADO_COLOR: Record<string, string> = {
  PRESENTE: 'bg-green-100 text-green-700',
  AUSENTE: 'bg-red-100 text-red-700',
  TARDANZA: 'bg-yellow-100 text-yellow-700',
  JUSTIFICADO: 'bg-blue-100 text-blue-700',
};

export default function MiAsistenciaPage() {
  const { isEstudiante, isLoading, isAuthenticated } = useAuthorization();
  const router = useRouter();
  const [data, setData] = useState<MisAsistenciasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const [mes, setMes] = useState(String(now.getMonth() + 1));
  const [anio, setAnio] = useState(String(now.getFullYear()));

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isEstudiante) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, isEstudiante, router]);

  useEffect(() => {
    if (!isLoading && isEstudiante) {
      setLoading(true);
      fetch(`/api/me/asistencias?mes=${mes}&anio=${anio}`)
        .then((res) => res.json())
        .then((d: MisAsistenciasResponse) => setData(d))
        .catch(() => setError('No se pudo cargar tu asistencia.'))
        .finally(() => setLoading(false));
    }
  }, [isLoading, isEstudiante, mes, anio]);

  const MESES = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Mi asistencia
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Tu historial de asistencias mes a mes.
        </p>
      </div>

      <div className="flex gap-3">
        <select
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
        >
          {MESES.map((nombre, i) => (
            <option key={i + 1} value={String(i + 1)}>
              {nombre}
            </option>
          ))}
        </select>
        <select
          value={anio}
          onChange={(e) => setAnio(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && data && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: 'Presentes',
                value: data.resumen.presente,
                color: 'text-green-600',
              },
              {
                label: 'Ausentes',
                value: data.resumen.ausente,
                color: 'text-red-600',
              },
              {
                label: 'Tardanzas',
                value: data.resumen.tardanza,
                color: 'text-yellow-600',
              },
              {
                label: 'Justificados',
                value: data.resumen.justificado,
                color: 'text-blue-600',
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-lg border border-[var(--border)] p-4 text-center"
              >
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-[var(--border)] p-4">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-[var(--muted)]">
                Porcentaje de asistencia
              </span>
              <span className="font-semibold text-[var(--foreground)]">
                {data.resumen.porcentaje}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-3 rounded-full bg-green-500 transition-all"
                style={{ width: `${data.resumen.porcentaje}%` }}
              />
            </div>
          </div>

          {data.asistencias.length === 0 ? (
            <div className="rounded-lg border border-[var(--border)] p-8 text-center">
              <p className="text-[var(--muted)]">
                No hay registros de asistencia para este mes.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-[var(--border)]">
              <table className="w-full text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--border)]/20">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted)]">
                      Fecha
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted)]">
                      Grupo
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted)]">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.asistencias.map((a, i) => (
                    <tr
                      key={i}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="px-4 py-3 text-[var(--foreground)]">
                        {new Date(a.fecha).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)]">
                        {a.grupo.nombre}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_COLOR[a.estado]}`}
                        >
                          {ESTADO_LABEL[a.estado]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <p className="text-[var(--muted)]">Cargando...</p>
        </div>
      )}
    </div>
  );
}
