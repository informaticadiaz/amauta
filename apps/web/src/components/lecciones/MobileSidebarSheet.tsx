/**
 * Componente MobileSidebarSheet
 *
 * Botón que abre el sidebar de lecciones en móvil (drawer/sheet).
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Leccion {
  id: string;
  titulo: string;
  orden: number;
  duracion: number | null;
  publicada: boolean;
}

interface Props {
  lecciones: Leccion[];
  leccionActivaId: string;
  cursoSlug: string;
}

function formatDuracion(minutos: number): string {
  if (minutos >= 60) {
    return `${Math.floor(minutos / 60)}h ${minutos % 60}min`;
  }
  return `${minutos}min`;
}

export function MobileSidebarSheet({ lecciones, leccionActivaId, cursoSlug }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Ver lecciones del curso"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] transition-colors hover:bg-[var(--overlay)]"
      >
        <svg
          className="h-5 w-5 text-[var(--foreground)]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Drawer overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[var(--background)] shadow-xl">
            {/* Header del drawer */}
            <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                  Contenido del curso
                </p>
                <p className="mt-0.5 text-sm text-[var(--muted)]">
                  {lecciones.length} lecciones
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--overlay)]"
              >
                <svg
                  className="h-5 w-5 text-[var(--foreground)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Lista de lecciones */}
            <nav className="flex-1 overflow-y-auto py-2">
              {lecciones.map((leccion, index) => {
                const isActive = leccion.id === leccionActivaId;

                return (
                  <Link
                    key={leccion.id}
                    href={`/cursos/${cursoSlug}/lecciones/${leccion.id}`}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--overlay)] ${
                      isActive
                        ? 'border-r-2 border-primary bg-[var(--primary-bg)]'
                        : ''
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'bg-[var(--overlay)] text-[var(--muted)]'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`truncate text-sm font-medium ${
                          isActive ? 'text-primary' : 'text-[var(--foreground)]'
                        }`}
                      >
                        {leccion.titulo}
                      </p>
                      {leccion.duracion && (
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          {formatDuracion(leccion.duracion)}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Volver al curso */}
            <div className="border-t border-[var(--border)] p-4">
              <Link
                href={`/cursos/${cursoSlug}`}
                className="flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
                onClick={() => setOpen(false)}
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
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
                Volver al curso
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
