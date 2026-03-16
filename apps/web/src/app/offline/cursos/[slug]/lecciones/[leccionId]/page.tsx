/**
 * Página offline de lección
 *
 * Renderiza contenido descargado sin conexión.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  db,
  type CursoOffline,
  type LeccionOffline,
} from '@/lib/db/offline-db';
import { LeccionContent } from '@/components/lecciones/LeccionContent';

interface PageProps {
  params: {
    slug: string;
    leccionId: string;
  };
}

export default function OfflineLeccionPage({ params }: PageProps) {
  const { slug, leccionId } = params;
  const [curso, setCurso] = useState<CursoOffline | null>(null);
  const [lecciones, setLecciones] = useState<LeccionOffline[]>([]);
  const [leccionActual, setLeccionActual] = useState<LeccionOffline | null>(
    null
  );
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
        setLeccionActual(null);
        setLoading(false);
        return;
      }

      const leccionesCurso = await db.lecciones
        .where('cursoId')
        .equals(cursoOffline.id)
        .toArray();

      if (!active) return;

      leccionesCurso.sort((a, b) => a.orden - b.orden);
      const actual = leccionesCurso.find((l) => l.id === leccionId) ?? null;

      setCurso(cursoOffline);
      setLecciones(leccionesCurso);
      setLeccionActual(actual);
      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, [slug, leccionId]);

  const navigation = useMemo(() => {
    if (!leccionActual) {
      return { anterior: null, siguiente: null };
    }

    const index = lecciones.findIndex((l) => l.id === leccionActual.id);
    const anterior = index > 0 ? lecciones[index - 1] : null;
    const siguiente =
      index < lecciones.length - 1 ? lecciones[index + 1] : null;

    return { anterior, siguiente };
  }, [lecciones, leccionActual]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
        <p className="text-sm text-[var(--muted)]">
          Cargando lección offline...
        </p>
      </div>
    );
  }

  if (!curso || !leccionActual) {
    return (
      <div className="mx-auto min-h-screen max-w-4xl px-6 py-12">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Lección no disponible offline
        </h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Descargá el curso completo para acceder sin conexión.
        </p>
        <Link
          href={`/offline/cursos/${slug}`}
          className="mt-6 inline-block rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--overlay)]"
        >
          Volver al curso offline
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--background)]">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-6 py-6">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Modo offline
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/offline/cursos/${slug}`}
              className="text-sm font-semibold text-[var(--primary)] hover:underline"
            >
              {curso.titulo}
            </Link>
            <span className="text-xs text-[var(--muted)]">•</span>
            <span className="text-xs text-[var(--muted)]">
              Lección {leccionActual.orden + 1} de {lecciones.length}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <LeccionContent
          tipo="TEXTO"
          contenido={{ html: leccionActual.contenido }}
          titulo={leccionActual.titulo}
        />

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {navigation.anterior ? (
            <Link
              href={`/offline/cursos/${slug}/lecciones/${navigation.anterior.id}`}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--overlay)]"
            >
              ← {navigation.anterior.titulo}
            </Link>
          ) : (
            <div />
          )}
          {navigation.siguiente ? (
            <Link
              href={`/offline/cursos/${slug}/lecciones/${navigation.siguiente.id}`}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--overlay)]"
            >
              {navigation.siguiente.titulo} →
            </Link>
          ) : (
            <div />
          )}
        </div>
      </main>
    </div>
  );
}
