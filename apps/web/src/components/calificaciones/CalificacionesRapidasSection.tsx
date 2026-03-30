'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuthorization } from '@/hooks/useAuthorization';

interface GrupoItem {
  id: string;
  nombre: string;
  rol?: 'TITULAR' | 'SUPLENTE';
  institucionId?: string;
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

interface PeriodoItem {
  id: string;
  nombre: string;
  activo: boolean;
}

interface EstudianteCalificacion {
  estudianteId: string;
  nombre: string;
  apellido: string;
  email: string;
  nota: number | null;
  observaciones: string | null;
}

interface NominaCalificacionesResponse {
  grupoId: string;
  periodoAcademicoId: string;
  materia: string;
  estudiantes: EstudianteCalificacion[];
}

interface DraftCalificacion {
  nota: string;
  observaciones: string;
}

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? '';
}

function getStudentName(est: EstudianteCalificacion) {
  return `${est.nombre} ${est.apellido}`.trim();
}

function exportarCSV(
  nomina: NominaCalificacionesResponse,
  draft: Record<string, DraftCalificacion>
) {
  const rows = [['Apellido', 'Nombre', 'Email', 'Nota', 'Observaciones']];

  for (const est of nomina.estudiantes) {
    const draftItem = draft[est.estudianteId];
    const nota = draftItem
      ? draftItem.nota
      : est.nota !== null
        ? String(est.nota)
        : '';
    const obs = draftItem
      ? draftItem.observaciones
      : normalizeText(est.observaciones);

    rows.push([est.apellido, est.nombre, est.email, nota, obs]);
  }

  const csv = rows
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `calificaciones-${nomina.materia}-${nomina.periodoAcademicoId}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function CalificacionesRapidasSection() {
  const { isLoading, isAdminEscuela, isEducador } = useAuthorization();

  const [grupos, setGrupos] = useState<GrupoItem[]>([]);
  const [gruposLoading, setGruposLoading] = useState(true);
  const [gruposError, setGruposError] = useState<string | null>(null);
  const [selectedGrupoId, setSelectedGrupoId] = useState('');
  const [institucionId, setInstitucionId] = useState('');

  const [periodos, setPeriodos] = useState<PeriodoItem[]>([]);
  const [periodosLoading, setPeriodosLoading] = useState(false);
  const [selectedPeriodoId, setSelectedPeriodoId] = useState('');

  const [materia, setMateria] = useState('');
  const [materiaInput, setMateriaInput] = useState('');

  const [nomina, setNomina] = useState<NominaCalificacionesResponse | null>(
    null
  );
  const [nominaLoading, setNominaLoading] = useState(false);
  const [nominaError, setNominaError] = useState<string | null>(null);

  const [draft, setDraft] = useState<Record<string, DraftCalificacion>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Cargar grupos según el rol
  useEffect(() => {
    if (isLoading) return;

    let isActive = true;

    async function loadGroups() {
      try {
        setGruposLoading(true);
        setGruposError(null);

        let payload: ListaGruposResponse;
        let instId = '';

        if (isAdminEscuela) {
          const miInstRes = await fetch('/api/mi-institucion');
          if (!miInstRes.ok) {
            const err = await miInstRes.json().catch(() => ({}));
            throw new Error(err.message || 'Error al cargar institución');
          }

          const miInstitucion =
            (await miInstRes.json()) as MiInstitucionResponse;
          instId = miInstitucion.institucionId;

          const gruposRes = await fetch(
            `/api/grupos?institucionId=${miInstitucion.institucionId}`
          );

          if (!gruposRes.ok) {
            const err = await gruposRes.json().catch(() => ({}));
            throw new Error(err.message || 'Error al cargar grupos');
          }

          payload = (await gruposRes.json()) as ListaGruposResponse;
        } else if (isEducador) {
          const gruposRes = await fetch(
            '/api/educadores/me/grupos?page=1&limit=100'
          );

          if (!gruposRes.ok) {
            const err = await gruposRes.json().catch(() => ({}));
            throw new Error(err.message || 'Error al cargar grupos');
          }

          payload = (await gruposRes.json()) as ListaGruposResponse;
        } else {
          throw new Error('No tenés permisos para cargar calificaciones');
        }

        if (!isActive) return;

        setGrupos(payload.grupos);

        const firstGrupo = payload.grupos[0];
        const firstId = firstGrupo?.id ?? '';
        const firstInstId = instId || firstGrupo?.institucionId || '';

        setSelectedGrupoId((current) => current || firstId);
        setInstitucionId((current) => current || firstInstId);
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

  // Cuando cambia el grupo seleccionado, actualizar el institucionId
  function handleGrupoChange(grupoId: string) {
    setSelectedGrupoId(grupoId);
    setSelectedPeriodoId('');
    setMateria('');
    setMateriaInput('');
    setNomina(null);
    setDraft({});

    if (isEducador) {
      const grupo = grupos.find((g) => g.id === grupoId);
      if (grupo?.institucionId) {
        setInstitucionId(grupo.institucionId);
      }
    }
  }

  // Cargar períodos cuando cambia el institucionId
  useEffect(() => {
    if (!institucionId) return;

    let isActive = true;

    async function loadPeriodos() {
      try {
        setPeriodosLoading(true);

        const res = await fetch(`/api/instituciones/${institucionId}/periodos`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Error al cargar períodos');
        }

        const data = (await res.json()) as { periodos: PeriodoItem[] };

        if (!isActive) return;
        setPeriodos(data.periodos);
        setSelectedPeriodoId(
          (current) => current || data.periodos[0]?.id || ''
        );
      } catch {
        // Períodos no críticos; silenciar error de carga
      } finally {
        if (isActive) {
          setPeriodosLoading(false);
        }
      }
    }

    loadPeriodos();

    return () => {
      isActive = false;
    };
  }, [institucionId]);

  // Cargar nómina cuando se ejecuta la búsqueda
  async function handleBuscar() {
    if (!selectedGrupoId || !selectedPeriodoId || !materiaInput.trim()) return;

    const materiaFinal = materiaInput.trim();

    setNominaLoading(true);
    setNominaError(null);
    setNomina(null);
    setDraft({});
    setSubmitError(null);

    try {
      const url =
        `/api/grupos/${selectedGrupoId}/calificaciones` +
        `?periodoAcademicoId=${encodeURIComponent(selectedPeriodoId)}` +
        `&materia=${encodeURIComponent(materiaFinal)}`;

      const response = await fetch(url);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Error al cargar calificaciones');
      }

      const payload = (await response.json()) as NominaCalificacionesResponse;
      setNomina(payload);
      setMateria(materiaFinal);
    } catch (error) {
      setNominaError(
        error instanceof Error
          ? error.message
          : 'Error al cargar calificaciones'
      );
    } finally {
      setNominaLoading(false);
    }
  }

  // Cambios pendientes: solo los que difieren del original
  const pendingChanges = useMemo(() => {
    if (!nomina) return [];

    return nomina.estudiantes.flatMap((est) => {
      const draftItem = draft[est.estudianteId];
      if (!draftItem) return [];

      const notaOriginal = est.nota !== null ? String(est.nota) : '';
      const obsOriginal = normalizeText(est.observaciones);

      const notaNueva = draftItem.nota.trim();
      const obsNueva = normalizeText(draftItem.observaciones);

      if (notaNueva === notaOriginal && obsNueva === obsOriginal) return [];

      const notaNum = parseFloat(notaNueva);
      if (isNaN(notaNum)) return [];

      const item: {
        estudianteId: string;
        nota: number;
        observaciones?: string;
      } = {
        estudianteId: est.estudianteId,
        nota: notaNum,
      };

      if (obsNueva) {
        item.observaciones = obsNueva;
      }

      return [item];
    });
  }, [draft, nomina]);

  function updateDraft(estudianteId: string, next: Partial<DraftCalificacion>) {
    setDraft((current) => {
      const prev = current[estudianteId] ?? {
        nota: '',
        observaciones: '',
      };
      return {
        ...current,
        [estudianteId]: { ...prev, ...next },
      };
    });
  }

  async function handleSubmit() {
    if (
      !selectedGrupoId ||
      !selectedPeriodoId ||
      !materia ||
      pendingChanges.length === 0
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const response = await fetch(
        `/api/grupos/${selectedGrupoId}/calificaciones`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            periodoAcademicoId: selectedPeriodoId,
            materia,
            calificaciones: pendingChanges,
          }),
        }
      );

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || 'Error al guardar calificaciones');
      }

      setToast('Calificaciones guardadas');
      setTimeout(() => setToast(null), 3000);

      // Refrescar nómina
      const refreshRes = await fetch(
        `/api/grupos/${selectedGrupoId}/calificaciones` +
          `?periodoAcademicoId=${encodeURIComponent(selectedPeriodoId)}` +
          `&materia=${encodeURIComponent(materia)}`
      );

      if (!refreshRes.ok) {
        const err = await refreshRes.json().catch(() => ({}));
        throw new Error(err.message || 'Error al refrescar calificaciones');
      }

      const refreshPayload =
        (await refreshRes.json()) as NominaCalificacionesResponse;
      setNomina(refreshPayload);
      setDraft({});
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Error al guardar calificaciones'
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

      {/* Filtros */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <label className="space-y-2 text-sm font-medium text-[var(--foreground)]">
            <span>Grupo</span>
            <select
              aria-label="Grupo"
              value={selectedGrupoId}
              onChange={(e) => handleGrupoChange(e.target.value)}
              disabled={gruposLoading || grupos.length === 0}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              <option value="">Seleccioná un grupo</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre}
                  {g.rol ? ` · ${g.rol}` : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-[var(--foreground)]">
            <span>Período académico</span>
            <select
              aria-label="Período académico"
              value={selectedPeriodoId}
              onChange={(e) => setSelectedPeriodoId(e.target.value)}
              disabled={
                periodosLoading || periodos.length === 0 || !selectedGrupoId
              }
              className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              <option value="">Seleccioná un período</option>
              {periodos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-[var(--foreground)]">
            <span>Materia</span>
            <input
              aria-label="Materia"
              type="text"
              value={materiaInput}
              onChange={(e) => setMateriaInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleBuscar();
              }}
              placeholder="Ej: Matemática"
              maxLength={100}
              disabled={!selectedGrupoId || !selectedPeriodoId}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
            />
          </label>

          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={handleBuscar}
              disabled={
                nominaLoading ||
                !selectedGrupoId ||
                !selectedPeriodoId ||
                !materiaInput.trim()
              }
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {nominaLoading ? 'Buscando...' : 'Buscar'}
            </button>
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
            No hay grupos disponibles para cargar calificaciones.
          </p>
        )}
      </div>

      {/* Error de submit */}
      {submitError && (
        <div className="rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error-text)]">
          {submitError}
        </div>
      )}

      {/* Loading nómina */}
      {nominaLoading && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
          Cargando calificaciones...
        </div>
      )}

      {/* Error nómina */}
      {!nominaLoading && nominaError && (
        <div className="rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] p-4 text-sm text-[var(--error-text)]">
          {nominaError}
        </div>
      )}

      {/* Estado vacío */}
      {!nominaLoading &&
        !nominaError &&
        nomina &&
        nomina.estudiantes.length === 0 && (
          <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-8 text-center text-sm text-[var(--muted)]">
            No hay estudiantes activos para este grupo en el período
            seleccionado.
          </div>
        )}

      {/* Tabla de calificaciones */}
      {!nominaLoading &&
        !nominaError &&
        nomina &&
        nomina.estudiantes.length > 0 && (
          <>
            <div className="overflow-hidden rounded-lg border border-[var(--border)]">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-[var(--muted-bg)] text-left text-xs uppercase text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3">Estudiante</th>
                    <th className="px-4 py-3">Nota actual</th>
                    <th className="px-4 py-3">Nueva nota</th>
                    <th className="px-4 py-3">Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {nomina.estudiantes.map((est) => {
                    const draftItem = draft[est.estudianteId];
                    const notaDisplay =
                      draftItem?.nota !== undefined
                        ? draftItem.nota
                        : est.nota !== null
                          ? String(est.nota)
                          : '';
                    const obsDisplay =
                      draftItem?.observaciones !== undefined
                        ? draftItem.observaciones
                        : normalizeText(est.observaciones);

                    return (
                      <tr
                        key={est.estudianteId}
                        className="border-t border-[var(--border)]"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-[var(--foreground)]">
                            {getStudentName(est)}
                          </div>
                          <div className="text-xs text-[var(--muted)]">
                            {est.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[var(--foreground)]">
                          {est.nota !== null ? (
                            est.nota
                          ) : (
                            <span className="text-[var(--muted)]">
                              Sin nota
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            aria-label={`nota-${est.nombre}`}
                            value={notaDisplay}
                            onChange={(e) =>
                              updateDraft(est.estudianteId, {
                                nota: e.target.value,
                              })
                            }
                            step="0.01"
                            min={0}
                            placeholder="0"
                            className="w-24 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={obsDisplay}
                            onChange={(e) =>
                              updateDraft(est.estudianteId, {
                                observaciones: e.target.value,
                              })
                            }
                            placeholder="Observación opcional"
                            className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-[var(--muted)]">
                {pendingChanges.length} cambios pendientes
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => exportarCSV(nomina, draft)}
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]"
                >
                  Exportar resumen
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || pendingChanges.length === 0}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Guardando...' : 'Guardar calificaciones'}
                </button>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
