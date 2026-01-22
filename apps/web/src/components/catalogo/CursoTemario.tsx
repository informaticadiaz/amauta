/**
 * Componente CursoTemario
 *
 * Muestra el listado de lecciones del curso ordenadas
 */

interface Leccion {
  id: string;
  titulo: string;
  orden: number;
  duracion: number | null;
  publicada: boolean;
}

interface CursoTemarioProps {
  lecciones: Leccion[];
}

export function CursoTemario({ lecciones }: CursoTemarioProps) {
  // Filtrar solo lecciones publicadas
  const leccionesPublicadas = lecciones.filter((leccion) => leccion.publicada);

  if (leccionesPublicadas.length === 0) {
    return null;
  }

  // Calcular duración total
  const duracionTotal = leccionesPublicadas.reduce((total, leccion) => {
    return total + (leccion.duracion || 0);
  }, 0);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          Contenido del curso
        </h2>
        <div className="text-sm text-[var(--muted)]">
          {leccionesPublicadas.length}{' '}
          {leccionesPublicadas.length === 1 ? 'lección' : 'lecciones'}
          {duracionTotal > 0 && (
            <>
              {' • '}
              {Math.floor(duracionTotal / 60)}h {duracionTotal % 60}min
            </>
          )}
        </div>
      </div>

      {/* Lista de lecciones */}
      <div className="space-y-2">
        {leccionesPublicadas.map((leccion, index) => (
          <div
            key={leccion.id}
            className="flex items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--overlay-light)] p-4 transition-colors hover:bg-[var(--overlay)]"
          >
            {/* Número de lección */}
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary-bg)] text-sm font-semibold text-[var(--primary)]">
              {index + 1}
            </div>

            {/* Título */}
            <div className="flex-1">
              <h3 className="font-medium text-[var(--foreground)]">
                {leccion.titulo}
              </h3>
            </div>

            {/* Duración */}
            {leccion.duracion && (
              <div className="flex items-center gap-1 text-sm text-[var(--muted)]">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  {leccion.duracion >= 60
                    ? `${Math.floor(leccion.duracion / 60)}h ${leccion.duracion % 60}min`
                    : `${leccion.duracion}min`}
                </span>
              </div>
            )}

            {/* Icono de lección */}
            <svg
              className="h-5 w-5 text-[var(--muted)]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
