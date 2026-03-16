/**
 * Componente DownloadCursoButton
 *
 * Descarga un curso de texto para uso offline y permite eliminarlo.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db/offline-db';
import { ProgresoBar } from '@/components/lecciones/ProgresoBar';
import { extractHtmlFromContenido } from '@/lib/offline/markdown';
import { cacheVideo, deleteVideoCache } from '@/lib/offline/video-cache';

interface CursoBase {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string;
  imagen: string | null;
  nivel: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  duracion: number | null;
  categoriaId: string;
}

interface LeccionApi {
  id: string;
  cursoId: string;
  titulo: string;
  contenido: Record<string, unknown>;
  tipo: 'VIDEO' | 'TEXTO' | 'QUIZ' | 'INTERACTIVO' | 'DESCARGABLE';
  orden: number;
  publicada: boolean;
  updatedAt?: string | Date;
}

interface LeccionesResponse {
  lecciones: LeccionApi[];
  total: number;
}

interface ContenidoVideo {
  videoUrl?: string;
  provider?: 'youtube' | 'vimeo' | 'local';
}

interface DownloadCursoButtonProps {
  curso: CursoBase;
  totalLecciones: number;
}

type DownloadStatus = 'idle' | 'downloading' | 'downloaded' | 'error';

export function DownloadCursoButton({
  curso,
  totalLecciones,
}: DownloadCursoButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState<DownloadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setIsOnline(online);

    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function checkDescarga() {
      try {
        const existente = await db.cursos.get(curso.id);
        if (!active) return;
        if (existente) {
          setStatus('downloaded');
          setProgress(100);
        } else {
          setStatus('idle');
          setProgress(0);
        }
      } catch {
        if (!active) return;
        setStatus('idle');
      }
    }

    checkDescarga();

    return () => {
      active = false;
    };
  }, [curso.id]);

  async function handleDownload() {
    if (!isOnline) {
      setError('Necesitás conexión para descargar este curso.');
      return;
    }

    setError(null);
    setStatus('downloading');
    setProgress(0);

    try {
      const response = await fetch(
        `/api/cursos/${curso.id}/lecciones?publicadas=true`
      );

      if (!response.ok) {
        throw new Error('No se pudieron obtener las lecciones del curso.');
      }

      const data = (await response.json()) as LeccionesResponse;
      const lecciones = Array.isArray(data.lecciones) ? data.lecciones : [];
      const leccionesDescargables = lecciones.filter(
        (leccion) =>
          leccion.publicada &&
          (leccion.tipo === 'TEXTO' || leccion.tipo === 'VIDEO')
      );

      if (leccionesDescargables.length === 0) {
        throw new Error(
          'Este curso no tiene lecciones de texto o video publicadas para descargar.'
        );
      }

      const now = new Date();
      const leccionesOffline = [] as {
        id: string;
        cursoId: string;
        titulo: string;
        contenido: string;
        tipo: 'TEXTO' | 'VIDEO';
        orden: number;
        actualizadoEn: Date;
        videoUrl?: string;
        videoCacheKey?: string;
        videoProvider?: 'youtube' | 'vimeo' | 'local';
      }[];

      for (let index = 0; index < leccionesDescargables.length; index += 1) {
        const leccion = leccionesDescargables[index];

        if (leccion.tipo === 'TEXTO') {
          const contenido = extractHtmlFromContenido(leccion.contenido ?? {});

          leccionesOffline.push({
            id: leccion.id,
            cursoId: curso.id,
            titulo: leccion.titulo,
            contenido,
            tipo: 'TEXTO',
            orden: leccion.orden ?? index,
            actualizadoEn: new Date(leccion.updatedAt ?? now),
          });
        }

        if (leccion.tipo === 'VIDEO') {
          const contenidoVideo = leccion.contenido as ContenidoVideo;

          if (!contenidoVideo.videoUrl) {
            throw new Error(
              `No se encontró el video de la lección "${leccion.titulo}".`
            );
          }

          const videoCacheKey = await cacheVideo(
            leccion.id,
            contenidoVideo.videoUrl
          );

          leccionesOffline.push({
            id: leccion.id,
            cursoId: curso.id,
            titulo: leccion.titulo,
            contenido: '',
            tipo: 'VIDEO',
            orden: leccion.orden ?? index,
            actualizadoEn: new Date(leccion.updatedAt ?? now),
            videoUrl: contenidoVideo.videoUrl,
            videoCacheKey,
            videoProvider: contenidoVideo.provider,
          });
        }

        const porcentaje = Math.round(
          ((index + 1) / leccionesDescargables.length) * 100
        );
        setProgress(porcentaje);
      }

      const tamanoBytes = new Blob([
        curso.titulo,
        curso.descripcion,
        leccionesOffline.map((leccion) => leccion.contenido).join(''),
      ]).size;

      await db.cursos.put({
        id: curso.id,
        slug: curso.slug,
        titulo: curso.titulo,
        descripcion: curso.descripcion,
        imagen: curso.imagen,
        nivel: curso.nivel,
        duracion: curso.duracion,
        categoriaId: curso.categoriaId,
        fechaDescarga: now,
        actualizadoEn: now,
        tamanoBytes,
      });

      await db.lecciones.bulkPut(leccionesOffline);

      setStatus('downloaded');
      setProgress(100);

      router.prefetch(`/offline/cursos/${curso.slug}`);
      leccionesOffline.forEach((leccion) => {
        router.prefetch(
          `/offline/cursos/${curso.slug}/lecciones/${leccion.id}`
        );
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      setStatus('error');
      setProgress(0);
    }
  }

  async function handleDelete() {
    setError(null);
    try {
      const leccionesCurso = await db.lecciones
        .where('cursoId')
        .equals(curso.id)
        .toArray();

      await Promise.all(
        leccionesCurso
          .map((leccion) => leccion.videoCacheKey)
          .filter((cacheKey): cacheKey is string => Boolean(cacheKey))
          .map((cacheKey) => deleteVideoCache(cacheKey))
      );

      await db.lecciones.where('cursoId').equals(curso.id).delete();
      await db.cursos.delete(curso.id);
      setStatus('idle');
      setProgress(0);
    } catch {
      setError('No se pudo eliminar la descarga.');
    }
  }

  const descargado = status === 'downloaded';
  const descargando = status === 'downloading';

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          Descarga offline
        </h3>
        {descargado && (
          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
            Disponible
          </span>
        )}
      </div>

      <p className="text-sm text-[var(--muted)]">
        Guardá las lecciones de texto para estudiarlas sin conexión.
      </p>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">Lecciones</span>
          <span className="font-semibold text-[var(--foreground)]">
            {totalLecciones}
          </span>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {descargando && (
          <ProgresoBar porcentaje={progress} label="Descargando" />
        )}

        {descargado ? (
          <div className="space-y-3">
            <Link
              href={`/offline/cursos/${curso.slug}`}
              className="block w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary/90 hover:no-underline"
            >
              Abrir curso offline
            </Link>
            <button
              onClick={handleDelete}
              className="w-full rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--border)] hover:text-[var(--foreground)]"
            >
              Eliminar descarga
            </button>
          </div>
        ) : (
          <button
            onClick={handleDownload}
            disabled={descargando || !isOnline}
            className="min-h-[44px] w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {descargando ? 'Descargando...' : 'Descargar para offline'}
          </button>
        )}

        {!isOnline && !descargado && (
          <p className="text-xs text-[var(--muted)]">
            Sin conexión. Conectate para descargar el curso.
          </p>
        )}
      </div>
    </div>
  );
}
