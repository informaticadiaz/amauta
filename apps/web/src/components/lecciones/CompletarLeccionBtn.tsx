/**
 * Componente CompletarLeccionBtn
 *
 * Botón para marcar una lección como completada con actualización optimista del UI.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  leccionId: string;
  completada?: boolean;
  onCompletada?: () => void;
}

export function CompletarLeccionBtn({
  leccionId,
  completada = false,
  onCompletada,
}: Props) {
  const router = useRouter();
  const [completadaState, setCompletadaState] = useState(completada);
  const [loading, setLoading] = useState(false);

  if (completadaState) {
    return (
      <div
        data-testid="leccion-completada"
        className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
        Completada
      </div>
    );
  }

  async function handleCompletar() {
    setLoading(true);
    // Optimistic update
    setCompletadaState(true);

    try {
      const response = await fetch(`/api/lecciones/${leccionId}/completar`, {
        method: 'POST',
      });

      if (!response.ok) {
        // Revertir si falla
        setCompletadaState(false);
        return;
      }

      onCompletada?.();
      router.refresh();
    } catch {
      // Revertir si hay error de red
      setCompletadaState(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCompletar}
      disabled={loading}
      aria-label="Marcar como completada"
      className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-primary hover:bg-[var(--primary-bg)] hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <>
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Guardando...
        </>
      ) : (
        <>
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
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
          Marcar como completada
        </>
      )}
    </button>
  );
}
