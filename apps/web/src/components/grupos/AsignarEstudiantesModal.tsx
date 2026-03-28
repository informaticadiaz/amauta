'use client';

import { useEffect, useMemo, useState } from 'react';

interface UsuarioItem {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  activo: boolean;
}

interface ListaUsuariosResponse {
  usuarios: UsuarioItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AsignacionResultado {
  agregados: string[];
  duplicados: string[];
  errores: Array<{ estudianteId: string; razon: string }>;
}

interface AsignarEstudiantesModalProps {
  open: boolean;
  onClose: () => void;
  grupoId: string;
  institucionId: string;
  onAssigned: () => void;
}

const PAGE_LIMIT = 10;

export function AsignarEstudiantesModal({
  open,
  onClose,
  grupoId,
  institucionId,
  onAssigned,
}: AsignarEstudiantesModalProps) {
  const [data, setData] = useState<ListaUsuariosResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [buscar, setBuscar] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [assignedIds, setAssignedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [resultado, setResultado] = useState<AsignacionResultado | null>(null);

  useEffect(() => {
    if (!open) return;
    setPage(1);
    setBuscar('');
    setSelected([]);
    setResultado(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let isActive = true;

    async function loadUsuarios() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(PAGE_LIMIT));
        if (buscar.trim()) params.set('buscar', buscar.trim());

        const response = await fetch(
          `/api/instituciones/${institucionId}/estudiantes?${params.toString()}`
        );

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || 'Error al cargar estudiantes');
        }

        const payload = (await response.json()) as ListaUsuariosResponse;
        if (isActive) {
          setData(payload);
        }
      } catch (err) {
        if (isActive) {
          setError(
            err instanceof Error ? err.message : 'Error al cargar estudiantes'
          );
        }
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadUsuarios();
    return () => {
      isActive = false;
    };
  }, [open, page, buscar, institucionId]);

  useEffect(() => {
    if (!open) return;
    let isActive = true;

    async function loadAssignedIds() {
      try {
        const ids: string[] = [];
        let currentPage = 1;
        let totalPages = 1;

        while (currentPage <= totalPages) {
          const params = new URLSearchParams();
          params.set('page', String(currentPage));
          params.set('limit', '100');
          const response = await fetch(
            `/api/grupos/${grupoId}/estudiantes?${params.toString()}`
          );
          if (!response.ok) break;
          const payload = (await response.json()) as {
            estudiantes: Array<{ id: string }>;
            totalPages: number;
          };
          payload.estudiantes.forEach((estudiante) => ids.push(estudiante.id));
          totalPages = payload.totalPages || 1;
          currentPage += 1;
        }

        if (isActive) setAssignedIds(ids);
      } catch (err) {
        if (isActive) setAssignedIds([]);
      }
    }

    loadAssignedIds();
    return () => {
      isActive = false;
    };
  }, [open, grupoId]);

  const preview = useMemo(() => {
    const duplicados = selected.filter((id) => assignedIds.includes(id));
    const agregados = selected.filter((id) => !assignedIds.includes(id));
    return { duplicados, agregados };
  }, [selected, assignedIds]);

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleAsignar() {
    if (selected.length === 0) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/grupos/${grupoId}/estudiantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudiantesIds: selected }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || 'Error al asignar estudiantes');
      }

      setResultado(payload.resultado ?? payload);
      onAssigned();
      setSelected([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-3xl rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Asignar estudiantes
            </h3>
            <p className="text-sm text-[var(--muted)]">
              Seleccioná estudiantes de tu institución y revisá el preview antes
              de confirmar.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={buscar}
            onChange={(event) => setBuscar(event.target.value)}
            placeholder="Buscar por nombre o email"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
          />

          {loading && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
              Cargando estudiantes...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] p-4 text-sm text-[var(--error-text)]">
              {error}
            </div>
          )}

          {!loading && !error && data && data.usuarios.length === 0 && (
            <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-6 text-center text-sm text-[var(--muted)]">
              No hay estudiantes disponibles con ese filtro.
            </div>
          )}

          {!loading && !error && data && data.usuarios.length > 0 && (
            <div className="max-h-64 overflow-y-auto rounded-lg border border-[var(--border)]">
              <ul className="divide-y divide-[var(--border)] text-sm">
                {data.usuarios.map((usuario) => {
                  const checked = selected.includes(usuario.id);
                  return (
                    <li
                      key={usuario.id}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelect(usuario.id)}
                          className="h-4 w-4"
                        />
                        <span>
                          <span className="font-medium text-[var(--foreground)]">
                            {usuario.nombre} {usuario.apellido}
                          </span>
                          <span className="block text-xs text-[var(--muted)]">
                            {usuario.email}
                          </span>
                        </span>
                      </label>
                      <span className="rounded-full bg-[var(--success-bg)] px-2 py-0.5 text-xs text-[var(--success-text)]">
                        Institución OK
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-[var(--muted)]">
              <span>
                Página {data.page} de {data.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page <= 1}
                  className="rounded-md border border-[var(--border)] px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPage((prev) =>
                      data ? Math.min(prev + 1, data.totalPages) : prev
                    )
                  }
                  disabled={data ? page >= data.totalPages : true}
                  className="rounded-md border border-[var(--border)] px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-3 rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] p-4 text-sm">
          <h4 className="font-semibold text-[var(--foreground)]">Preview</h4>
          <div className="flex flex-wrap gap-4 text-[var(--muted)]">
            <span>Seleccionados: {selected.length}</span>
            <span>Agregados: {preview.agregados.length}</span>
            <span>Duplicados: {preview.duplicados.length}</span>
            <span>Errores: {resultado?.errores?.length ?? 0}</span>
          </div>
          {resultado && (
            <div className="text-xs text-[var(--muted)]">
              Resultado última asignación: {resultado.agregados.length} agregados,
              {` ${resultado.duplicados.length} duplicados`} y
              {` ${resultado.errores.length} errores`}.
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAsignar}
            disabled={selected.length === 0 || submitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Asignando...' : 'Confirmar asignación'}
          </button>
        </div>
      </div>
    </div>
  );
}
