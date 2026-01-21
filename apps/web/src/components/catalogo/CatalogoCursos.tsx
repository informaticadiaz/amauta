/**
 * Componente CatalogoCursos
 *
 * Grid de cursos con paginación y estado vacío
 */

import { CursoCardPublic } from './CursoCardPublic';
import { PaginacionCursos } from './PaginacionCursos';

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  slug: string;
  imagen: string | null;
  nivel: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  duracion: number | null;
  categoria: {
    id: string;
    nombre: string;
  };
  _count?: {
    lecciones: number;
    inscripciones: number;
  };
}

interface CursosData {
  cursos: Curso[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CatalogoCursosProps {
  cursosData: CursosData;
}

export function CatalogoCursos({ cursosData }: CatalogoCursosProps) {
  const { cursos, total, page, totalPages } = cursosData;

  // Estado vacío
  if (cursos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--border)] bg-white py-20 text-center">
        <svg
          className="mb-4 h-20 w-20 text-[var(--muted)]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <h3 className="mb-2 text-xl font-semibold text-[var(--foreground)]">
          No se encontraron cursos
        </h3>
        <p className="max-w-md text-sm text-[var(--muted)]">
          Intenta ajustar tus filtros de búsqueda o explora otras categorías.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Contador de resultados */}
      <div className="text-sm text-[var(--muted)]">
        Mostrando {cursos.length} de {total} {total === 1 ? 'curso' : 'cursos'}
      </div>

      {/* Grid de cursos */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cursos.map((curso) => (
          <CursoCardPublic key={curso.id} curso={curso} />
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <PaginacionCursos currentPage={page} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
