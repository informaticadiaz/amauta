/**
 * Página de crear nueva lección
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { LeccionForm } from '@/components/lecciones';

export const metadata: Metadata = {
  title: 'Nueva Lección | Amauta',
  description: 'Crea una nueva lección para tu curso',
};

interface Curso {
  id: string;
  titulo: string;
}

interface CursoResponse {
  curso: Curso;
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

export default async function NuevaLeccionPage({ params }: PageProps) {
  const { id } = await params;
  const curso = await getCurso(id);

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
        <Link
          href={`/dashboard/cursos/${id}/lecciones`}
          className="hover:text-[var(--foreground)] hover:underline truncate max-w-[200px]"
        >
          {curso.titulo}
        </Link>
        <span>/</span>
        <span className="text-[var(--foreground)]">Nueva lección</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Nueva lección
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Agrega una nueva lección a &quot;{curso.titulo}&quot;
        </p>
      </div>

      {/* Formulario */}
      <LeccionForm cursoId={id} />
    </div>
  );
}
