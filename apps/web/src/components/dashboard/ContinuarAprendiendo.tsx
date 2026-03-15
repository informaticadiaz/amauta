/**
 * Componente ContinuarAprendiendo
 *
 * Sección del dashboard que muestra los cursos en progreso del estudiante
 * con acceso directo para continuar aprendiendo.
 */

import Link from 'next/link';
import Image from 'next/image';

type NivelCurso = 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';

interface Inscripcion {
  id: string;
  estado: 'ACTIVO' | 'COMPLETADO' | 'ABANDONADO';
  progreso: number;
  inscritoEn: string;
  curso: {
    id: string;
    titulo: string;
    slug: string;
    imagen: string | null;
    nivel: NivelCurso;
    educador: { nombre: string; apellido: string };
    _count?: { lecciones: number };
  };
}

interface Props {
  inscripciones: Inscripcion[];
}

const NIVEL_LABELS: Record<NivelCurso, string> = {
  PRINCIPIANTE: 'Principiante',
  INTERMEDIO: 'Intermedio',
  AVANZADO: 'Avanzado',
};

export function ContinuarAprendiendo({ inscripciones }: Props) {
  const cursosActivos = inscripciones.slice(0, 3);

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-[var(--foreground)]">
        Continuar aprendiendo
        {inscripciones.length > 0 && (
          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-sm font-medium text-primary">
            {inscripciones.length}
          </span>
        )}
      </h2>

      {cursosActivos.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-8 text-center">
          <p className="text-[var(--muted)]">
            No tenés cursos en progreso.{' '}
            <Link
              href="/cursos"
              className="font-medium text-primary hover:underline"
            >
              Explorá el catálogo
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cursosActivos.map((inscripcion) => {
            const { curso, progreso } = inscripcion;
            return (
              <article
                key={inscripcion.id}
                className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--background)] overflow-hidden transition-shadow hover:shadow-md"
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
                  <span className="mb-1 text-xs text-[var(--muted)]">
                    {NIVEL_LABELS[curso.nivel]}
                  </span>
                  <h3 className="mb-1 font-semibold text-[var(--foreground)] line-clamp-2">
                    {curso.titulo}
                  </h3>
                  <p className="mb-3 text-sm text-[var(--muted)]">
                    {curso.educador.nombre} {curso.educador.apellido}
                  </p>

                  {/* Barra de progreso */}
                  <div className="mb-1 flex items-center justify-between text-xs text-[var(--muted)]">
                    <span>Progreso</span>
                    <span className="font-medium text-[var(--foreground)]">
                      {progreso}%
                    </span>
                  </div>
                  <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progreso}%` }}
                    />
                  </div>

                  <div className="mt-auto">
                    <Link
                      href={`/cursos/${curso.slug}`}
                      className="block w-full rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-primary/90 hover:no-underline"
                    >
                      Continuar
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
