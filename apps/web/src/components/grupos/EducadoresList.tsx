'use client';

import { useEffect, useMemo, useState } from 'react';

interface EducadorItem {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'TITULAR' | 'SUPLENTE';
  asignadoEn: string;
}

interface ListaEducadoresResponse {
  educadores: EducadorItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface EducadoresListProps {
  grupoId: string;
  reloadKey?: number;
}

const PAGE_LIMIT = 10;

export function EducadoresList({ grupoId, reloadKey = 0 }: EducadoresListProps) {
  const [data, setData] = useState<ListaEducadoresResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(PAGE_LIMIT));

        const response = await fetch(
          `/api/grupos/${grupoId}/educadores?${params.toString()}`
        );

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || 'Error al cargar educadores');
        }

        const payload = (await response.json()) as ListaEducadoresResponse;
        if (isActive) setData(payload);
      } catch (err) {
        if (isActive) {
          setError(
            err instanceof Error ? err.message : 'Error al cargar educadores'
          );
        }
      } finally {
        if (isActive) setLoading(false);
      }
    }

    load();
    return () => {
      isActive = false;
    };
  }, [grupoId, page, reloadKey]);

  const educadores = data?.educadores ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return educadores;
    const term = search.trim().toLowerCase();
    return educadores.filter((educador) =>
      `${educador.nombre} ${educador.apellido} ${educador.email}`
        .toLowerCase()
        .includes(term)
    );
  }, [educadores, search]);

  async function remover(educadorId: string) {
    const confirmado = window.confirm(
      '¿Querés remover este educador del grupo?'
    );
    if (!confirmado) return;

    try {
      const response = await fetch(
        `/api/grupos/${grupoId}/educadores/${educadorId}`,
        { method: 'DELETE' }
      );

      if (!response.ok && response.status !== 204) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Error al remover educador');
      }

      setData((prev) =>
        prev
          ? {
              ...prev,
              educadores: prev.educadores.filter(
                (educador) => educador.id !== educadorId
              ),
              total: Math.max(prev.total - 1, 0),
            }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al remover educador');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Educadores asignados
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {data ? `${data.total} educadores asignados` : 'Cargando...'}
          </p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre o email"
          className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] sm:max-w-xs"
        />
      </div>

      {loading && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
          Cargando educadores...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] p-4 text-sm text-[var(--error-text)]">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-8 text-center text-sm text-[var(--muted)]">
          No hay educadores asignados.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-[var(--border)]">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[var(--muted-bg)] text-left text-xs uppercase text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3">Educador</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Asignado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((educador) => (
                <tr
                  key={educador.id}
                  className="border-t border-[var(--border)]"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-[var(--foreground)]">
                      {educador.nombre} {educador.apellido}
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {educador.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    {educador.rol}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {new Date(educador.asignadoEn).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => remover(educador.id)}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[var(--muted)]">
          <span>
            Página {data.page} de {data.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1}
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
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
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
