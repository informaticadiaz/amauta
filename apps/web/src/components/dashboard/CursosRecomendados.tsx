/**
 * Componente CursosRecomendados
 *
 * Muestra cursos sugeridos para el estudiante basados en
 * cursos publicados disponibles en el catálogo.
 */

import Link from 'next/link';
import Image from 'next/image';

type NivelCurso = 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';

interface CursoRecomendado {
  id: string;
  titulo: string;
  slug: string;
  imagen: string | null;
  nivel: NivelCurso;
  descripcion: string;
  educador: { nombre: string; apellido: string };
  _count?: { lecciones: number };
}

interface Props {
  cursos: CursoRecomendado[];
}

const NIVEL_LABELS: Record<NivelCurso, string> = {
  PRINCIPIANTE: 'Principiante',
  INTERMEDIO: 'Intermedio',
  AVANZADO: 'Avanzado',
};

export function CursosRecomendados({ cursos }: Props) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          Cursos recomendados
        </h2>
        <Link
          href="/cursos"
          className="text-sm font-medium text-primary hover:underline"
        >
          Ver catálogo
        </Link>
      </div>

      {cursos.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-8 text-center">
          <p className="text-[var(--muted)]">
            Explorá el catálogo para encontrar cursos que te interesen.{' '}
            <Link
              href="/cursos"
              className="font-medium text-primary hover:underline"
            >
              Ver todos los cursos
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cursos.map((curso) => (
            <Link
              key={curso.id}
              href={`/cursos/${curso.slug}`}
              className="group flex flex-col rounded-xl border border-[var(--border)] bg-[var(--background)] overflow-hidden transition-shadow hover:shadow-md hover:no-underline"
            >
              {/* Imagen */}
              <div className="relative h-32 w-full bg-[var(--border)]">
                {curso.imagen ? (
                  <Image
                    src={
                      curso.imagen.startsWith('/uploads/')
                        ? `${process.env.NEXT_PUBLIC_API_URL}/api/image${curso.imagen}`
                        : curso.imagen
                    }
                    alt={curso.titulo}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <svg
                      className="h-10 w-10 text-[var(--muted)]"
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
              </div>

              {/* Contenido */}
              <div className="flex flex-1 flex-col p-4">
                <span className="mb-1 inline-block rounded bg-[var(--border)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
                  {NIVEL_LABELS[curso.nivel]}
                </span>
                <h3 className="mb-1 font-semibold text-[var(--foreground)] line-clamp-2 group-hover:text-primary transition-colors">
                  {curso.titulo}
                </h3>
                <p className="text-xs text-[var(--muted)] line-clamp-2">
                  {curso.descripcion}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
