'use client';

/**
 * GruposList — Lista de grupos/clases con filtros por período y estado
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PeriodoItem {
  id: string;
  nombre: string;
  activo?: boolean;
}

interface GrupoItem {
  id: string;
  nombre: string;
  grado: string | null;
  seccion: string | null;
  activo: boolean;
  periodoAcademicoId: string | null;
  educadorId: string;
  createdAt: string;
}

interface ListaGruposResponse {
  grupos: GrupoItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface GruposListProps {
  institucionId: string;
  periodos: PeriodoItem[];
}

export function GruposList({ institucionId, periodos }: GruposListProps) {
  const [data, setData] = useState<ListaGruposResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [filtroActivo, setFiltroActivo] = useState<string>('');
  const [filtroPerido, setFiltroPerido] = useState<string>('');

  useEffect(() => {
    let isActive = true;

    async function loadGrupos() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set('institucionId', institucionId);
        if (filtroActivo !== '') params.set('activo', filtroActivo);
        if (filtroPerido) params.set('periodoAcademicoId', filtroPerido);

        const response = await fetch(`/api/grupos?${params.toString()}`);

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || 'Error al cargar grupos');
        }

        const payload = (await response.json()) as ListaGruposResponse;
        if (isActive) {
          setData(payload);
        }
      } catch (err) {
        if (isActive) {
          setError(
            err instanceof Error ? err.message : 'Error al cargar grupos'
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadGrupos();
    return () => {
      isActive = false;
    };
  }, [institucionId, filtroActivo, filtroPerido, reloadKey]);

  const grupos = data?.grupos ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="filtro-estado"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              Estado
            </label>
            <select
              id="filtro-estado"
              value={filtroActivo}
              onChange={(e) => setFiltroActivo(e.target.value)}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)]"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          {periodos.length > 0 && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="filtro-periodo"
                className="text-sm font-medium text-[var(--foreground)]"
              >
                Período
              </label>
              <select
                id="filtro-periodo"
                value={filtroPerido}
                onChange={(e) => setFiltroPerido(e.target.value)}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)]"
              >
                <option value="">Todos los períodos</option>
                {periodos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <Link
          href="/dashboard/grupos/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover hover:no-underline"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Nuevo grupo
        </Link>
      </div>

      {loading && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
          Cargando grupos...
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col gap-3 rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] p-4 text-sm text-[var(--error-text)]">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((prev) => prev + 1)}
            className="inline-flex w-fit items-center justify-center rounded-md border border-[var(--error-border)] px-3 py-1.5 text-xs font-medium"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && grupos.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-8 text-center">
          <p className="text-sm text-[var(--muted)]">
            No hay grupos para mostrar.
          </p>
          <Link
            href="/dashboard/grupos/nuevo"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Crear el primer grupo
          </Link>
        </div>
      )}

      {!loading && !error && grupos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grupos.map((grupo) => (
            <div
              key={grupo.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">
                    {grupo.nombre}
                  </h3>
                  {(grupo.grado || grupo.seccion) && (
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      {[grupo.grado, grupo.seccion].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    grupo.activo
                      ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                      : 'bg-[var(--warning-bg)] text-[var(--warning-text)]'
                  }`}
                >
                  {grupo.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <Link
                  href={`/dashboard/grupos/${grupo.id}/editar`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.total > 0 && (
        <p className="text-xs text-[var(--muted)]">
          {data.total} grupo{data.total !== 1 ? 's' : ''} en total
        </p>
      )}
    </div>
  );
}
