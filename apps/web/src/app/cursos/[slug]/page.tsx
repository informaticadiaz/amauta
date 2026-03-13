/**
 * Página de detalle de curso
 *
 * Server Component que muestra información completa del curso
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { CursoHeader } from '@/components/catalogo/CursoHeader';
import { CursoInfo } from '@/components/catalogo/CursoInfo';
import { CursoTemario } from '@/components/catalogo/CursoTemario';
import { EducadorCard } from '@/components/catalogo/EducadorCard';
import { InscripcionBtn } from '@/components/catalogo/InscripcionBtn';

interface Leccion {
  id: string;
  titulo: string;
  orden: number;
  duracion: number | null;
  publicada: boolean;
}

interface Educador {
  id: string;
  nombre: string;
  apellido: string;
  avatar: string | null;
}

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
}

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  slug: string;
  imagen: string | null;
  nivel: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  estado: string;
  duracion: number | null;
  idioma: string;
  publicadoEn: Date | null;
  educador: Educador;
  categoria: Categoria;
  lecciones?: Leccion[];
  _count: {
    lecciones: number;
    inscripciones: number;
  };
}

interface CursoResponse {
  curso: Curso;
  message: string;
}

interface PageProps {
  params: {
    slug: string;
  };
}

/**
 * Obtiene un curso por slug
 */
async function getCurso(slug: string): Promise<Curso | null> {
  try {
    const data = await api.get<CursoResponse>(`/cursos/slug/${slug}`);
    return data.curso;
  } catch (error) {
    console.error('Error al obtener curso:', error);
    return null;
  }
}

/**
 * Genera metadata dinámica para SEO
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const curso = await getCurso(params.slug);

  if (!curso) {
    return {
      title: 'Curso no encontrado | Amauta',
    };
  }

  const imageUrl = curso.imagen
    ? curso.imagen.startsWith('/uploads/')
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/image${curso.imagen}`
      : curso.imagen
    : null;

  return {
    title: `${curso.titulo} | Amauta`,
    description: curso.descripcion,
    openGraph: {
      title: curso.titulo,
      description: curso.descripcion,
      images: imageUrl ? [imageUrl] : [],
      type: 'article',
    },
  };
}

export default async function CursoDetallePage({ params }: PageProps) {
  const curso = await getCurso(params.slug);

  // 404 si el curso no existe
  if (!curso) {
    notFound();
  }

  // Solo mostrar cursos publicados en la página pública
  if (curso.estado !== 'PUBLICADO') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header del curso con imagen y datos principales */}
      <CursoHeader curso={curso} />

      {/* Contenido principal */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          {/* Columna principal */}
          <main className="space-y-8">
            {/* Información del curso */}
            <CursoInfo curso={curso} />

            {/* Temario */}
            {curso.lecciones && curso.lecciones.length > 0 && (
              <CursoTemario lecciones={curso.lecciones} />
            )}
          </main>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Botón de inscripción */}
            <div className="sticky top-6">
              <InscripcionBtn
                cursoId={curso.id}
                cursoTitulo={curso.titulo}
                cursoSlug={curso.slug}
                totalLecciones={curso._count.lecciones}
                duracion={curso.duracion}
                primeraLeccionId={
                  curso.lecciones && curso.lecciones.length > 0
                    ? curso.lecciones
                        .filter((l) => l.publicada)
                        .sort((a, b) => a.orden - b.orden)[0]?.id ?? null
                    : null
                }
              />

              {/* Card del educador */}
              <EducadorCard educador={curso.educador} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
