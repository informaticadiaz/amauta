'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthorization } from '@/hooks/useAuthorization';

type Estado = 'ACTIVA' | 'BAJA' | 'EGRESADO';
interface Periodo {
  id: string;
  nombre: string;
  activo: boolean;
}
interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}
interface Matricula {
  id: string;
  estado: Estado;
  observaciones?: string | null;
  fechaInscripcion: string;
  estudiante: Estudiante;
  periodoAcademico: Periodo;
}
interface Padrón {
  matriculas: Matricula[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const estadoLabels: Record<Estado, string> = {
  ACTIVA: 'Activa',
  BAJA: 'Baja',
  EGRESADO: 'Egresado',
};

export function MatriculasSection() {
  const { isAuthenticated, isLoading, isAdminEscuela } = useAuthorization();
  const router = useRouter();
  const [institucionId, setInstitucionId] = useState('');
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [padron, setPadron] = useState<Padrón>({
    matriculas: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [periodoId, setPeriodoId] = useState('');
  const [estado, setEstado] = useState('');
  const [buscar, setBuscar] = useState('');
  const [page, setPage] = useState(1);
  const [estudianteId, setEstudianteId] = useState('');
  const [nuevoPeriodoId, setNuevoPeriodoId] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [editState, setEditState] = useState<
    Record<string, { estado: Estado; observaciones: string }>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdminEscuela))
      router.replace('/dashboard');
  }, [isAuthenticated, isAdminEscuela, isLoading, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !isAdminEscuela) return;
    let active = true;
    async function loadInitial() {
      try {
        const institutionResponse = await fetch('/api/mi-institucion');
        const institution = await institutionResponse.json();
        if (!institutionResponse.ok)
          throw new Error(
            institution.message || 'No se pudo obtener la institución'
          );
        const id = institution.institucionId as string;
        const [periodosResponse, estudiantesResponse] = await Promise.all([
          fetch(`/api/instituciones/${id}/periodos`),
          fetch(`/api/instituciones/${id}/estudiantes?limit=100`),
        ]);
        const [periodosData, estudiantesData] = await Promise.all([
          periodosResponse.json(),
          estudiantesResponse.json(),
        ]);
        if (!periodosResponse.ok || !estudiantesResponse.ok) {
          throw new Error(
            periodosData.message ||
              estudiantesData.message ||
              'No se pudieron cargar los datos'
          );
        }
        if (!active) return;
        setInstitucionId(id);
        setPeriodos(periodosData.periodos ?? []);
        setEstudiantes(estudiantesData.usuarios ?? []);
        setNuevoPeriodoId(periodosData.periodos?.[0]?.id ?? '');
      } catch (e) {
        if (active)
          setError(
            e instanceof Error ? e.message : 'No se pudieron cargar los datos'
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    loadInitial();
    return () => {
      active = false;
    };
  }, [isAuthenticated, isAdminEscuela, isLoading]);

  useEffect(() => {
    if (!institucionId) return;
    let active = true;
    const query = new URLSearchParams({ page: String(page), limit: '20' });
    if (periodoId) query.set('periodoAcademicoId', periodoId);
    if (estado) query.set('estado', estado);
    if (buscar.trim()) query.set('buscar', buscar.trim());
    setLoading(true);
    fetch(`/api/instituciones/${institucionId}/matriculas?${query}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || 'No se pudo cargar el padrón');
        if (active) setPadron(data);
      })
      .catch((e) => {
        if (active)
          setError(
            e instanceof Error ? e.message : 'No se pudo cargar el padrón'
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [institucionId, page, periodoId, estado, buscar]);

  function updateFilter(setter: (value: string) => void, value: string) {
    setPage(1);
    setter(value);
  }

  async function crearMatricula(event: React.FormEvent) {
    event.preventDefault();
    if (!institucionId || !estudianteId || !nuevoPeriodoId) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    const response = await fetch(
      `/api/instituciones/${institucionId}/matriculas`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudianteId,
          periodoAcademicoId: nuevoPeriodoId,
          ...(observaciones.trim()
            ? { observaciones: observaciones.trim() }
            : {}),
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) setError(data.message || 'No se pudo crear la matrícula');
    else {
      setMessage('Matrícula creada correctamente.');
      setEstudianteId('');
      setObservaciones('');
      setPage(1);
    }
    setSaving(false);
    if (response.ok) await cargarPadron();
  }

  async function cargarPadron() {
    if (!institucionId) return;
    const query = new URLSearchParams({ page: String(page), limit: '20' });
    if (periodoId) query.set('periodoAcademicoId', periodoId);
    if (estado) query.set('estado', estado);
    if (buscar.trim()) query.set('buscar', buscar.trim());
    const response = await fetch(
      `/api/instituciones/${institucionId}/matriculas?${query}`
    );
    const data = await response.json();
    if (response.ok) setPadron(data);
  }

  async function actualizarMatricula(matricula: Matricula) {
    const current = editState[matricula.id] ?? {
      estado: matricula.estado,
      observaciones: matricula.observaciones ?? '',
    };
    setSaving(true);
    setError(null);
    setMessage(null);
    const response = await fetch(`/api/matriculas/${matricula.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estado: current.estado,
        observaciones: current.observaciones.trim() || null,
      }),
    });
    const data = await response.json();
    if (!response.ok)
      setError(data.message || 'No se pudo actualizar la matrícula');
    else {
      setMessage('Matrícula actualizada correctamente.');
      await cargarPadron();
    }
    setSaving(false);
  }

  if (isLoading || (loading && !institucionId))
    return (
      <p role="status" className="py-8 text-[var(--muted)]">
        Cargando matrículas...
      </p>
    );
  if (!isAuthenticated || !isAdminEscuela) return null;

  return (
    <div className="space-y-6">
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {message && (
        <p
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
        >
          {message}
        </p>
      )}
      <form
        onSubmit={crearMatricula}
        className="grid gap-3 rounded-lg border border-[var(--border)] p-4 md:grid-cols-4"
      >
        <select
          aria-label="Estudiante"
          value={estudianteId}
          onChange={(e) => setEstudianteId(e.target.value)}
          required
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        >
          <option value="">Seleccioná un estudiante</option>
          {estudiantes.map((student) => (
            <option key={student.id} value={student.id}>
              {student.apellido}, {student.nombre}
            </option>
          ))}
        </select>
        <select
          aria-label="Período de nueva matrícula"
          value={nuevoPeriodoId}
          onChange={(e) => setNuevoPeriodoId(e.target.value)}
          required
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        >
          <option value="">Seleccioná un período</option>
          {periodos
            .filter((periodo) => periodo.activo)
            .map((periodo) => (
              <option key={periodo.id} value={periodo.id}>
                {periodo.nombre}
              </option>
            ))}
        </select>
        <input
          aria-label="Observaciones de nueva matrícula"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Observaciones (opcional)"
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        />
        <button
          disabled={saving}
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Matricular estudiante'}
        </button>
      </form>

      <div className="flex flex-wrap gap-3">
        <select
          aria-label="Filtrar por período"
          value={periodoId}
          onChange={(e) => updateFilter(setPeriodoId, e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        >
          <option value="">Todos los períodos</option>
          {periodos.map((periodo) => (
            <option key={periodo.id} value={periodo.id}>
              {periodo.nombre}
            </option>
          ))}
        </select>
        <select
          aria-label="Filtrar por estado"
          value={estado}
          onChange={(e) => updateFilter(setEstado, e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          {Object.entries(estadoLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          aria-label="Buscar en el padrón"
          value={buscar}
          onChange={(e) => updateFilter(setBuscar, e.target.value)}
          placeholder="Buscar estudiante"
          className="min-w-60 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
        <table className="min-w-full divide-y divide-[var(--border)] text-sm">
          <thead>
            <tr className="text-left text-[var(--muted)]">
              <th className="p-3">Estudiante</th>
              <th className="p-3">Período</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Observaciones</th>
              <th className="p-3">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {padron.matriculas.map((matricula) => {
              const current = editState[matricula.id] ?? {
                estado: matricula.estado,
                observaciones: matricula.observaciones ?? '',
              };
              return (
                <tr key={matricula.id}>
                  <td className="p-3 font-medium">
                    {matricula.estudiante.apellido},{' '}
                    {matricula.estudiante.nombre}
                    <span className="block text-xs text-[var(--muted)]">
                      {matricula.estudiante.email}
                    </span>
                  </td>
                  <td className="p-3">{matricula.periodoAcademico.nombre}</td>
                  <td className="p-3">
                    <select
                      aria-label={`Estado de ${matricula.estudiante.nombre}`}
                      value={current.estado}
                      onChange={(e) =>
                        setEditState({
                          ...editState,
                          [matricula.id]: {
                            ...current,
                            estado: e.target.value as Estado,
                          },
                        })
                      }
                      className="rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1"
                    >
                      <option value="ACTIVA">Activa</option>
                      <option value="BAJA">Baja</option>
                      <option value="EGRESADO">Egresado</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <input
                      aria-label={`Observaciones de ${matricula.estudiante.nombre}`}
                      value={current.observaciones}
                      onChange={(e) =>
                        setEditState({
                          ...editState,
                          [matricula.id]: {
                            ...current,
                            observaciones: e.target.value,
                          },
                        })
                      }
                      className="w-full min-w-40 rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1"
                    />
                  </td>
                  <td className="p-3">
                    <button
                      disabled={saving}
                      onClick={() => actualizarMatricula(matricula)}
                      className="text-sm font-medium text-[var(--primary)] disabled:opacity-50"
                    >
                      Guardar
                    </button>
                  </td>
                </tr>
              );
            })}
            {padron.matriculas.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[var(--muted)]">
                  No hay matrículas para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {padron.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">{padron.total} matrículas</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
              className="rounded border border-[var(--border)] px-3 py-1 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-2 py-1">
              Página {page} de {padron.totalPages}
            </span>
            <button
              disabled={page >= padron.totalPages}
              onClick={() => setPage((value) => value + 1)}
              className="rounded border border-[var(--border)] px-3 py-1 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
