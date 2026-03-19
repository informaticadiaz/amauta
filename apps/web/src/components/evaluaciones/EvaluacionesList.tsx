'use client';

/**
 * Componente EvaluacionesList
 *
 * Lista de evaluaciones con filtro por curso y estados de carga.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CursoItem {
  id: string;
  titulo: string;
}

interface EvaluacionItem {
  id: string;
  titulo: string;
  descripcion: string | null;
  publicada: boolean;
  tiempoLimiteMin: number | null;
  puntajeMinimo: number | null;
  intentosMaximos: number | null;
  createdAt: string;
}

interface ListaEvaluacionesResponse {
  evaluaciones: EvaluacionItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface EvaluacionesListProps {
  cursos: CursoItem[];
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function formatFecha(value?: string) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(date);
}

export function EvaluacionesList({ cursos }: EvaluacionesListProps) {
  const [cursoId, setCursoId] = useState(cursos[0]?.id ?? '');
  const [data, setData] = useState<ListaEvaluacionesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const primerCurso = cursos[0];
    if (!cursoId && primerCurso) {
      setCursoId(primerCurso.id);
    }
  }, [cursoId, cursos]);

  useEffect(() => {
    if (!cursoId) {
      setData(null);
      return;
    }

    let isActive = true;

    async function loadEvaluaciones() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/evaluaciones?cursoId=${cursoId}&page=${DEFAULT_PAGE}&limit=${DEFAULT_LIMIT}`
        );

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || 'Error al cargar evaluaciones');
        }

        const payload = (await response.json()) as ListaEvaluacionesResponse;
        if (isActive) {
          setData(payload);
        }
      } catch (err) {
        if (isActive) {
          setError(
            err instanceof Error ? err.message : 'Error al cargar evaluaciones'
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadEvaluaciones();

    return () => {
      isActive = false;
    };
  }, [cursoId, reloadKey]);

  if (cursos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-6 text-sm text-[var(--muted)]">
        Todavía no tenés cursos disponibles para listar evaluaciones.
      </div>
    );
  }

  const evaluaciones = data?.evaluaciones ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <label
            htmlFor="curso-evaluaciones"
            className="text-sm font-medium text-[var(--foreground)]"
          >
            Curso
          </label>
          <select
            id="curso-evaluaciones"
            value={cursoId}
            onChange={(event) => setCursoId(event.target.value)}
            className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
          >
            {cursos.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.titulo}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-[var(--muted)]">
          {data ? (
            <>
              {data.total} evaluación{data.total !== 1 ? 'es' : ''} en total
            </>
          ) : (
            'Seleccioná un curso para ver sus evaluaciones'
          )}
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
          Cargando evaluaciones...
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

      {!loading && !error && data && evaluaciones.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-6 text-sm text-[var(--muted)]">
          Todavía no hay evaluaciones para este curso. Empezá creando la
          primera.
        </div>
      )}

      {!loading && !error && evaluaciones.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {evaluaciones.map((evaluacion) => (
            <Link
              key={evaluacion.id}
              href={`/dashboard/evaluaciones/${evaluacion.id}`}
              className="block"
            >
              <article className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--foreground)]">
                      {evaluacion.titulo}
                    </h3>
                    {evaluacion.descripcion && (
                      <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">
                        {evaluacion.descripcion}
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      evaluacion.publicada
                        ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                        : 'bg-[var(--warning-bg)] text-[var(--warning-text)]'
                    }`}
                  >
                    {evaluacion.publicada ? 'Publicada' : 'Borrador'}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                  <span>Creada {formatFecha(evaluacion.createdAt)}</span>
                  {evaluacion.tiempoLimiteMin !== null && (
                    <span>Tiempo {evaluacion.tiempoLimiteMin} min</span>
                  )}
                  {evaluacion.puntajeMinimo !== null && (
                    <span>Puntaje mín. {evaluacion.puntajeMinimo}</span>
                  )}
                  {evaluacion.intentosMaximos !== null && (
                    <span>Intentos {evaluacion.intentosMaximos}</span>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
