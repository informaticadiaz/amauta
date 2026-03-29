'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuthorization } from '@/hooks/useAuthorization';

type EstadoAsistencia = 'PRESENTE' | 'AUSENTE' | 'TARDANZA' | 'JUSTIFICADO';

interface GrupoItem {
  id: string;
  nombre: string;
  rol?: 'TITULAR' | 'SUPLENTE';
}

interface ListaGruposResponse {
  grupos: GrupoItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface MiInstitucionResponse {
  institucionId: string;
  nombre: string;
}

interface EstudianteNominaItem {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  asistencia: {
    estado: EstadoAsistencia;
    observaciones: string | null;
  } | null;
}

interface NominaResponse {
  grupoId: string;
  fecha: string;
  estudiantes: EstudianteNominaItem[];
}

interface DraftItem {
  estado: EstadoAsistencia | null;
  observaciones: string;
}

const ESTADOS: Array<{
  value: EstadoAsistencia;
  label: string;
  shortLabel: string;
}> = [
  { value: 'PRESENTE', label: 'Presente', shortLabel: 'P' },
  { value: 'AUSENTE', label: 'Ausente', shortLabel: 'A' },
  { value: 'TARDANZA', label: 'Tardanza', shortLabel: 'T' },
  { value: 'JUSTIFICADO', label: 'Justificado', shortLabel: 'J' },
];

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? '';
}

function getStudentName(estudiante: EstudianteNominaItem) {
  return `${estudiante.nombre} ${estudiante.apellido}`.trim();
}

