/**
 * Página de editar lección
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { LeccionForm } from '@/components/lecciones';

export const metadata: Metadata = {
  title: 'Editar Lección | Amauta',
  description: 'Edita una lección de tu curso',
};

interface Curso {
  id: string;
  titulo: string;
}

interface Leccion {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: 'TEXTO' | 'VIDEO' | 'QUIZ' | 'INTERACTIVO' | 'DESCARGABLE';
  duracion: number | null;
  contenido: {
    texto?: string;
    videoUrl?: string;
  };
  publicada: boolean;
  cursoId: string;
}

interface CursoResponse {
  curso: Curso;
}

interface LeccionResponse {
  leccion: Leccion;
}

interface PageProps {
  params: Promise<{ id: string; leccionId: string }>;
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

async function getLeccion(leccionId: string): Promise<Leccion | null> {
  try {
    const data = await api.get<LeccionResponse>(`/lecciones/${leccionId}`);
    return data.leccion;
  } catch (error) {
    if (error instanceof ApiClientError && error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

export default async function EditarLeccionPage({ params }: PageProps) {
  const { id, leccionId } = await params;
  const [curso, leccion] = await Promise.all([
    getCurso(id),
    getLeccion(leccionId),
  ]);

  if (!curso || !leccion) {
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
        <Link
          href={`/dashboard/cursos/${id}/lecciones`}
          className="hover:text-[var(--foreground)] hover:underline truncate max-w-[200px]"
        >
          {curso.titulo}
        </Link>
        <span>/</span>
        <span className="text-[var(--foreground)]">Editar</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Editar lección
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Modifica &quot;{leccion.titulo}&quot;
        </p>
      </div>

      {/* Formulario */}
      <LeccionForm cursoId={id} leccion={leccion} />
    </div>
  );
}
