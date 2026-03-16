/**
 * Página: Visualizador de lección
 *
 * Muestra el contenido de una lección para estudiantes inscritos.
 * Ruta: /cursos/[slug]/lecciones/[leccionId]
 */

import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { LeccionSidebar } from '@/components/lecciones/LeccionSidebar';
import { LeccionContent } from '@/components/lecciones/LeccionContent';
import { LeccionNavigation } from '@/components/lecciones/LeccionNavigation';
import { MobileSidebarSheet } from '@/components/lecciones/MobileSidebarSheet';
import { CompletarLeccionBtn } from '@/components/lecciones/CompletarLeccionBtn';
import { ProgresoBar } from '@/components/lecciones/ProgresoBar';
import { SyncStatusBadge } from '@/components/offline/SyncStatusBadge';

type TipoLeccion = 'VIDEO' | 'TEXTO' | 'QUIZ' | 'INTERACTIVO' | 'DESCARGABLE';

interface Leccion {
  id: string;
  titulo: string;
  descripcion: string | null;
  orden: number;
  tipo: TipoLeccion;
  duracion: number | null;
  contenido: Record<string, unknown>;
  publicada: boolean;
}

interface Curso {
  id: string;
  titulo: string;
  slug: string;
  lecciones: Leccion[];
}

interface CursoResponse {
  curso: Curso;
}

interface LeccionResponse {
  leccion: Leccion;
}

interface InscripcionResponse {
  inscrito: boolean;
}

interface ProgresoCursoResponse {
  cursoId: string;
  totalLecciones: number;
  leccionesCompletadas: number;
  leccionesCompletadasIds: string[];
  porcentaje: number;
}

interface PageProps {
  params: {
    slug: string;
    leccionId: string;
  };
}

async function getCurso(slug: string): Promise<Curso | null> {
  try {
    const data = await api.get<CursoResponse>(`/cursos/slug/${slug}`);
    return data.curso;
  } catch {
    return null;
  }
}

async function getLeccion(leccionId: string): Promise<Leccion | null> {
  try {
    const data = await api.get<LeccionResponse>(`/lecciones/${leccionId}`);
    return data.leccion;
  } catch {
    return null;
  }
}

async function verificarInscripcion(cursoId: string): Promise<boolean> {
  try {
    const data = await api.get<InscripcionResponse>(
      `/cursos/${cursoId}/inscripcion`
    );
    return data.inscrito === true;
  } catch {
    return false;
  }
}

async function getProgreso(
  cursoId: string
): Promise<ProgresoCursoResponse | null> {
  try {
    const data = await api.get<ProgresoCursoResponse>(
      `/cursos/${cursoId}/progreso`
    );
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const leccion = await getLeccion(params.leccionId);
  return {
    title: leccion ? `${leccion.titulo} | Amauta` : 'Lección | Amauta',
  };
}

export default async function LeccionPage({ params }: PageProps) {
  const { slug, leccionId } = params;

  // Verificar autenticación
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/cursos/${slug}/lecciones/${leccionId}`);
  }

  // Obtener curso y lección en paralelo
  const [curso, leccion] = await Promise.all([
    getCurso(slug),
    getLeccion(leccionId),
  ]);

  if (!curso || !leccion) {
    notFound();
  }

  // A partir de acá, curso y leccion son no-null (notFound() lanza una excepción)
  const cursoData = curso!;
  const leccionData = leccion!;

  // Verificar inscripción
  const inscrito = await verificarInscripcion(cursoData.id);
  if (!inscrito) {
    redirect(`/cursos/${slug}`);
  }

  // Obtener progreso del estudiante
  const progreso = await getProgreso(cursoData.id);
  const leccionesCompletadasIds = progreso?.leccionesCompletadasIds ?? [];
  const porcentaje = progreso?.porcentaje ?? 0;
  const leccionesCompletadas = progreso?.leccionesCompletadas ?? 0;
  const totalLecciones = progreso?.totalLecciones ?? 0;
  const completada = leccionesCompletadasIds.includes(leccionId);

  // Lecciones publicadas ordenadas
  const leccionesPublicadas = cursoData.lecciones
    .filter((l) => l.publicada)
    .sort((a, b) => a.orden - b.orden);

  const indexActual = leccionesPublicadas.findIndex((l) => l.id === leccionId);
  const leccionAnterior =
    indexActual > 0 ? (leccionesPublicadas[indexActual - 1] ?? null) : null;
  const leccionSiguiente =
    indexActual < leccionesPublicadas.length - 1
      ? (leccionesPublicadas[indexActual + 1] ?? null)
      : null;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Sidebar desktop */}
      <aside className="hidden w-72 flex-shrink-0 overflow-y-auto lg:flex lg:flex-col">
        <LeccionSidebar
          lecciones={leccionesPublicadas}
          leccionActivaId={leccionId}
          cursoSlug={slug}
          leccionesCompletadasIds={leccionesCompletadasIds}
        />
      </aside>

      {/* Contenido principal */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        {/* Header móvil */}
        <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)] lg:hidden">
          <div className="flex items-center gap-4 px-4 py-3">
            <MobileSidebarSheet
              lecciones={leccionesPublicadas}
              leccionActivaId={leccionId}
              cursoSlug={slug}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--foreground)]">
                {leccionData.titulo}
              </p>
              {indexActual !== -1 && (
                <p className="text-xs text-[var(--muted)]">
                  Lección {indexActual + 1} de {leccionesPublicadas.length}
                </p>
              )}
            </div>
          </div>

          {/* Barra de progreso en header móvil */}
          {totalLecciones > 0 && (
            <div className="px-4 pb-3">
              <ProgresoBar
                porcentaje={porcentaje}
                leccionesCompletadas={leccionesCompletadas}
                totalLecciones={totalLecciones}
              />
            </div>
          )}
        </div>

        {/* Contenido de la lección */}
        <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <LeccionContent
            tipo={leccionData.tipo}
            contenido={leccionData.contenido}
            titulo={leccionData.titulo}
          />

          {leccionData.descripcion && (
            <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--overlay-light)] p-6">
              <h2 className="mb-2 font-semibold text-[var(--foreground)]">
                Descripción
              </h2>
              <p className="text-sm text-[var(--muted)]">
                {leccionData.descripcion}
              </p>
            </div>
          )}

          {/* Progreso desktop y botón completar */}
          <div className="mt-8 flex flex-col gap-4 border-t border-[var(--border)] pt-8 sm:flex-row sm:items-center sm:justify-between">
            {totalLecciones > 0 && (
              <div className="min-w-0 flex-1 sm:max-w-xs">
                <ProgresoBar
                  porcentaje={porcentaje}
                  label="Tu progreso"
                  leccionesCompletadas={leccionesCompletadas}
                  totalLecciones={totalLecciones}
                />
              </div>
            )}
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <SyncStatusBadge />
              <CompletarLeccionBtn
                leccionId={leccionId}
                cursoId={cursoData.id}
                completada={completada}
              />
            </div>
          </div>

          <LeccionNavigation
            cursoSlug={slug}
            leccionAnterior={leccionAnterior}
            leccionSiguiente={leccionSiguiente}
          />
        </div>
      </main>
    </div>
  );
}
