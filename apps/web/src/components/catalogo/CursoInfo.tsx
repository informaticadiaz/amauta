/**
 * Componente CursoInfo
 *
 * Muestra la información detallada del curso (descripción, idioma, etc.)
 */

interface Curso {
  descripcion: string;
  idioma: string;
  nivel: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
}

interface CursoInfoProps {
  curso: Curso;
}

const NIVEL_LABELS: Record<string, string> = {
  PRINCIPIANTE: 'Principiante',
  INTERMEDIO: 'Intermedio',
  AVANZADO: 'Avanzado',
};

export function CursoInfo({ curso }: CursoInfoProps) {
  return (
    <div className="space-y-8 rounded-lg border border-[var(--border)] bg-[var(--background)] p-6">
      {/* Título de sección */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          Acerca de este curso
        </h2>
      </div>

      {/* Descripción */}
      <div className="prose prose-sm max-w-none">
        <p className="whitespace-pre-wrap text-[var(--foreground)]">
          {curso.descripcion}
        </p>
      </div>

      {/* Información adicional */}
      <div className="border-t border-[var(--border)] pt-6">
        <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
          Detalles del curso
        </h3>
        <dl className="grid gap-4 sm:grid-cols-2">
          {/* Nivel */}
          <div>
            <dt className="text-sm font-medium text-[var(--muted)]">Nivel</dt>
            <dd className="mt-1 text-sm text-[var(--foreground)]">
              {NIVEL_LABELS[curso.nivel]}
            </dd>
          </div>

          {/* Idioma */}
          <div>
            <dt className="text-sm font-medium text-[var(--muted)]">Idioma</dt>
            <dd className="mt-1 text-sm text-[var(--foreground)]">
              {curso.idioma}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
