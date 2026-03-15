/**
 * Componente LeccionSidebar
 *
 * Sidebar de navegación lateral con la lista de lecciones del curso.
 * Colapsable en móvil.
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
  leccionesCompletadasIds?: string[];
}

function formatDuracion(minutos: number): string {
  if (minutos >= 60) {
    return `${Math.floor(minutos / 60)}h ${minutos % 60}min`;
  }
  return `${minutos}min`;
}

export function LeccionSidebar({ lecciones, leccionActivaId, cursoSlug, leccionesCompletadasIds = [] }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const total = lecciones.length;

  return (
    <div
      data-testid="leccion-sidebar"
      data-collapsed={collapsed}
      className={`flex h-full flex-col border-r border-[var(--border)] bg-[var(--background)] transition-all duration-300 ${
        collapsed ? 'w-12' : 'w-full'
      }`}
    >
      {/* Header del sidebar */}
      <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
        {!collapsed && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              Contenido del curso
            </p>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              {total} {total === 1 ? 'lección' : 'lecciones'}
            </p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Abrir menú de lecciones' : 'Cerrar menú de lecciones'}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[var(--overlay)]"
        >
          <svg
            className={`h-5 w-5 text-[var(--foreground)] transition-transform ${
              collapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
      </div>

      {/* Lista de lecciones */}
      {!collapsed && (
        <nav className="flex-1 overflow-y-auto py-2">
          {lecciones.map((leccion, index) => {
            const isActive = leccion.id === leccionActivaId;
            const isCompleted = leccionesCompletadasIds.includes(leccion.id);

            return (
              <Link
                key={leccion.id}
                href={`/cursos/${cursoSlug}/lecciones/${leccion.id}`}
                aria-current={isActive ? 'true' : undefined}
                className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--overlay)] ${
                  isActive
                    ? 'border-r-2 border-primary bg-[var(--primary-bg)] hover:bg-[var(--primary-bg)]'
                    : ''
                }`}
              >
                {/* Indicador de número/completado */}
                <div
                  className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isActive
                      ? 'bg-primary text-white'
                      : isCompleted
                        ? 'bg-green-100 text-green-700'
                        : 'bg-[var(--overlay)] text-[var(--muted)]'
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="3"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Título y duración */}
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
      )}

      {/* Volver al curso */}
      {!collapsed && (
        <div className="border-t border-[var(--border)] p-4">
          <Link
            href={`/cursos/${cursoSlug}`}
            className="flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
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
      )}
    </div>
  );
}
