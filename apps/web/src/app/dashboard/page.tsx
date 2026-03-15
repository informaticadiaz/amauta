/**
 * Dashboard principal
 *
 * Para estudiantes: muestra cursos en progreso, estadísticas y recomendaciones.
 * Para educadores/admins: muestra accesos rápidos a la gestión.
 */

import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ContinuarAprendiendo } from '@/components/dashboard/ContinuarAprendiendo';
import { ResumenProgreso } from '@/components/dashboard/ResumenProgreso';
import { CursosRecomendados } from '@/components/dashboard/CursosRecomendados';

export const metadata: Metadata = {
  title: 'Dashboard - Amauta',
  description: 'Tu panel de control en Amauta',
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
    educador: { nombre: string; apellido: string };
    _count?: { lecciones: number };
  };
}

interface CursoPublico {
  id: string;
  titulo: string;
  slug: string;
  imagen: string | null;
  nivel: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  descripcion: string;
  educador: { nombre: string; apellido: string };
  _count?: { lecciones: number };
}

async function getMisCursos(): Promise<Inscripcion[]> {
  try {
    const data = await api.get<{ inscripciones: Inscripcion[] }>(
      '/mis-cursos?limit=50'
    );
    return data.inscripciones ?? [];
  } catch {
    return [];
  }
}

async function getCursosRecomendados(
  inscripcionIds: string[]
): Promise<CursoPublico[]> {
  try {
    const API_URL = process.env.API_URL || 'http://localhost:3001';
    const res = await fetch(
      `${API_URL}/api/v1/cursos?limit=6&estado=PUBLICADO`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const todos: CursoPublico[] = data.cursos ?? [];
    // Filtrar los ya inscritos y tomar hasta 3
    return todos.filter((c) => !inscripcionIds.includes(c.id)).slice(0, 3);
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { user } = session;
  const isEstudiante = user.rol === 'ESTUDIANTE';

  // Para estudiantes: cargar datos de inscripciones y recomendaciones
  const inscripciones = isEstudiante ? await getMisCursos() : [];
  const activas = inscripciones.filter((i) => i.estado === 'ACTIVO');
  const completadas = inscripciones.filter((i) => i.estado === 'COMPLETADO');
  const cursosInscritos = inscripciones.map((i) => i.curso.id);
  const recomendados = isEstudiante
    ? await getCursosRecomendados(cursosInscritos)
    : [];

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Bienvenido, {user.name}
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          {isEstudiante
            ? 'Continuá donde te quedaste o explorá nuevos cursos.'
            : 'Gestioná tus cursos y seguí el progreso de tus estudiantes.'}
        </p>
      </header>

      {isEstudiante ? (
        /* ── Dashboard del estudiante ── */
        <div className="space-y-10">
          {/* Estadísticas */}
          <ResumenProgreso
            enProgreso={activas.length}
            completados={completadas.length}
            totalInscritos={inscripciones.length}
          />

          {/* Continuar aprendiendo */}
          <ContinuarAprendiendo inscripciones={activas} />

          {/* Cursos recomendados */}
          <CursosRecomendados cursos={recomendados} />
        </div>
      ) : (
        /* ── Dashboard de educador / admin ── */
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
            <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
              Gestión de cursos
            </h2>
            <p className="mb-4 text-sm text-[var(--muted)]">
              Creá y editá cursos, gestioná lecciones y seguí el progreso de tus
              estudiantes.
            </p>
            <Link
              href="/dashboard/cursos"
              className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 hover:no-underline"
            >
              Ver mis cursos
            </Link>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
            <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
              Tu información
            </h2>
            <dl className="space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-[var(--muted)]">Email</dt>
                <dd className="text-sm text-[var(--foreground)]">
                  {user.email}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-[var(--muted)]">Rol</dt>
                <dd>
                  <span className="inline-block rounded bg-primary/10 px-2 py-1 text-xs font-semibold uppercase text-primary">
                    {user.rol}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
