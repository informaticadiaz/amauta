/**
 * Página de crear nuevo curso
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CursoForm } from '@/components/cursos/CursoForm';

export const metadata: Metadata = {
  title: 'Crear Curso | Amauta',
  description: 'Crea un nuevo curso en Amauta',
};

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
}

interface CategoriasResponse {
  categorias: Categoria[];
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

export default async function NuevoCursoPage() {
  const categorias = await getCategorias();

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
        <span className="text-[var(--foreground)]">Nuevo</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Crear nuevo curso
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Completa la información para crear tu curso. Podrás agregar lecciones
          después de crearlo.
        </p>
      </div>

      {/* Formulario */}
      {categorias.length === 0 ? (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
          <p className="font-medium">No hay categorías disponibles</p>
          <p className="mt-1 text-sm">
            Contacta a un administrador para que cree categorías antes de poder
            crear cursos.
          </p>
        </div>
      ) : (
        <CursoForm categorias={categorias} />
      )}
    </div>
  );
}
