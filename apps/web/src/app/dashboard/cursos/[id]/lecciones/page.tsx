/**
 * Página de lista de lecciones del curso
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { LeccionesList } from '@/components/lecciones';

export const metadata: Metadata = {
  title: 'Lecciones del Curso | Amauta',
  description: 'Gestiona las lecciones de tu curso',
};

interface Curso {
  id: string;
  titulo: string;
  estado: string;
}

interface Leccion {
  id: string;
  titulo: string;
  descripcion: string | null;
  orden: number;
  tipo: 'TEXTO' | 'VIDEO' | 'QUIZ' | 'INTERACTIVO' | 'DESCARGABLE';
  duracion: number | null;
  publicada: boolean;
}

interface CursoResponse {
  curso: Curso;
}

interface LeccionesResponse {
  lecciones: Leccion[];
  total: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getCurso(id: string): Promise<Curso | null> {
  try {
    const data = await api.get<CursoResponse>(`/cursos/${id}`);
    return data.curso;
  } catch (error) {
    if (error instanceof ApiClientError && error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

async function getLecciones(cursoId: string): Promise<Leccion[]> {
  try {
    const data = await api.get<LeccionesResponse>(
      `/cursos/${cursoId}/lecciones`
    );
    return data.lecciones;
  } catch (error) {
    console.error('Error al obtener lecciones:', error);
    return [];
  }
}

export default async function LeccionesPage({ params }: PageProps) {
  const { id } = await params;
  const [curso, lecciones] = await Promise.all([
    getCurso(id),
    getLecciones(id),
  ]);

  if (!curso) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <Link
          href="/dashboard"
          className="hover:text-[var(--foreground)] hover:underline"
        >
          Dashboard
        </Link>
        <span>/</span>
        <Link
          href="/dashboard/cursos"
          className="hover:text-[var(--foreground)] hover:underline"
        >
          Cursos
        </Link>
        <span>/</span>
        <span className="text-[var(--foreground)] truncate max-w-[200px]">
          {curso.titulo}
        </span>
        <span>/</span>
        <span className="text-[var(--foreground)]">Lecciones</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Lecciones
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {lecciones.length === 0
              ? 'Agrega lecciones a tu curso'
              : `${lecciones.length} lección${lecciones.length !== 1 ? 'es' : ''} en total`}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/dashboard/cursos/${id}/editar`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--border)]"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Volver al curso
          </Link>
          <Link
            href={`/dashboard/cursos/${id}/lecciones/nueva`}
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
            Nueva lección
          </Link>
        </div>
      </div>

      {/* Instrucciones */}
      {lecciones.length > 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
          <p>
            <strong>Tip:</strong> Arrastra las lecciones para reordenarlas. Los
            cambios se guardan automáticamente.
          </p>
        </div>
      )}

      {/* Lista de lecciones */}
      <LeccionesList cursoId={id} lecciones={lecciones} />
    </div>
  );
}
