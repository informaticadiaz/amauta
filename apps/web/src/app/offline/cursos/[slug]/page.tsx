/**
 * Página offline de curso
 *
 * Muestra las lecciones descargadas de un curso sin conexión.
 */

'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  db,
  type CursoOffline,
  type LeccionOffline,
} from '@/lib/db/offline-db';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function OfflineCursoPage({ params }: PageProps) {
  const { slug } = use(params);
  const [curso, setCurso] = useState<CursoOffline | null>(null);
  const [lecciones, setLecciones] = useState<LeccionOffline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      const cursoOffline = await db.cursos.where('slug').equals(slug).first();
      if (!active) return;

      if (!cursoOffline) {
        setCurso(null);
        setLecciones([]);
        setLoading(false);
        return;
      }

      const leccionesCurso = await db.lecciones
        .where('cursoId')
        .equals(cursoOffline.id)
        .toArray();

      if (!active) return;

      leccionesCurso.sort((a, b) => a.orden - b.orden);
      setCurso(cursoOffline);
      setLecciones(leccionesCurso);
      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, [slug]);

  const fechaDescarga = useMemo(() => {
    if (!curso) return null;
    try {
      return new Date(curso.fechaDescarga).toLocaleDateString('es-AR');
    } catch {
      return null;
    }
  }, [curso]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
        <p className="text-sm text-[var(--muted)]">Cargando curso offline...</p>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="mx-auto min-h-screen max-w-4xl px-6 py-12">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Curso no disponible offline
        </h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Conectate a internet para descargar este curso.
        </p>
        <Link
          href={`/cursos/${slug}`}
          className="mt-6 inline-block rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--overlay)]"
        >
          Ver curso online
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--background)]">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-6 py-8">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Modo offline
          </span>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            {curso.titulo}
          </h1>
          <p className="text-sm text-[var(--muted)]">{curso.descripcion}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
            <span>{lecciones.length} lecciones descargadas</span>
            {fechaDescarga && <span>Descargado el {fechaDescarga}</span>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
          Lecciones disponibles
        </h2>

        {lecciones.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--overlay-light)] p-6 text-sm text-[var(--muted)]">
            No hay lecciones descargadas para este curso.
          </div>
        ) : (
          <div className="space-y-3">
            {lecciones.map((leccion, index) => (
              <Link
                key={leccion.id}
                href={`/offline/cursos/${slug}/lecciones/${leccion.id}`}
                className="flex min-h-[44px] items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--overlay)]"
              >
                <span>
                  {index + 1}. {leccion.titulo}
                </span>
                <span className="text-xs text-[var(--muted)]">Abrir</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
