/**
 * Componente CursoCardPublic
 *
 * Tarjeta de curso para el catálogo público
 * Sin acciones de edición, solo información y enlace al detalle
 */

import Image from 'next/image';
import Link from 'next/link';

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

interface CursoCardPublicProps {
  curso: Curso;
}

const NIVEL_LABELS: Record<string, string> = {
  PRINCIPIANTE: 'Principiante',
  INTERMEDIO: 'Intermedio',
  AVANZADO: 'Avanzado',
};

const NIVEL_COLORS: Record<string, string> = {
  PRINCIPIANTE: 'bg-[var(--success-bg)] text-[var(--success-text)]',
  INTERMEDIO: 'bg-[var(--warning-bg)] text-[var(--warning-text)]',
  AVANZADO: 'bg-[var(--error-bg)] text-[var(--error-text)]',
};

export function CursoCardPublic({ curso }: CursoCardPublicProps) {
  const imageUrl = curso.imagen
    ? curso.imagen.startsWith('/uploads/')
      ? `/api/image${curso.imagen}`
      : curso.imagen
    : null;

  const nivelColor = NIVEL_COLORS[curso.nivel];

  return (
    <Link
      href={`/cursos/${curso.slug}`}
      className="group overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-sm transition-all hover:shadow-lg"
    >
      {/* Imagen */}
      <div className="relative aspect-video overflow-hidden bg-[var(--overlay-light)]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={curso.titulo}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              className="h-16 w-16 text-[var(--muted)]"
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
          </div>
        )}
        {/* Badge de nivel */}
        <span
          className={`absolute right-2 top-2 rounded-full px-2.5 py-1 text-xs font-medium ${nivelColor}`}
        >
          {NIVEL_LABELS[curso.nivel]}
        </span>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Categoría */}
        <span className="inline-block rounded-full bg-[var(--primary-bg)] px-3 py-1 text-xs font-medium text-[var(--primary)]">
          {curso.categoria.nombre}
        </span>

        {/* Título */}
        <h3 className="mt-3 line-clamp-2 text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">
          {curso.titulo}
        </h3>

        {/* Descripción */}
        <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">
          {curso.descripcion}
        </p>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-4 text-xs text-[var(--muted)]">
          {curso._count && curso._count.lecciones > 0 && (
            <span className="flex items-center gap-1">
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
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
              {curso._count.lecciones}{' '}
              {curso._count.lecciones === 1 ? 'lección' : 'lecciones'}
            </span>
          )}
          {curso.duracion && (
            <span className="flex items-center gap-1">
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
              {Math.floor(curso.duracion / 60)}h {curso.duracion % 60}min
            </span>
          )}
          {curso._count && curso._count.inscripciones > 0 && (
            <span className="flex items-center gap-1">
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
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
              {curso._count.inscripciones}{' '}
              {curso._count.inscripciones === 1 ? 'estudiante' : 'estudiantes'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
