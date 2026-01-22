/**
 * Componente CursoHeader
 *
 * Hero section con imagen de portada y datos principales del curso
 */

import Image from 'next/image';
import Link from 'next/link';

interface Educador {
  id: string;
  nombre: string;
  apellido: string;
  avatar: string | null;
}

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
}

interface Curso {
  titulo: string;
  imagen: string | null;
  nivel: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  categoria: Categoria;
  educador: Educador;
  _count: {
    lecciones: number;
    inscripciones: number;
  };
}

interface CursoHeaderProps {
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

export function CursoHeader({ curso }: CursoHeaderProps) {
  const imageUrl = curso.imagen
    ? curso.imagen.startsWith('/uploads/')
      ? `/api/image${curso.imagen}`
      : curso.imagen
    : null;

  const nivelColor = NIVEL_COLORS[curso.nivel];

  return (
    <div className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--background)]">
      {/* Imagen de fondo con overlay */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={curso.titulo}
              fill
              className="object-cover opacity-20 blur-sm"
              unoptimized
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--background)]" />
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[var(--primary-bg)] to-[var(--overlay-light)]" />
        )}
      </div>

      {/* Contenido */}
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Información principal */}
          <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm">
              <Link
                href="/cursos"
                className="text-[var(--muted)] transition-colors hover:text-[var(--primary)]"
              >
                Cursos
              </Link>
              <span className="text-[var(--muted)]">/</span>
              <Link
                href={`/cursos?categoriaId=${curso.categoria.id}`}
                className="text-[var(--muted)] transition-colors hover:text-[var(--primary)]"
              >
                {curso.categoria.nombre}
              </Link>
              <span className="text-[var(--muted)]">/</span>
              <span className="text-[var(--foreground)]">{curso.titulo}</span>
            </nav>

            {/* Badge de nivel */}
            <div>
              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${nivelColor}`}
              >
                {NIVEL_LABELS[curso.nivel]}
              </span>
            </div>

            {/* Título */}
            <h1 className="text-4xl font-bold text-[var(--foreground)] sm:text-5xl">
              {curso.titulo}
            </h1>

            {/* Stats y educador */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--muted)]">
              {/* Educador */}
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
                <span>
                  {curso.educador.nombre} {curso.educador.apellido}
                </span>
              </div>

              {/* Lecciones */}
              {curso._count.lecciones > 0 && (
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5"
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
                  <span>
                    {curso._count.lecciones}{' '}
                    {curso._count.lecciones === 1 ? 'lección' : 'lecciones'}
                  </span>
                </div>
              )}

              {/* Estudiantes */}
              {curso._count.inscripciones > 0 && (
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5"
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
                  <span>
                    {curso._count.inscripciones}{' '}
                    {curso._count.inscripciones === 1
                      ? 'estudiante'
                      : 'estudiantes'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Imagen destacada (visible en desktop) */}
          {imageUrl && (
            <div className="hidden lg:block">
              <div className="relative aspect-video overflow-hidden rounded-lg border border-[var(--border)] shadow-xl">
                <Image
                  src={imageUrl}
                  alt={curso.titulo}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
