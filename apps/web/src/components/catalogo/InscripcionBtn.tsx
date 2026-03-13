/**
 * Componente InscripcionBtn
 *
 * Botón de inscripción con lógica real.
 * Muestra "Inscribirse", "Continuar curso" o redirige a login.
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface InscripcionBtnProps {
  cursoId: string;
  cursoTitulo: string;
  totalLecciones: number;
  duracion: number | null;
  cursoSlug?: string;
  primeraLeccionId?: string | null;
}

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--success-text)]"
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
  );
}

export function InscripcionBtn({
  cursoId,
  cursoTitulo,
  totalLecciones,
  duracion,
  cursoSlug,
  primeraLeccionId,
}: InscripcionBtnProps) {
  const { status } = useSession();
  const router = useRouter();
  const [inscrito, setInscrito] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchEstado();
    } else if (status !== 'loading') {
      setLoadingStatus(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, cursoId]);

  async function fetchEstado() {
    try {
      const res = await fetch(`/api/cursos/${cursoId}/inscripcion`);
      if (res.ok) {
        const data = await res.json();
        setInscrito(data.inscrito === true);
      }
    } finally {
      setLoadingStatus(false);
    }
  }

  async function handleInscribirse() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cursos/${cursoId}/inscribir`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al inscribirse');
      }
      setInscrito(true);
      mostrarToast('¡Te has inscrito exitosamente!');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelar() {
    setLoading(true);
    setError(null);
    setShowConfirm(false);
    try {
      const res = await fetch(`/api/cursos/${cursoId}/inscribir`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 204) {
        const data = await res.json();
        throw new Error(data.message || 'Error al cancelar');
      }
      setInscrito(false);
      mostrarToast('Inscripción cancelada');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  function mostrarToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const isLoading = status === 'loading' || loadingStatus;

  return (
    <>
      {/* Toast de feedback */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Modal de confirmación de cancelación */}
      {showConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold text-[var(--foreground)]">
              Cancelar inscripción
            </h3>
            <p className="mb-6 text-sm text-[var(--muted)]">
              ¿Estás seguro de que querés cancelar tu inscripción en{' '}
              <strong className="text-[var(--foreground)]">{cursoTitulo}</strong>
              ? Tu progreso se perderá.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--border)]"
              >
                Mantener inscripción
              </button>
              <button
                onClick={handleCancelar}
                disabled={loading}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6 shadow-lg">
        {/* Información del curso */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--muted)]">Lecciones</span>
            <span className="font-semibold text-[var(--foreground)]">
              {totalLecciones}
            </span>
          </div>

          {duracion && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">Duración total</span>
              <span className="font-semibold text-[var(--foreground)]">
                {Math.floor(duracion / 60)}h {duracion % 60}min
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--muted)]">Acceso</span>
            <span className="font-semibold text-[var(--foreground)]">
              Gratuito
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Botón principal */}
        {isLoading ? (
          <div className="h-11 w-full animate-pulse rounded-lg bg-[var(--border)]" />
        ) : status === 'unauthenticated' ? (
          <Link
            href="/login"
            className="block w-full rounded-lg bg-primary px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-primary/90 hover:no-underline"
          >
            Iniciar sesión para inscribirse
          </Link>
        ) : inscrito ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
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
              Ya estás inscrito
            </div>
            <Link
              href={
                cursoSlug && primeraLeccionId
                  ? `/cursos/${cursoSlug}/lecciones/${primeraLeccionId}`
                  : cursoSlug
                    ? `/cursos/${cursoSlug}`
                    : '/dashboard/mis-cursos'
              }
              className="block w-full rounded-lg bg-primary px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-primary/90 hover:no-underline"
            >
              Continuar curso
            </Link>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={loading}
              className="w-full rounded-lg border border-[var(--border)] px-6 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--border)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar inscripción
            </button>
          </div>
        ) : (
          <button
            onClick={handleInscribirse}
            disabled={loading}
            className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Inscribiendo...' : 'Inscribirse gratis'}
          </button>
        )}

        {/* Features */}
        <div className="mt-6 space-y-3 border-t border-[var(--border)] pt-6">
          <div className="flex items-start gap-3 text-sm">
            <CheckIcon />
            <span className="text-[var(--foreground)]">
              Acceso completo al curso
            </span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <CheckIcon />
            <span className="text-[var(--foreground)]">
              Material de estudio descargable
            </span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <CheckIcon />
            <span className="text-[var(--foreground)]">
              Acceso desde cualquier dispositivo
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
