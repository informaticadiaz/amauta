/**
 * Página: Mis Cursos
 *
 * Lista los cursos en los que el estudiante está inscrito.
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { MiCursoCard } from '@/components/inscripciones/MiCursoCard';

export const metadata: Metadata = {
  title: 'Mis Cursos | Amauta',
  description: 'Tus cursos inscritos en Amauta',
};

type EstadoInscripcion = 'ACTIVO' | 'COMPLETADO' | 'ABANDONADO';

interface Inscripcion {
  id: string;
  estado: EstadoInscripcion;
  progreso: number;
  inscritoEn: string;
  completadoEn: string | null;
  curso: {
    id: string;
    titulo: string;
    slug: string;
    imagen: string | null;
    nivel: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
    educador: {
      nombre: string;
      apellido: string;
    };
    _count?: {
      lecciones: number;
    };
  };
}

interface MisCursosResponse {
  inscripciones: Inscripcion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function getMisCursos(): Promise<MisCursosResponse> {
  try {
    return await api.get<MisCursosResponse>('/mis-cursos?limit=50');
  } catch {
    return { inscripciones: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  }
}

export default async function MisCursosPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { inscripciones, total } = await getMisCursos();

  // Separar por estado
  const activas = inscripciones.filter((i) => i.estado === 'ACTIVO');
  const completadas = inscripciones.filter((i) => i.estado === 'COMPLETADO');

  return (
    <div>
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Mis cursos
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            {total === 0
              ? 'Aún no estás inscrito en ningún curso'
              : `${total} ${total === 1 ? 'curso inscrito' : 'cursos inscritos'}`}
          </p>
        </div>
        <Link
          href="/cursos"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 hover:no-underline"
        >
          Explorar cursos
        </Link>
      </header>

      {/* Estado vacío */}
      {total === 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-12 text-center">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-[var(--muted)]"
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
          <h2 className="mb-2 text-lg font-semibold text-[var(--foreground)]">
            Todavía no tenés cursos
          </h2>
          <p className="mb-6 text-[var(--muted)]">
            Explorá el catálogo y comenzá a aprender hoy.
          </p>
          <Link
            href="/cursos"
            className="inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90 hover:no-underline"
          >
            Ver catálogo de cursos
          </Link>
        </div>
      )}

      {/* Cursos en progreso */}
      {activas.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-[var(--foreground)]">
            En progreso
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-sm font-medium text-primary">
              {activas.length}
            </span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activas.map((inscripcion) => (
              <MiCursoCard key={inscripcion.id} inscripcion={inscripcion} />
            ))}
          </div>
        </section>
      )}

      {/* Cursos completados */}
      {completadas.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-[var(--foreground)]">
            Completados
            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-sm font-medium text-green-800">
              {completadas.length}
            </span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {completadas.map((inscripcion) => (
              <MiCursoCard key={inscripcion.id} inscripcion={inscripcion} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