export function AsistenciaRapidaSection() {
  const { isLoading, isAdminEscuela, isEducador } = useAuthorization();
  const [grupos, setGrupos] = useState<GrupoItem[]>([]);
  const [gruposLoading, setGruposLoading] = useState(true);
  const [gruposError, setGruposError] = useState<string | null>(null);
  const [selectedGrupoId, setSelectedGrupoId] = useState('');
  const [fecha, setFecha] = useState(getTodayISO);
  const [nomina, setNomina] = useState<NominaResponse | null>(null);
  const [nominaLoading, setNominaLoading] = useState(false);
  const [nominaError, setNominaError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, DraftItem>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    let isActive = true;

    async function loadGroups() {
      try {
        setGruposLoading(true);
        setGruposError(null);

        let payload: ListaGruposResponse;

        if (isAdminEscuela) {
          const miInstitucionResponse = await fetch('/api/mi-institucion');
          if (!miInstitucionResponse.ok) {
            const err = await miInstitucionResponse.json().catch(() => ({}));
            throw new Error(err.message || 'Error al cargar institución');
          }

          const miInstitucion =
            (await miInstitucionResponse.json()) as MiInstitucionResponse;

          const gruposResponse = await fetch(
            `/api/grupos?institucionId=${miInstitucion.institucionId}`
          );

          if (!gruposResponse.ok) {
            const err = await gruposResponse.json().catch(() => ({}));
            throw new Error(err.message || 'Error al cargar grupos');
          }

          payload = (await gruposResponse.json()) as ListaGruposResponse;
        } else if (isEducador) {
          const gruposResponse = await fetch(
            '/api/educadores/me/grupos?page=1&limit=100'
          );

          if (!gruposResponse.ok) {
            const err = await gruposResponse.json().catch(() => ({}));
            throw new Error(err.message || 'Error al cargar grupos');
          }

          payload = (await gruposResponse.json()) as ListaGruposResponse;
        } else {
          throw new Error('No tenés permisos para registrar asistencias');
        }

        if (!isActive) return;

        setGrupos(payload.grupos);
        setSelectedGrupoId((current) => current || payload.grupos[0]?.id || '');
      } catch (error) {
        if (!isActive) return;
        setGruposError(
          error instanceof Error ? error.message : 'Error al cargar grupos'
        );
      } finally {
        if (isActive) {
          setGruposLoading(false);
        }
      }
    }

    loadGroups();

    return () => {
      isActive = false;
    };
  }, [isAdminEscuela, isEducador, isLoading]);

  useEffect(() => {
    if (!selectedGrupoId) {
      setNomina(null);
      setDraft({});
      return;
    }

    let isActive = true;

    async function loadNomina() {
      try {
        setNominaLoading(true);
        setNominaError(null);
        setSubmitError(null);

        const response = await fetch(
          `/api/grupos/${selectedGrupoId}/asistencias?fecha=${fecha}`
        );

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || 'Error al cargar asistencias');
        }

        const payload = (await response.json()) as NominaResponse;

        if (!isActive) return;
        setNomina(payload);
        setDraft({});
      } catch (error) {
        if (!isActive) return;
        setNominaError(
          error instanceof Error ? error.message : 'Error al cargar asistencias'
        );
        setNomina(null);
      } finally {
        if (isActive) {
          setNominaLoading(false);
        }
      }
    }

    loadNomina();

    return () => {
      isActive = false;
    };
  }, [fecha, selectedGrupoId]);

  const pendingChanges = useMemo(() => {
    if (!nomina) return [];

    return nomina.estudiantes.flatMap((estudiante) => {
      const originalEstado = estudiante.asistencia?.estado ?? null;
      const originalObservaciones = normalizeText(
        estudiante.asistencia?.observaciones
      );
      const draftItem = draft[estudiante.id];
      const currentEstado = draftItem ? draftItem.estado : originalEstado;
      const currentObservaciones = draftItem
        ? normalizeText(draftItem.observaciones)
        : originalObservaciones;

      const changed =
        currentEstado !== originalEstado ||
        currentObservaciones !== originalObservaciones;

      if (!changed || !currentEstado) {
        return [];
      }

      return [
        {
          estudiante,
          payload: {
            estudianteId: estudiante.id,
            estado: currentEstado,
            ...(currentObservaciones
              ? { observaciones: currentObservaciones }
              : {}),
          },
          requiresObservation:
            !!estudiante.asistencia && currentObservaciones.length === 0,
        },
      ];
    });
  }, [draft, nomina]);

  function updateDraft(estudiante: EstudianteNominaItem, next: DraftItem) {
    const originalEstado = estudiante.asistencia?.estado ?? null;
    const originalObservaciones = normalizeText(
      estudiante.asistencia?.observaciones
    );
    const nextObservaciones = normalizeText(next.observaciones);

    const changed =
      next.estado !== originalEstado ||
      nextObservaciones !== originalObservaciones;

    setDraft((current) => {
      const updated = { ...current };

      if (!changed) {
        delete updated[estudiante.id];
        return updated;
      }

      updated[estudiante.id] = {
        estado: next.estado,
        observaciones: nextObservaciones,
      };

      return updated;
    });
  }

  function handleEstadoChange(
    estudiante: EstudianteNominaItem,
    estado: EstadoAsistencia
  ) {
    const current = draft[estudiante.id];
    updateDraft(estudiante, {
      estado,
      observaciones:
        current?.observaciones ??
        normalizeText(estudiante.asistencia?.observaciones),
    });
  }

  function handleObservacionesChange(
    estudiante: EstudianteNominaItem,
    observaciones: string
  ) {
    const current = draft[estudiante.id];
    updateDraft(estudiante, {
      estado: current?.estado ?? estudiante.asistencia?.estado ?? null,
      observaciones,
    });
  }

  async function handleSubmit() {
    if (!selectedGrupoId || pendingChanges.length === 0) {
      return;
    }

    const invalidChange = pendingChanges.find(
      (item) => item.requiresObservation
    );
    if (invalidChange) {
      setSubmitError(
        `Debés indicar una observación para editar la asistencia de ${getStudentName(
          invalidChange.estudiante
        )}.`
      );
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const response = await fetch(
        `/api/grupos/${selectedGrupoId}/asistencias`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fecha,
            asistencias: pendingChanges.map((item) => item.payload),
          }),
        }
      );

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || 'Error al guardar asistencias');
      }

      setToast('Asistencias guardadas');
      setTimeout(() => setToast(null), 3000);

      const refreshResponse = await fetch(
        `/api/grupos/${selectedGrupoId}/asistencias?fecha=${fecha}`
      );

      if (!refreshResponse.ok) {
        const err = await refreshResponse.json().catch(() => ({}));
        throw new Error(err.message || 'Error al refrescar asistencias');
      }

      const refreshPayload = (await refreshResponse.json()) as NominaResponse;
      setNomina(refreshPayload);
      setDraft({});
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Error al guardar asistencias'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto]">
          <label className="space-y-2 text-sm font-medium text-[var(--foreground)]">
            <span>Grupo</span>
            <select
              aria-label="Grupo"
              value={selectedGrupoId}
              onChange={(event) => setSelectedGrupoId(event.target.value)}
              disabled={gruposLoading || grupos.length === 0}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              <option value="">Seleccioná un grupo</option>
              {grupos.map((grupo) => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nombre}
                  {grupo.rol ? ` · ${grupo.rol}` : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-[var(--foreground)]">
            <span>Fecha</span>
            <input
              aria-label="Fecha"
              type="date"
              value={fecha}
              onChange={(event) => setFecha(event.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
            />
          </label>

          <div className="flex flex-col justify-end gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || pendingChanges.length === 0}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Guardando...' : 'Guardar asistencias'}
            </button>
            <span className="text-xs text-[var(--muted)]">
              {pendingChanges.length} cambios pendientes
            </span>
          </div>
        </div>

        {gruposLoading && (
          <p className="mt-4 text-sm text-[var(--muted)]">Cargando grupos...</p>
        )}

        {!gruposLoading && gruposError && (
          <p className="mt-4 text-sm text-[var(--error-text)]">{gruposError}</p>
        )}

        {!gruposLoading && !gruposError && grupos.length === 0 && (
          <p className="mt-4 text-sm text-[var(--muted)]">
            No hay grupos disponibles para registrar asistencias.
          </p>
        )}
      </div>

      {submitError && (
        <div className="rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error-text)]">
          {submitError}
        </div>
      )}

      {nominaLoading && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
          Cargando asistencias...
        </div>
      )}

      {!nominaLoading && nominaError && (
        <div className="rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] p-4 text-sm text-[var(--error-text)]">
          {nominaError}
        </div>
      )}

      {!nominaLoading &&
        !nominaError &&
        nomina &&
        nomina.estudiantes.length === 0 && (
          <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-8 text-center text-sm text-[var(--muted)]">
            No hay estudiantes activos para este grupo en la fecha seleccionada.
          </div>
        )}

      {!nominaLoading &&
        !nominaError &&
        nomina &&
        nomina.estudiantes.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-[var(--border)]">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[var(--muted-bg)] text-left text-xs uppercase text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Estudiante</th>
                  <th className="px-4 py-3">Estado actual</th>
                  <th className="px-4 py-3">Acciones rápidas</th>
                  <th className="px-4 py-3">Observación</th>
                </tr>
              </thead>
              <tbody>
                {nomina.estudiantes.map((estudiante) => {
                  const draftItem = draft[estudiante.id];
                  const currentEstado =
                    draftItem?.estado ?? estudiante.asistencia?.estado ?? null;
                  const currentObservaciones =
                    draftItem?.observaciones ??
                    normalizeText(estudiante.asistencia?.observaciones);

                  return (
                    <tr
                      key={estudiante.id}
                      className="border-t border-[var(--border)]"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-[var(--foreground)]">
                          {getStudentName(estudiante)}
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          {estudiante.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--foreground)]">
                        {currentEstado ? (
                          ESTADOS.find(
                            (estado) => estado.value === currentEstado
                          )?.label
                        ) : (
                          <span className="text-[var(--muted)]">
                            Sin registrar
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {ESTADOS.map((estado) => {
                            const active = currentEstado === estado.value;
                            return (
                              <button
                                key={estado.value}
                                type="button"
                                aria-label={`${estado.label}-${estudiante.nombre}`}
                                onClick={() =>
                                  handleEstadoChange(estudiante, estado.value)
                                }
                                className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
                                  active
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-[var(--border)] text-[var(--foreground)]'
                                }`}
                              >
                                {estado.shortLabel}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={currentObservaciones}
                          onChange={(event) =>
                            handleObservacionesChange(
                              estudiante,
                              event.target.value
                            )
                          }
                          placeholder="Motivo / detalle"
                          className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
