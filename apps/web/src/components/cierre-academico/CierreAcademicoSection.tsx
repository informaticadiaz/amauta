'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuthorization } from '@/hooks/useAuthorization';

type Estado = 'PROMOVIDO' | 'REPITENTE';
type PreviewEstudiante = {
  estudianteId: string;
  nombre: string;
  apellido: string;
  estado: Estado;
  porcentajeAsistencia: number;
  porcentajeAsistenciaMinimo: number;
  materiasTotales: number;
  materiasAprobadas: number;
  materiasSinCalificacion: number;
  razones: string[];
};
type Preview = {
  institucion: { id: string; nombre: string };
  periodo: { id: string; nombre: string; estadoCierre: 'ABIERTO' | 'CERRADO' };
  grupos: Array<{
    grupoId: string;
    nombre: string;
    estudiantes: PreviewEstudiante[];
  }>;
};
type Override = { estado: Estado; justificacion: string };

export function CierreAcademicoSection() {
  const { isLoading, isAdminEscuela, isAuthenticated } = useAuthorization();
  const [institucionId, setInstitucionId] = useState('');
  const [institucionNombre, setInstitucionNombre] = useState('');
  const [periodos, setPeriodos] = useState<
    Array<{ id: string; nombre: string; activo: boolean }>
  >([]);
  const [periodoId, setPeriodoId] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !isAdminEscuela) return;
    let active = true;
    (async () => {
      try {
        const institutionResponse = await fetch('/api/mi-institucion');
        if (!institutionResponse.ok)
          throw new Error('No se pudo cargar la institución');
        const institution = (await institutionResponse.json()) as {
          institucionId: string;
          nombre: string;
          periodos?: typeof periodos;
        };
        const periodResponse = await fetch(
          `/api/instituciones/${institution.institucionId}/periodos`
        );
        if (!periodResponse.ok)
          throw new Error('No se pudieron cargar los períodos');
        const data = (await periodResponse.json()) as {
          periodos: typeof periodos;
        };
        if (!active) return;
        setInstitucionId(institution.institucionId);
        setInstitucionNombre(institution.nombre);
        setPeriodos(data.periodos);
        setPeriodoId(data.periodos[0]?.id ?? '');
      } catch (cause) {
        if (active)
          setError(cause instanceof Error ? cause.message : 'Error de carga');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isAdminEscuela, isAuthenticated, isLoading]);

  async function loadPreview() {
    if (!institucionId || !periodoId) return;
    setError(null);
    setPreview(null);
    setOverrides({});
    try {
      const response = await fetch(
        `/api/instituciones/${institucionId}/periodos/${periodoId}/cierre-academico/preview`
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || 'No se pudo cargar el preview');
      setPreview(data as Preview);
      setClosed(data.periodo.estadoCierre === 'CERRADO');
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Error al cargar preview'
      );
    }
  }

  const estudiantes = useMemo(
    () =>
      preview?.grupos.flatMap((grupo) =>
        grupo.estudiantes.map((estudiante) => ({
          ...estudiante,
          grupoId: grupo.grupoId,
          grupoNombre: grupo.nombre,
        }))
      ) ?? [],
    [preview]
  );

  function updateOverride(
    grupoId: string,
    estudiante: PreviewEstudiante,
    estado: Estado
  ) {
    const key = `${grupoId}:${estudiante.estudianteId}`;
    setOverrides((current) => ({
      ...current,
      [key]: { estado, justificacion: current[key]?.justificacion ?? '' },
    }));
  }

  async function confirm() {
    if (!preview || closed) return;
    const sobrescrituras = Object.entries(overrides).map(([key, value]) => {
      const [grupoId, estudianteId] = key.split(':');
      return {
        grupoId,
        estudianteId,
        estado: value.estado,
        ...(value.justificacion.trim()
          ? { justificacion: value.justificacion.trim() }
          : {}),
      };
    });
    const invalid = sobrescrituras.find((item) => {
      const student = estudiantes.find(
        (entry) =>
          `${entry.grupoId}:${entry.estudianteId}` ===
          `${item.grupoId}:${item.estudianteId}`
      );
      return student && student.estado !== item.estado && !item.justificacion;
    });
    if (invalid) {
      setError(
        'La justificación es obligatoria cuando cambiás el estado calculado.'
      );
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/instituciones/${institucionId}/periodos/${periodoId}/cierre-academico/confirmar`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sobrescrituras }),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || 'No se pudo confirmar el cierre');
      setPreview(data as Preview);
      setClosed(true);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Error al confirmar el cierre'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || loading)
    return (
      <p className="text-sm text-[var(--muted)]">
        Cargando cierre académico...
      </p>
    );
  if (!isAuthenticated || !isAdminEscuela) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
        <p className="mb-3 text-sm text-[var(--muted)]">{institucionNombre}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 space-y-2 text-sm font-medium">
            <span>Período académico</span>
            <select
              aria-label="Período académico"
              value={periodoId}
              onChange={(event) => setPeriodoId(event.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            >
              <option value="">Seleccioná un período</option>
              {periodos.map((periodo) => (
                <option key={periodo.id} value={periodo.id}>
                  {periodo.nombre}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={loadPreview}
            disabled={!periodoId}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Cargar preview
          </button>
        </div>
      </div>
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error-text)]"
        >
          {error}
        </div>
      )}
      {preview && (
        <>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <h2 className="font-semibold">
              {preview.institucion.nombre} · {preview.periodo.nombre}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Estados calculados sobre todas las materias activas y asistencia
              presente + justificada.
            </p>
            {closed && (
              <div className="mt-3 rounded-md bg-[var(--success-bg)] px-3 py-2 text-sm text-[var(--success-text)]">
                Período cerrado. La información queda disponible en modo
                lectura.
              </div>
            )}
          </div>
          {preview.grupos.map((grupo) => (
            <section
              key={grupo.grupoId}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <h3 className="mb-3 font-semibold">Grupo {grupo.nombre}</h3>
              <div className="space-y-4">
                {grupo.estudiantes.map((estudiante) => {
                  const key = `${grupo.grupoId}:${estudiante.estudianteId}`;
                  const selected = overrides[key]?.estado ?? estudiante.estado;
                  const changed = selected !== estudiante.estado;
                  return (
                    <div
                      key={key}
                      className="border-t border-[var(--border)] pt-3"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-medium">
                            {estudiante.apellido}, {estudiante.nombre}
                          </p>
                          <p className="text-xs text-[var(--muted)]">
                            Calculado: {estudiante.estado} · Asistencia:{' '}
                            {estudiante.porcentajeAsistencia}% /{' '}
                            {estudiante.porcentajeAsistenciaMinimo}% · Materias:{' '}
                            {estudiante.materiasAprobadas}/
                            {estudiante.materiasTotales} aprobadas
                          </p>
                        </div>
                        <select
                          aria-label={`Estado final de ${estudiante.nombre} ${estudiante.apellido}`}
                          value={selected}
                          disabled={closed}
                          onChange={(event) =>
                            updateOverride(
                              grupo.grupoId,
                              estudiante,
                              event.target.value as Estado
                            )
                          }
                          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
                        >
                          <option value="PROMOVIDO">PROMOVIDO</option>
                          <option value="REPITENTE">REPITENTE</option>
                        </select>
                      </div>
                      {estudiante.razones.length > 0 && (
                        <ul className="mt-2 list-disc pl-5 text-xs text-[var(--muted)]">
                          {estudiante.razones.map((razon) => (
                            <li key={razon}>{razon}</li>
                          ))}
                        </ul>
                      )}
                      {changed && (
                        <input
                          aria-label={`Justificación de ${estudiante.nombre} ${estudiante.apellido}`}
                          disabled={closed}
                          value={overrides[key]?.justificacion ?? ''}
                          onChange={(event) =>
                            setOverrides((current) => ({
                              ...current,
                              [key]: {
                                estado: selected,
                                justificacion: event.target.value,
                              },
                            }))
                          }
                          placeholder="Justificación de la sobrescritura"
                          className="mt-2 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
          <div className="flex flex-wrap gap-3">
            {!closed && (
              <button
                type="button"
                onClick={confirm}
                disabled={submitting}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {submitting ? 'Confirmando...' : 'Confirmar cierre del período'}
              </button>
            )}
            {closed && (
              <a
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium"
                href={`/api/instituciones/${institucionId}/periodos/${periodoId}/cierre-academico/acta`}
              >
                Descargar acta PDF
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}
