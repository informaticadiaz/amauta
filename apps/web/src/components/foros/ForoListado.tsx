'use client';

import { useEffect, useState } from 'react';
import { ForoPostCard } from './ForoPostCard';
import { NuevoPostForm } from './NuevoPostForm';
import type { ForoPostListItem, ForoRol, ForoTipo } from './types';

interface ForoListadoProps {
  cursoId: string;
  cursoSlug: string;
  currentUserId: string;
  currentUserRol: ForoRol;
}

interface ListaPostsResponse {
  posts: ForoPostListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ForoFiltros {
  tipo: '' | ForoTipo;
  etiqueta: string;
  sinResponder: boolean;
}

export function ForoListado({
  cursoId,
  cursoSlug,
  currentUserId: _currentUserId,
  currentUserRol,
}: ForoListadoProps) {
  const [posts, setPosts] = useState<ForoPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<ForoFiltros>({
    tipo: '',
    etiqueta: '',
    sinResponder: false,
  });

  async function loadPosts(nextFiltros: ForoFiltros = filtros) {
    try {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams();
      if (nextFiltros.tipo) {
        query.set('tipo', nextFiltros.tipo);
      }
      if (nextFiltros.etiqueta.trim()) {
        query.set('etiqueta', nextFiltros.etiqueta.trim());
      }
      if (nextFiltros.sinResponder) {
        query.set('sinResponder', 'true');
      }

      const qs = query.toString();
      const response = await fetch(
        `/api/cursos/${cursoId}/foros${qs ? `?${qs}` : ''}`
      );
      const data = (await response.json()) as ListaPostsResponse & {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo cargar el foro');
      }

      setPosts(data.posts);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Error al cargar publicaciones'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPosts();
  }, [cursoId]);

  async function handleCreated() {
    await loadPosts();
  }

  async function handleFilterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadPosts(filtros);
  }

  async function handleClearFilters() {
    const emptyFilters: ForoFiltros = {
      tipo: '',
      etiqueta: '',
      sinResponder: false,
    };

    setFiltros(emptyFilters);
    await loadPosts(emptyFilters);
  }

  const filtrosActivos = [
    filtros.tipo
      ? `Tipo: ${filtros.tipo === 'PREGUNTA' ? 'Pregunta' : filtros.tipo === 'DISCUSION' ? 'Discusión' : 'Anuncio'}`
      : null,
    filtros.etiqueta.trim() ? `Etiqueta: ${filtros.etiqueta.trim()}` : null,
    filtros.sinResponder ? 'Sin responder' : null,
  ].filter(Boolean) as string[];

  return (
    <section className="grid gap-6">
      <NuevoPostForm
        cursoId={cursoId}
        currentUserRol={currentUserRol}
        onCreated={handleCreated}
      />

      <form
        onSubmit={(event) => void handleFilterSubmit(event)}
        className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-[minmax(0,180px)_minmax(0,1fr)_auto_auto] md:items-end">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-[var(--foreground)]">
              Filtrar por tipo
            </span>
            <select
              aria-label="Filtrar por tipo"
              value={filtros.tipo}
              onChange={(event) =>
                setFiltros((current) => ({
                  ...current,
                  tipo: event.target.value as ForoFiltros['tipo'],
                }))
              }
              className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="PREGUNTA">Pregunta</option>
              <option value="DISCUSION">Discusión</option>
              <option value="ANUNCIO">Anuncio</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-[var(--foreground)]">
              Filtrar por etiqueta
            </span>
            <input
              aria-label="Filtrar por etiqueta"
              value={filtros.etiqueta}
              onChange={(event) =>
                setFiltros((current) => ({
                  ...current,
                  etiqueta: event.target.value,
                }))
              }
              placeholder="ej: examen"
              className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)]">
            <input
              aria-label="Solo sin responder"
              type="checkbox"
              checked={filtros.sinResponder}
              onChange={(event) =>
                setFiltros((current) => ({
                  ...current,
                  sinResponder: event.target.checked,
                }))
              }
            />
            Solo sin responder
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Aplicar filtros
            </button>
            <button
              type="button"
              onClick={() => void handleClearFilters()}
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--overlay-light)]"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {filtrosActivos.length > 0 && (
          <div className="mt-4 grid gap-2">
            <p className="text-sm font-medium text-[var(--foreground)]">
              Filtros activos
            </p>
            <div className="flex flex-wrap gap-2">
              {filtrosActivos.map((filtro) => (
                <span
                  key={filtro}
                  className="rounded-full bg-[var(--overlay-light)] px-3 py-1 text-xs text-[var(--foreground)]"
                >
                  {filtro}
                </span>
              ))}
            </div>
          </div>
        )}
      </form>

      {loading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--muted)]">
          Cargando publicaciones...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--muted)]">
          Todavía no hay publicaciones en este foro.
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <ForoPostCard key={post.id} cursoSlug={cursoSlug} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
