/**
 * Página pública de catálogo de cursos
 *
 * Server Component que muestra cursos publicados con búsqueda y filtros
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { api } from '@/lib/api';
import { CatalogoCursos } from '@/components/catalogo/CatalogoCursos';
import { BuscadorCursos } from '@/components/catalogo/BuscadorCursos';
import { FiltrosCursos } from '@/components/catalogo/FiltrosCursos';

export const metadata: Metadata = {
  title: 'Catálogo de Cursos | Amauta',
  description:
    'Explora cursos disponibles en Amauta - Educación como derecho social',
  openGraph: {
    title: 'Catálogo de Cursos | Amauta',
    description: 'Explora cursos disponibles en Amauta',
  },
};

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
}

interface CategoriasResponse {
  categorias: Categoria[];
}

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  slug: string;
  imagen: string | null;
  nivel: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  duracion: number | null;
  categoria: {
    id: string;
    nombre: string;
  };
  _count?: {
    lecciones: number;
    inscripciones: number;
  };
}

interface CursosResponse {
  cursos: Curso[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PageProps {
  searchParams: {
    page?: string;
    buscar?: string;
    categoriaId?: string;
    nivel?: string;
    ordenarPor?: string;
    orden?: string;
  };
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

async function getCursos(
  params: PageProps['searchParams']
): Promise<CursosResponse> {
  try {
    const queryParams = new URLSearchParams();

    // Solo cursos publicados para el catálogo público
    queryParams.set('estado', 'PUBLICADO');

    if (params.page) queryParams.set('page', params.page);
    if (params.buscar) queryParams.set('buscar', params.buscar);
    if (params.categoriaId) queryParams.set('categoriaId', params.categoriaId);
    if (params.nivel) queryParams.set('nivel', params.nivel);
    if (params.ordenarPor) queryParams.set('ordenarPor', params.ordenarPor);
    if (params.orden) queryParams.set('orden', params.orden);

    // Más resultados por página en catálogo público
    queryParams.set('limit', '12');

    const data = await api.get<CursosResponse>(
      `/cursos?${queryParams.toString()}`
    );
    return data;
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    return {
      cursos: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
    };
  }
}

export default async function CursosPage({ searchParams }: PageProps) {
  const [categorias, cursosData] = await Promise.all([
    getCategorias(),
    getCursos(searchParams),
  ]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-[var(--foreground)]">
            Catálogo de Cursos
          </h1>
          <p className="mt-2 text-lg text-[var(--muted)]">
            Explora nuestros cursos y comienza a aprender
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Buscador */}
        <Suspense
          fallback={
            <div className="h-12 w-full animate-pulse rounded-lg bg-gray-100" />
          }
        >
          <BuscadorCursos />
        </Suspense>

        <div className="mt-8 grid gap-8 lg:grid-cols-[250px_1fr]">
          {/* Filtros laterales */}
          <aside>
            <Suspense
              fallback={
                <div className="h-64 w-full animate-pulse rounded-lg bg-gray-100" />
              }
            >
              <FiltrosCursos categorias={categorias} />
            </Suspense>
          </aside>

          {/* Grid de cursos */}
          <main>
            <Suspense
              fallback={
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-96 animate-pulse rounded-lg bg-gray-100"
                    />
                  ))}
                </div>
              }
            >
              <CatalogoCursos cursosData={cursosData} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
