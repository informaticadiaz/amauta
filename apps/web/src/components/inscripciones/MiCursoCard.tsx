/**
 * Componente MiCursoCard
 *
 * Tarjeta que muestra un curso inscrito con su progreso.
 */

import Link from 'next/link';
import Image from 'next/image';

type EstadoInscripcion = 'ACTIVO' | 'COMPLETADO' | 'ABANDONADO';
type NivelCurso = 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';

interface MiCursoCardProps {
  inscripcion: {
    id: string;
    estado: EstadoInscripcion;
    progreso: number;
    inscritoEn: string;
    curso: {
      id: string;
      titulo: string;
      slug: string;
      imagen: string | null;
      nivel: NivelCurso;
      educador: {
        nombre: string;
        apellido: string;
      };
      _count?: {
        lecciones: number;
      };
    };
  };
}

const NIVEL_LABELS: Record<NivelCurso, string> = {
  PRINCIPIANTE: 'Principiante',
  INTERMEDIO: 'Intermedio',
  AVANZADO: 'Avanzado',
};

const ESTADO_CONFIG: Record<
  EstadoInscripcion,
  { label: string; className: string }
> = {
  ACTIVO: {
    label: 'En progreso',
    className: 'bg-blue-100 text-blue-800',
  },
  COMPLETADO: {
    label: 'Completado',
    className: 'bg-green-100 text-green-800',
  },
  ABANDONADO: {
    label: 'Abandonado',
    className: 'bg-gray-100 text-gray-600',
  },
};

export function MiCursoCard({ inscripcion }: MiCursoCardProps) {
  const { curso, estado, progreso, inscritoEn } = inscripcion;
  const estadoConfig = ESTADO_CONFIG[estado];

  const fechaInscripcion = new Date(inscritoEn).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--background)] overflow-hidden transition-shadow hover:shadow-md">
      {/* Imagen */}
      <div className="relative h-40 w-full bg-[var(--border)]">
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
              className="h-12 w-12 text-[var(--muted)]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
              />
            </svg>
          </div>
        )}

        {/* Badge de estado */}
        <span
          className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-medium ${estadoConfig.className}`}
        >
          {estadoConfig.label}
        </span>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col p-4">
        {/* Nivel */}
        <span className="mb-1 text-xs font-medium text-[var(--muted)]">
          {NIVEL_LABELS[curso.nivel]}
        </span>

        {/* Título */}
        <h3 className="mb-1 font-semibold text-[var(--foreground)] line-clamp-2">
          {curso.titulo}
        </h3>

        {/* Educador */}
        <p className="mb-4 text-sm text-[var(--muted)]">
          {curso.educador.nombre} {curso.educador.apellido}
        </p>

        {/* Barra de progreso */}
        <div className="mb-1 flex items-center justify-between text-xs text-[var(--muted)]">
          <span>Progreso</span>
          <span className="font-medium text-[var(--foreground)]">
            {progreso}%
          </span>
        </div>
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className={`h-full rounded-full transition-all ${
              progreso === 100 ? 'bg-green-500' : 'bg-primary'
            }`}
            style={{ width: `${progreso}%` }}
          />
        </div>

        {/* Fecha */}
        <p className="mb-4 text-xs text-[var(--muted)]">
          Inscripto el {fechaInscripcion}
        </p>

        {/* Botón */}
        <div className="mt-auto">
          <Link
            href={`/cursos/${curso.slug}`}
            className="block w-full rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-primary/90 hover:no-underline"
          >
            {progreso === 0
              ? 'Comenzar'
              : progreso === 100
                ? 'Ver curso'
                : 'Continuar'}
          </Link>
        </div>
      </div>
    </article>
  );
}
