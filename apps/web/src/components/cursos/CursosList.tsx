'use client';

/**
 * Componente CursosList
 *
 * Lista de cursos del educador en formato grid
 */

import { CursoCard } from './CursoCard';

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  slug: string;
  imagen: string | null;
  nivel: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  estado: 'BORRADOR' | 'REVISION' | 'PUBLICADO' | 'ARCHIVADO';
  categoria: {
    id: string;
    nombre: string;
  };
  _count?: {
    lecciones: number;
    inscripciones: number;
  };
}

interface CursosListProps {
  cursos: Curso[];
  onPublishToggle?: (id: string, publicar: boolean) => Promise<void>;
}

export function CursosList({ cursos, onPublishToggle }: CursosListProps) {
  if (cursos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--border)] py-16 text-center">
        <svg
          className="mb-4 h-16 w-16 text-[var(--muted)]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
        <h3 className="mb-2 text-lg font-semibold text-[var(--foreground)]">
          No tienes cursos aún
        </h3>
        <p className="mb-4 max-w-sm text-sm text-[var(--muted)]">
          Crea tu primer curso para comenzar a compartir conocimiento con tus
          estudiantes.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cursos.map((curso) => (
        <CursoCard
          key={curso.id}
          curso={curso}
          onPublishToggle={onPublishToggle}
        />
      ))}
    </div>
  );
}
