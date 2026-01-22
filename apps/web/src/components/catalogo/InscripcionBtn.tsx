/**
 * Componente InscripcionBtn
 *
 * Botón de inscripción con información del curso
 * TODO F1-011: Implementar lógica de inscripción real
 */

'use client';

interface InscripcionBtnProps {
  cursoId: string;
  cursoTitulo: string;
  totalLecciones: number;
  duracion: number | null;
}

export function InscripcionBtn({
  totalLecciones,
  duracion,
}: InscripcionBtnProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6 shadow-lg">
      {/* Información del curso */}
      <div className="mb-6 space-y-4">
        {/* Lecciones */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">Lecciones</span>
          <span className="font-semibold text-[var(--foreground)]">
            {totalLecciones}
          </span>
        </div>

        {/* Duración */}
        {duracion && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--muted)]">Duración total</span>
            <span className="font-semibold text-[var(--foreground)]">
              {Math.floor(duracion / 60)}h {duracion % 60}min
            </span>
          </div>
        )}

        {/* Acceso */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">Acceso</span>
          <span className="font-semibold text-[var(--foreground)]">
            Gratuito
          </span>
        </div>
      </div>

      {/* Botón de inscripción (deshabilitado por ahora) */}
      <button
        disabled
        className="w-full rounded-lg bg-[var(--muted)] px-6 py-3 font-semibold text-white transition-colors cursor-not-allowed"
        title="La funcionalidad de inscripción estará disponible próximamente"
      >
        Inscripción próximamente
      </button>

      {/* Mensaje informativo */}
      <p className="mt-4 text-center text-xs text-[var(--muted)]">
        La funcionalidad de inscripción estará disponible próximamente
      </p>

      {/* Features */}
      <div className="mt-6 space-y-3 border-t border-[var(--border)] pt-6">
        <div className="flex items-start gap-3 text-sm">
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
          <span className="text-[var(--foreground)]">
            Acceso completo al curso
          </span>
        </div>

        <div className="flex items-start gap-3 text-sm">
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
          <span className="text-[var(--foreground)]">
            Material de estudio descargable
          </span>
        </div>

        <div className="flex items-start gap-3 text-sm">
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
          <span className="text-[var(--foreground)]">
            Acceso desde cualquier dispositivo
          </span>
        </div>
      </div>
    </div>
  );
}
