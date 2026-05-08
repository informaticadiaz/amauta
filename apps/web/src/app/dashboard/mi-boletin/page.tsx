'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthorization } from '@/hooks/useAuthorization';
import { useRouter } from 'next/navigation';

interface GrupoItem {
  id: string;
  nombre: string;
  grado: string | null;
  seccion: string | null;
  institucion: { id: string; nombre: string };
  periodoAcademico: { id: string; nombre: string } | null;
}

interface PeriodoItem {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
}

interface CalificacionItem {
  materia: string;
  nota: number;
  observaciones: string | null;
}

interface AsistenciaResumen {
  total: number;
  presente: number;
  ausente: number;
  tardanza: number;
  justificado: number;
  porcentaje: number;
}

interface EscalaItem {
  notaMinima: number;
  notaMaxima: number;
  notaAprobacion: number;
}

interface BoletinData {
  estudiante: { nombre: string; apellido: string };
  institucion: { id: string; nombre: string };
  periodo: { nombre: string; fechaInicio: string; fechaFin: string };
  grupo: { nombre: string };
  calificaciones: CalificacionItem[];
  asistencia: AsistenciaResumen;
  escala: EscalaItem | null;
  generadoEn: string;
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function promedio(calificaciones: CalificacionItem[]) {
  if (calificaciones.length === 0) return null;
  const sum = calificaciones.reduce((acc, c) => acc + c.nota, 0);
  return (sum / calificaciones.length).toFixed(1);
}

export default function MiBoletinPage() {
  const { isEstudiante, isLoading, isAuthenticated } = useAuthorization();
  const router = useRouter();

  const [grupos, setGrupos] = useState<GrupoItem[]>([]);
  const [periodos, setPeriodos] = useState<PeriodoItem[]>([]);
  const [grupoId, setGrupoId] = useState('');
  const [periodoId, setPeriodoId] = useState('');
  const [boletin, setBoletin] = useState<BoletinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingBoletin, setLoadingBoletin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isEstudiante) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, isEstudiante, router]);

  useEffect(() => {
    if (!isLoading && isEstudiante) {
      fetch('/api/me/grupos')
        .then((res) => res.json())
        .then((data: { grupos: GrupoItem[] }) => {
          setGrupos(data.grupos ?? []);
          if (data.grupos && data.grupos.length > 0) {
            setGrupoId(data.grupos[0]?.id ?? '');
          }
        })
        .catch(() => setError('No se pudieron cargar tus grupos.'))
        .finally(() => setLoading(false));
    }
  }, [isLoading, isEstudiante]);

  useEffect(() => {
    if (!grupoId) return;
    const grupo = grupos.find((g) => g.id === grupoId);
    if (!grupo) return;

    setPeriodos([]);
    setPeriodoId('');
    setBoletin(null);

    fetch(`/api/instituciones/${grupo.institucion.id}/periodos`)
      .then((res) => res.json())
      .then((data: { periodos: PeriodoItem[] }) => {
        setPeriodos(data.periodos ?? []);
        if (data.periodos && data.periodos.length > 0) {
          setPeriodoId(data.periodos[0]?.id ?? '');
        }
      })
      .catch(() => setError('No se pudieron cargar los períodos.'));
  }, [grupoId, grupos]);

  const fetchBoletin = useCallback(() => {
    if (!periodoId || !grupoId) return;
    setLoadingBoletin(true);
    setError(null);
    setBoletin(null);

    fetch(`/api/me/boletin?periodoId=${periodoId}&grupoId=${grupoId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar el boletín');
        return res.json();
      })
      .then((data: BoletinData) => setBoletin(data))
      .catch(() => setError('No se pudo cargar el boletín.'))
      .finally(() => setLoadingBoletin(false));
  }, [periodoId, grupoId]);

  useEffect(() => {
    if (periodoId && grupoId) {
      fetchBoletin();
    }
  }, [periodoId, grupoId, fetchBoletin]);

  if (isLoading) return null;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #boletin-imprimible, #boletin-imprimible * { visibility: visible; }
          #boletin-imprimible { position: absolute; inset: 0; padding: 2rem; }
          .no-print { display: none !important; }
          .boletin-card { box-shadow: none !important; border: 1px solid #ccc !important; }
        }
      `}</style>

      <div className="space-y-6">
        <div className="no-print">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Mi boletín académico
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Seleccioná un grupo y período para ver tu boletín y guardarlo como
            PDF.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-[var(--muted)]">Cargando grupos...</p>
          </div>
        ) : grupos.length === 0 ? (
          <div className="rounded-lg border border-[var(--border)] p-8 text-center no-print">
            <p className="text-[var(--muted)]">
              No estás inscripto en ningún grupo actualmente.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 no-print">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--muted)]">
                  Grupo
                </label>
                <select
                  value={grupoId}
                  onChange={(e) => setGrupoId(e.target.value)}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                >
                  {grupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {periodos.length > 0 && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--muted)]">
                    Período
                  </label>
                  <select
                    value={periodoId}
                    onChange={(e) => setPeriodoId(e.target.value)}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                  >
                    {periodos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {boletin && (
                <div className="flex items-end">
                  <button
                    onClick={() => window.print()}
                    className="rounded-lg bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-80"
                  >
                    Imprimir / Guardar como PDF
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 no-print">
                {error}
              </div>
            )}

            {loadingBoletin && (
              <div className="flex justify-center py-8 no-print">
                <p className="text-[var(--muted)]">Cargando boletín...</p>
              </div>
            )}

            {boletin && (
              <div
                id="boletin-imprimible"
                className="boletin-card rounded-xl border border-[var(--border)] bg-[var(--background)] p-8 shadow-sm"
              >
                <div className="mb-6 border-b border-[var(--border)] pb-6 text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                    {boletin.institucion.nombre}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-[var(--foreground)]">
                    Boletín Académico
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {boletin.periodo.nombre} ·{' '}
                    {formatFecha(boletin.periodo.fechaInicio)} –{' '}
                    {formatFecha(boletin.periodo.fechaFin)}
                  </p>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Estudiante
                    </p>
                    <p className="mt-1 font-medium text-[var(--foreground)]">
                      {boletin.estudiante.apellido}, {boletin.estudiante.nombre}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Grupo
                    </p>
                    <p className="mt-1 font-medium text-[var(--foreground)]">
                      {boletin.grupo.nombre}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Calificaciones
                  </h3>
                  {boletin.calificaciones.length === 0 ? (
                    <p className="text-sm text-[var(--muted)]">
                      Sin calificaciones registradas para este período.
                    </p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)]">
                          <th className="py-2 text-left font-medium text-[var(--muted)]">
                            Materia
                          </th>
                          <th className="py-2 text-right font-medium text-[var(--muted)]">
                            Nota{' '}
                            {boletin.escala
                              ? `(0–${boletin.escala.notaMaxima})`
                              : ''}
                          </th>
                          {boletin.escala && (
                            <th className="py-2 text-center font-medium text-[var(--muted)]">
                              Estado
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {boletin.calificaciones.map((c) => (
                          <tr
                            key={c.materia}
                            className="border-b border-[var(--border)] last:border-0"
                          >
                            <td className="py-2 text-[var(--foreground)]">
                              {c.materia}
                            </td>
                            <td className="py-2 text-right font-semibold text-[var(--foreground)]">
                              {c.nota.toFixed(1)}
                            </td>
                            {boletin.escala && (
                              <td className="py-2 text-center">
                                <span
                                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                    c.nota >= boletin.escala.notaAprobacion
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {c.nota >= boletin.escala.notaAprobacion
                                    ? 'Aprobado'
                                    : 'Desaprobado'}
                                </span>
                              </td>
                            )}
                          </tr>
                        ))}
                        {boletin.calificaciones.length > 1 && (
                          <tr className="border-t-2 border-[var(--border)]">
                            <td className="pt-2 font-semibold text-[var(--foreground)]">
                              Promedio
                            </td>
                            <td className="pt-2 text-right font-bold text-[var(--foreground)]">
                              {promedio(boletin.calificaciones)}
                            </td>
                            {boletin.escala && <td />}
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Asistencia
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      {
                        label: 'Presentes',
                        value: boletin.asistencia.presente,
                        color: 'text-green-600',
                      },
                      {
                        label: 'Ausentes',
                        value: boletin.asistencia.ausente,
                        color: 'text-red-600',
                      },
                      {
                        label: 'Tardanzas',
                        value: boletin.asistencia.tardanza,
                        color: 'text-yellow-600',
                      },
                      {
                        label: 'Justificados',
                        value: boletin.asistencia.justificado,
                        color: 'text-blue-600',
                      },
                    ].map(({ label, value, color }) => (
                      <div
                        key={label}
                        className="rounded-lg border border-[var(--border)] p-3 text-center"
                      >
                        <p className={`text-xl font-bold ${color}`}>{value}</p>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-lg border border-[var(--border)] p-3">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-[var(--muted)]">
                        Porcentaje de asistencia
                      </span>
                      <span className="font-semibold text-[var(--foreground)]">
                        {boletin.asistencia.porcentaje}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
                      <div
                        className="h-2.5 rounded-full bg-green-500"
                        style={{ width: `${boletin.asistencia.porcentaje}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-[var(--border)] pt-4 text-center text-xs text-[var(--muted)]">
                  <p>Documento generado el {formatFecha(boletin.generadoEn)}</p>
                  <div className="mt-6 flex justify-between">
                    <div className="w-40 border-t border-[var(--border)] pt-2 text-center text-xs text-[var(--muted)]">
                      Firma docente
                    </div>
                    <div className="w-40 border-t border-[var(--border)] pt-2 text-center text-xs text-[var(--muted)]">
                      Sello institucional
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
