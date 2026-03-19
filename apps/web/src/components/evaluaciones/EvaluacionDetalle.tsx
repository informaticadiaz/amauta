'use client';

/**
 * Componente EvaluacionDetalle
 *
 * Muestra el detalle de una evaluacion con estados loading/error.
 */

import { useEffect, useState } from 'react';

interface EvaluacionDetalleData {
  evaluacion: {
    id: string;
    titulo: string;
    descripcion: string | null;
    cursoId: string;
    creadorId: string;
    tiempoLimiteMin: number | null;
    puntajeMinimo: number | null;
    intentosMaximos: number | null;
    publicada: boolean;
    publicadoEn: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

interface EvaluacionDetalleProps {
  evaluacionId: string;
}

function formatFecha(value?: string | null) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(date);
}

export function EvaluacionDetalle({ evaluacionId }: EvaluacionDetalleProps) {
  const [data, setData] = useState<EvaluacionDetalleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadDetalle() {
      try {
        setLoading(true);
        setError(null);
        setIsEmpty(false);

        const response = await fetch(`/api/evaluaciones/${evaluacionId}`);

        if (!response.ok) {
          if (response.status === 404) {
            if (isActive) {
              setIsEmpty(true);
              setData(null);
            }
            return;
          }
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || 'Error al cargar evaluación');
        }

        const payload = (await response.json()) as EvaluacionDetalleData;
        if (isActive) {
          if (!payload?.evaluacion) {
            setIsEmpty(true);
            setData(null);
            return;
          }
          setData(payload);
        }
      } catch (err) {
        if (isActive) {
          setError(
            err instanceof Error ? err.message : 'Error al cargar evaluación'
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    if (evaluacionId) {
      loadDetalle();
    }

    return () => {
      isActive = false;
    };
  }, [evaluacionId, reloadKey]);

  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
        Cargando evaluación...
      </div>
    );
  }

  if (!loading && error) {
    return (
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
    );
  }

  if (!loading && isEmpty) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-6 text-sm text-[var(--muted)]">
        No se encontro la evaluacion solicitada.
      </div>
    );
  }

  if (!data?.evaluacion) {
    return null;
  }

  const { evaluacion } = data;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              {evaluacion.titulo}
            </h2>
            {evaluacion.descripcion && (
              <p className="mt-2 text-sm text-[var(--muted)]">
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

        <div className="mt-4 grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2">
          <div>
            <span className="block text-xs uppercase text-[var(--muted)]">
              Curso asociado
            </span>
            <span className="font-medium text-[var(--foreground)]">
              {evaluacion.cursoId}
            </span>
          </div>
          <div>
            <span className="block text-xs uppercase text-[var(--muted)]">
              Creada
            </span>
            <span className="font-medium text-[var(--foreground)]">
              {formatFecha(evaluacion.createdAt)}
            </span>
          </div>
          <div>
            <span className="block text-xs uppercase text-[var(--muted)]">
              Ultima actualizacion
            </span>
            <span className="font-medium text-[var(--foreground)]">
              {formatFecha(evaluacion.updatedAt)}
            </span>
          </div>
          <div>
            <span className="block text-xs uppercase text-[var(--muted)]">
              Publicada el
            </span>
            <span className="font-medium text-[var(--foreground)]">
              {formatFecha(evaluacion.publicadoEn)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
          <p className="text-xs uppercase text-[var(--muted)]">Tiempo limite</p>
          <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
            {evaluacion.tiempoLimiteMin !== null
              ? `${evaluacion.tiempoLimiteMin} min`
              : 'Sin definir'}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
          <p className="text-xs uppercase text-[var(--muted)]">
            Puntaje minimo
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
            {evaluacion.puntajeMinimo !== null
              ? evaluacion.puntajeMinimo
              : 'Sin definir'}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
          <p className="text-xs uppercase text-[var(--muted)]">
            Intentos maximos
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
            {evaluacion.intentosMaximos !== null
              ? evaluacion.intentosMaximos
              : 'Sin definir'}
          </p>
        </div>
      </div>
    </div>
  );
}
