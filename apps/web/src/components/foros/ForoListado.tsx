'use client';

import { useEffect, useState } from 'react';
import { ForoPostCard } from './ForoPostCard';
import { NuevoPostForm } from './NuevoPostForm';
import type { ForoPostListItem, ForoRol } from './types';

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

export function ForoListado({
  cursoId,
  cursoSlug,
  currentUserId: _currentUserId,
  currentUserRol,
}: ForoListadoProps) {
  const [posts, setPosts] = useState<ForoPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadPosts() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/cursos/${cursoId}/foros`);
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

  return (
    <section className="grid gap-6">
      <NuevoPostForm
        cursoId={cursoId}
        currentUserRol={currentUserRol}
        onCreated={handleCreated}
      />

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
