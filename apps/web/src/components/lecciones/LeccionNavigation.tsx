/**
 * Componente LeccionNavigation
 *
 * Navegación entre lecciones: botones anterior y siguiente.
 */

import Link from 'next/link';

interface LeccionRef {
  id: string;
  titulo: string;
}

interface Props {
  cursoSlug: string;
  leccionAnterior: LeccionRef | null;
  leccionSiguiente: LeccionRef | null;
}

export function LeccionNavigation({
  cursoSlug,
  leccionAnterior,
  leccionSiguiente,
}: Props) {
  if (!leccionAnterior && !leccionSiguiente) {
    return null;
  }

  return (
    <div className="mt-8 flex items-stretch gap-4 border-t border-[var(--border)] pt-8">
      {/* Botón anterior */}
      <div className="flex-1">
        {leccionAnterior && (
          <Link
            href={`/cursos/${cursoSlug}/lecciones/${leccionAnterior.id}`}
            aria-label="Lección anterior"
            className="flex h-full flex-col items-start gap-1 rounded-lg border border-[var(--border)] p-4 transition-colors hover:border-primary hover:bg-[var(--primary-bg)] hover:no-underline"
          >
            <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
              Anterior
            </div>
            <p className="text-sm font-medium text-[var(--foreground)] line-clamp-2">
              {leccionAnterior.titulo}
            </p>
          </Link>
        )}
      </div>

      {/* Botón siguiente */}
      <div className="flex-1">
        {leccionSiguiente && (
          <Link
            href={`/cursos/${cursoSlug}/lecciones/${leccionSiguiente.id}`}
            aria-label="Lección siguiente"
            className="flex h-full flex-col items-end gap-1 rounded-lg border border-[var(--border)] p-4 text-right transition-colors hover:border-primary hover:bg-[var(--primary-bg)] hover:no-underline"
          >
            <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              Siguiente
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--foreground)] line-clamp-2">
              {leccionSiguiente.titulo}
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}
