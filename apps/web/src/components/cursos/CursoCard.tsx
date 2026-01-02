'use client';

/**
 * Componente CursoCard
 *
 * Tarjeta de curso para la lista de cursos del educador
 */

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  _count?: {
    lecciones: number;
    inscripciones: number;
  };
}

interface CursoCardProps {
  curso: Curso;
  onPublishToggle?: (id: string, publicar: boolean) => Promise<void>;
}

const NIVEL_LABELS: Record<string, string> = {
  PRINCIPIANTE: 'Principiante',
  INTERMEDIO: 'Intermedio',
  AVANZADO: 'Avanzado',
};

const ESTADO_STYLES = {
  BORRADOR: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Borrador' },
  REVISION: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    label: 'En revisión',
  },
  PUBLICADO: { bg: 'bg-green-100', text: 'text-green-700', label: 'Publicado' },
  ARCHIVADO: { bg: 'bg-red-100', text: 'text-red-700', label: 'Archivado' },
} as const;

export function CursoCard({ curso, onPublishToggle }: CursoCardProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const imageUrl = curso.imagen
    ? curso.imagen.startsWith('/')
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${curso.imagen}`
      : curso.imagen
    : null;

  const estadoStyle = ESTADO_STYLES[curso.estado];
  const isPublicado = curso.estado === 'PUBLICADO';

  async function handlePublishToggle() {
    if (!onPublishToggle || isUpdating) return;

    setIsUpdating(true);
    try {
      await onPublishToggle(curso.id, !isPublicado);
      router.refresh();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-sm transition-shadow hover:shadow-md">
      {/* Imagen */}
      <div className="relative aspect-video bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={curso.titulo}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              className="h-12 w-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
        )}
        {/* Badge de estado */}
        <span
          className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${estadoStyle.bg} ${estadoStyle.text}`}
        >
          {estadoStyle.label}
        </span>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 flex-1 font-semibold text-[var(--foreground)]">
            {curso.titulo}
          </h3>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {curso.categoria.nombre}
          </span>
          <span className="rounded bg-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">
            {NIVEL_LABELS[curso.nivel]}
          </span>
        </div>

        <p className="mb-4 line-clamp-2 text-sm text-[var(--muted)]">
          {curso.descripcion}
        </p>

        {/* Stats */}
        {curso._count && (
          <div className="mb-4 flex gap-4 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
              {curso._count.lecciones} lecciones
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
              {curso._count.inscripciones} estudiantes
            </span>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2">
          <Link
            href={`/dashboard/cursos/${curso.id}/editar`}
            className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-center text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--border)]"
          >
            Editar
          </Link>
          <button
            onClick={handlePublishToggle}
            disabled={isUpdating || curso.estado === 'ARCHIVADO'}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              isPublicado
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isUpdating ? '...' : isPublicado ? 'Despublicar' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  );
}
