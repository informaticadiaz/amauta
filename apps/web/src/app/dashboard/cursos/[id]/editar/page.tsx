/**
 * Página de editar curso
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { CursoForm } from '@/components/cursos/CursoForm';

export const metadata: Metadata = {
  title: 'Editar Curso | Amauta',
  description: 'Edita tu curso en Amauta',
};

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
}

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  categoriaId: string;
  nivel: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  imagen: string | null;
  duracion: number | null;
  idioma: string;
  estado: 'BORRADOR' | 'REVISION' | 'PUBLICADO' | 'ARCHIVADO';
}

interface CursoResponse {
  curso: Curso;
}

interface CategoriasResponse {
  categorias: Categoria[];
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

async function getCategorias(): Promise<Categoria[]> {
  try {
    const data = await api.get<CategoriasResponse>('/categorias');
    return data.categorias;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return [];
  }
}

export default async function EditarCursoPage({ params }: PageProps) {
  const { id } = await params;
  const [curso, categorias] = await Promise.all([
    getCurso(id),
    getCategorias(),
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
        <span className="text-[var(--foreground)]">Editar</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Editar curso
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Modifica la información de &quot;{curso.titulo}&quot;
        </p>
      </div>

      {/* Estado del curso */}
      {curso.estado === 'ARCHIVADO' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-medium">Este curso está archivado</p>
          <p className="mt-1 text-sm">
            No puedes editar un curso archivado. Contacta a un administrador si
            necesitas restaurarlo.
          </p>
        </div>
      )}

      {/* Formulario */}
      {curso.estado !== 'ARCHIVADO' && (
        <CursoForm curso={curso} categorias={categorias} />
      )}
    </div>
  );
}
