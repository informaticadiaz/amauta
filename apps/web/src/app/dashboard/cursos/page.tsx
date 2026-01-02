/**
 * Página de lista de cursos del educador
 *
 * Muestra todos los cursos creados por el educador autenticado
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CursosActions } from './CursosActions';

export const metadata: Metadata = {
  title: 'Mis Cursos | Amauta',
  description: 'Gestiona tus cursos en Amauta',
};

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
  _count: {
    lecciones: number;
    inscripciones: number;
  };
}

interface CursosResponse {
  cursos: Curso[];
  total: number;
}

async function getMisCursos(): Promise<Curso[]> {
  try {
    const data = await api.get<CursosResponse>('/cursos/mis-cursos');
    return data.cursos;
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    return [];
  }
}

export default async function CursosPage() {
  const cursos = await getMisCursos();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Mis Cursos
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {cursos.length === 0
              ? 'Comienza creando tu primer curso'
              : `${cursos.length} curso${cursos.length !== 1 ? 's' : ''} en total`}
          </p>
        </div>

        <Link
          href="/dashboard/cursos/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Crear curso
        </Link>
      </div>

      {/* Lista de cursos con acciones client-side */}
      <CursosActions cursos={cursos} />
    </div>
  );
}
