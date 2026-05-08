'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthorization } from '@/hooks/useAuthorization';

interface GrupoItem {
  id: string;
  nombre: string;
  institucionId: string;
}

interface PeriodoItem {
  id: string;
  nombre: string;
  activo: boolean;
}

interface ResumenAsistencia {
  estudiante: { nombre: string; apellido: string };
  presente: number;
  ausente: number;
  tardanza: number;
  justificado: number;
  porcentajeAsistencia: number;
}

interface ReporteAsistenciaData {
  grupo: { nombre: string };
  periodo: { nombre: string } | null;
  totalClases: number;
  resumenPorEstudiante: ResumenAsistencia[];
  promedioGrupo: number;
}

interface ResumenRendimiento {
  estudiante: { nombre: string; apellido: string };
  promedioCalificaciones: number;
  calificaciones: { materia: string; nota: number }[];
}

interface ReporteRendimientoData {
  grupo: { nombre: string };
  periodo: { nombre: string } | null;
  resumenPorEstudiante: ResumenRendimiento[];
  promedioGrupo: number;
}

type Tab = 'asistencia' | 'rendimiento';

export default function ReportesPage() {
  const { isLoading, isAuthenticated, isAdminEscuela, isEducador } =
    useAuthorization();
  const router = useRouter();

  const [grupos, setGrupos] = useState<GrupoItem[]>([]);
  const [gruposLoading, setGruposLoading] = useState(true);

  const [periodos, setPeriodos] = useState<PeriodoItem[]>([]);
  const [periodosLoading, setPeriodosLoading] = useState(false);

  const [selectedGrupoId, setSelectedGrupoId] = useState('');
  const [selectedPeriodoId, setSelectedPeriodoId] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('asistencia');

  const [reporteAsistencia, setReporteAsistencia] =
    useState<ReporteAsistenciaData | null>(null);
  const [reporteRendimiento, setReporteRendimiento] =
    useState<ReporteRendimientoData | null>(null);
  const [reporteLoading, setReporteLoading] = useState(false);
  const [reporteError, setReporteError] = useState<string | null>(null);

  const [csvLoading, setCsvLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
    if (!isLoading && isAuthenticated && !isAdminEscuela && !isEducador) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, isAdminEscuela, isEducador, router]);

  // Cargar grupos según rol
  useEffect(() => {
    if (isLoading || (!isAdminEscuela && !isEducador)) return;

    let isActive = true;

    async function loadGrupos() {
      try {
        setGruposLoading(true);

        let data: { grupos: GrupoItem[] };

        if (isAdminEscuela) {
          const miInstRes = await fetch('/api/mi-institucion');
          if (!miInstRes.ok) throw new Error('Error al cargar institución');
          const miInst = (await miInstRes.json()) as {
            institucionId: string;
          };

          const gruposRes = await fetch(
            `/api/grupos?institucionId=${miInst.institucionId}&limit=100`
          );
          if (!gruposRes.ok) throw new Error('Error al cargar grupos');
          data = (await gruposRes.json()) as { grupos: GrupoItem[] };
        } else {
          const gruposRes = await fetch(
            '/api/educadores/me/grupos?page=1&limit=100'
          );
          if (!gruposRes.ok) throw new Error('Error al cargar grupos');
          data = (await gruposRes.json()) as { grupos: GrupoItem[] };
        }

        if (!isActive) return;
        setGrupos(data.grupos);
        if (data.grupos[0]) setSelectedGrupoId(data.grupos[0].id);
      } catch {
        // grupo loading silently fails, user can still use the page
      } finally {
        if (isActive) setGruposLoading(false);
      }
    }

    loadGrupos();
    return () => {
      isActive = false;
    };
  }, [isAdminEscuela, isEducador, isLoading]);

  // Cargar periodos cuando cambia el grupo
  useEffect(() => {
    if (!selectedGrupoId) return;

    const grupoSeleccionado = grupos.find((g) => g.id === selectedGrupoId);
    if (!grupoSeleccionado) return;

    let isActive = true;

    async function loadPeriodos() {
      try {
        setPeriodosLoading(true);
        const res = await fetch(
          `/api/instituciones/${grupoSeleccionado!.institucionId}/periodos`
        );
        if (!res.ok) return;
        const data = (await res.json()) as { periodos: PeriodoItem[] };
        if (!isActive) return;
        setPeriodos(data.periodos);
        setSelectedPeriodoId(data.periodos[0]?.id ?? '');
      } catch {
        // silent fail
      } finally {
        if (isActive) setPeriodosLoading(false);
      }
    }

    loadPeriodos();
    return () => {
      isActive = false;
    };
  }, [selectedGrupoId, grupos]);

  // Cargar reporte cuando cambia grupo, periodo o tab
  useEffect(() => {
    if (!selectedGrupoId) return;

    let isActive = true;

    async function loadReporte() {
      try {
        setReporteLoading(true);
        setReporteError(null);

        const qs = selectedPeriodoId ? `?periodoId=${selectedPeriodoId}` : '';

        if (activeTab === 'asistencia') {
          const res = await fetch(
            `/api/grupos/${selectedGrupoId}/reportes/asistencia${qs}`
          );
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(
              (err as { message?: string }).message ?? 'Error al cargar reporte'
            );
          }
          const data = (await res.json()) as ReporteAsistenciaData;
          if (!isActive) return;
          setReporteAsistencia(data);
        } else {
          const res = await fetch(
            `/api/grupos/${selectedGrupoId}/reportes/rendimiento${qs}`
          );
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(
              (err as { message?: string }).message ?? 'Error al cargar reporte'
            );
          }
          const data = (await res.json()) as ReporteRendimientoData;
          if (!isActive) return;
          setReporteRendimiento(data);
        }
      } catch (error) {
        if (!isActive) return;
        setReporteError(
          error instanceof Error ? error.message : 'Error al cargar reporte'
        );
      } finally {
        if (isActive) setReporteLoading(false);
      }
    }

    loadReporte();
    return () => {
      isActive = false;
    };
  }, [selectedGrupoId, selectedPeriodoId, activeTab]);

  async function handleDescargarCsv() {
    if (!selectedGrupoId) return;
    setCsvLoading(true);
    try {
      const qs = selectedPeriodoId ? `?periodoId=${selectedPeriodoId}` : '';
      const res = await fetch(
        `/api/grupos/${selectedGrupoId}/reportes/asistencia/csv${qs}`
      );
      if (!res.ok) throw new Error('Error al generar CSV');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-asistencia-${selectedGrupoId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent fail — user sees no change
    } finally {
      setCsvLoading(false);
    }
  }

  if (isLoading || gruposLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[var(--muted)]">Cargando...</p>
      </div>
    );
  }

  if (!isAdminEscuela && !isEducador) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Reportes
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Asistencia y rendimiento académico por grupo y período.
        </p>
      </div>

      {/* Selectores */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--muted)]">
            Grupo
          </label>
          <select
            value={selectedGrupoId}
            onChange={(e) => setSelectedGrupoId(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
          >
            {grupos.length === 0 && (
              <option value="">Sin grupos disponibles</option>
            )}
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--muted)]">
            Período
          </label>
          <select
            value={selectedPeriodoId}
            onChange={(e) => setSelectedPeriodoId(e.target.value)}
            disabled={periodosLoading || periodos.length === 0}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] disabled:opacity-50"
          >
            <option value="">Todos los períodos</option>
            {periodos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)]">
        <div className="flex gap-0">
          {(['asistencia', 'rendimiento'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-[var(--primary)] text-[var(--primary)]'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {reporteError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {reporteError}
        </div>
      )}

      {/* Loading */}
      {reporteLoading && (
        <div className="py-8 text-center text-sm text-[var(--muted)]">
          Cargando reporte...
        </div>
      )}

      {/* Tab: Asistencia */}
      {!reporteLoading && activeTab === 'asistencia' && reporteAsistencia && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[var(--muted)]">
              Total de clases:{' '}
              <span className="font-semibold text-[var(--foreground)]">
                {reporteAsistencia.totalClases}
              </span>
              {' · '}Promedio del grupo:{' '}
              <span className="font-semibold text-[var(--foreground)]">
                {reporteAsistencia.promedioGrupo}%
              </span>
            </div>
            <button
              onClick={handleDescargarCsv}
              disabled={csvLoading}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {csvLoading ? 'Generando...' : 'Descargar CSV'}
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface)] text-left text-xs font-medium uppercase text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Estudiante</th>
                  <th className="px-4 py-3 text-center">Presente</th>
                  <th className="px-4 py-3 text-center">Ausente</th>
                  <th className="px-4 py-3 text-center">Tardanza</th>
                  <th className="px-4 py-3 text-center">Justificado</th>
                  <th className="px-4 py-3 text-center">% Asistencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {reporteAsistencia.resumenPorEstudiante.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-[var(--muted)]"
                    >
                      Sin datos de asistencia para el período seleccionado.
                    </td>
                  </tr>
                ) : (
                  reporteAsistencia.resumenPorEstudiante.map((e, idx) => (
                    <tr
                      key={idx}
                      className="bg-[var(--background)] hover:bg-[var(--surface)]"
                    >
                      <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                        {e.estudiante.apellido}, {e.estudiante.nombre}
                      </td>
                      <td className="px-4 py-3 text-center text-green-600">
                        {e.presente}
                      </td>
                      <td className="px-4 py-3 text-center text-red-500">
                        {e.ausente}
                      </td>
                      <td className="px-4 py-3 text-center text-yellow-600">
                        {e.tardanza}
                      </td>
                      <td className="px-4 py-3 text-center text-blue-500">
                        {e.justificado}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            e.porcentajeAsistencia >= 75
                              ? 'bg-green-100 text-green-700'
                              : e.porcentajeAsistencia >= 50
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {e.porcentajeAsistencia}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Rendimiento */}
      {!reporteLoading && activeTab === 'rendimiento' && reporteRendimiento && (
        <div className="space-y-4">
          <div className="text-sm text-[var(--muted)]">
            Promedio del grupo:{' '}
            <span className="font-semibold text-[var(--foreground)]">
              {reporteRendimiento.promedioGrupo}
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface)] text-left text-xs font-medium uppercase text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Estudiante</th>
                  <th className="px-4 py-3 text-center">Promedio</th>
                  <th className="px-4 py-3">Materias</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {reporteRendimiento.resumenPorEstudiante.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-[var(--muted)]"
                    >
                      Sin calificaciones para el período seleccionado.
                    </td>
                  </tr>
                ) : (
                  reporteRendimiento.resumenPorEstudiante.map((e, idx) => (
                    <tr
                      key={idx}
                      className="bg-[var(--background)] hover:bg-[var(--surface)]"
                    >
                      <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                        {e.estudiante.apellido}, {e.estudiante.nombre}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            e.promedioCalificaciones >= 6
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {e.promedioCalificaciones}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {e.calificaciones.map((c, ci) => (
                            <span
                              key={ci}
                              className="inline-flex items-center gap-1 rounded bg-[var(--surface)] px-2 py-0.5 text-xs text-[var(--foreground)]"
                            >
                              {c.materia}: <strong>{c.nota}</strong>
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!reporteLoading &&
        !reporteAsistencia &&
        !reporteRendimiento &&
        !reporteError &&
        selectedGrupoId && (
          <div className="rounded-lg border border-[var(--border)] p-8 text-center text-[var(--muted)]">
            Seleccioná un grupo para ver el reporte.
          </div>
        )}
    </div>
  );
}
