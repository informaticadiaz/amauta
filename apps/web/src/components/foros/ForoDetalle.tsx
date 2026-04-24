'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RespuestaForm } from './RespuestaForm';
import type { ForoPostDetalle, ForoRespuestaItem, ForoRol } from './types';

interface ForoDetalleProps {
  cursoId: string;
  postId: string;
  currentUserId: string;
  currentUserRol: ForoRol;
  courseEducadorId: string;
  courseSlug?: string;
}

interface DetallePostResponse {
  post: ForoPostDetalle;
  message?: string;
}

interface InteraccionRespuestaResponse {
  respuesta?: ForoRespuestaItem;
  message?: string;
}

function fullName(autor: { nombre: string; apellido: string }) {
  return `${autor.nombre} ${autor.apellido}`;
}

function formatUtilCount(count: number) {
  return `${count} ${count === 1 ? 'útil' : 'útiles'}`;
}

export function ForoDetalle({
  cursoId,
  postId,
  currentUserId,
  currentUserRol,
  courseEducadorId,
  courseSlug,
}: ForoDetalleProps) {
  const [post, setPost] = useState<ForoPostDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [replyParent, setReplyParent] = useState<ForoRespuestaItem | null>(
    null
  );

  async function loadPost() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/cursos/${cursoId}/foros/${postId}`);
      const data = (await response.json()) as DetallePostResponse;
      if (!response.ok) {
        throw new Error(data.message || 'No se pudo cargar el hilo');
      }

      setPost(data.post);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Error al cargar el hilo'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPost();
  }, [cursoId, postId]);

  async function handleSubmitRespuesta(payload: {
    contenido: string;
    respuestaParentId?: string;
  }) {
    const response = await fetch(
      `/api/cursos/${cursoId}/foros/${postId}/respuestas`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'No se pudo enviar la respuesta');
    }

    setReplyParent(null);
    setSuccess('Respuesta publicada exitosamente');
    await loadPost();
  }

  async function handleCloseThread() {
    setError(null);
    setSuccess(null);

    const response = await fetch(
      `/api/cursos/${cursoId}/foros/${postId}/cerrar`,
      {
        method: 'POST',
      }
    );
    const data = await response.json();

    if (!response.ok) {
      setError(data.message || 'No se pudo cerrar el thread');
      return;
    }

    setSuccess('Thread cerrado');
    await loadPost();
  }

  async function handleDeleteThread() {
    setError(null);
    setSuccess(null);

    const response = await fetch(`/api/cursos/${cursoId}/foros/${postId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.message || 'No se pudo eliminar el thread');
      return;
    }

    setSuccess('Thread eliminado');
    await loadPost();
  }

  async function handleMarkSolution(respuestaId: string) {
    setError(null);
    setSuccess(null);

    const response = await fetch(
      `/api/foros/respuestas/${respuestaId}/solucion`,
      {
        method: 'POST',
      }
    );
    const data = (await response.json()) as InteraccionRespuestaResponse;

    if (!response.ok) {
      setError(data.message || 'No se pudo marcar la respuesta como solución');
      return;
    }

    setSuccess(data.message || 'Respuesta marcada como solución');
    await loadPost();
  }

  async function handleMarkUtil(respuestaId: string) {
    setError(null);
    setSuccess(null);

    const response = await fetch(`/api/foros/respuestas/${respuestaId}/util`, {
      method: 'POST',
    });
    const data = (await response.json()) as InteraccionRespuestaResponse;

    if (!response.ok) {
      setError(data.message || 'No se pudo marcar la respuesta como útil');
      return;
    }

    setSuccess(data.message || 'Respuesta marcada como útil');
    await loadPost();
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--muted)]">
        Cargando hilo...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--muted)]">
        No se encontró el post solicitado.
      </div>
    );
  }

  const canModerate =
    post.autor.id === currentUserId ||
    currentUserId === courseEducadorId ||
    currentUserRol === 'ADMIN_ESCUELA' ||
    currentUserRol === 'SUPER_ADMIN';
  const canReply = post.estado === 'PUBLICADO' && !post.eliminado;
  const postResuelto =
    post.tipo === 'PREGUNTA' &&
    post.respuestas.some((respuesta) => respuesta.esSolucion);

  return (
    <section className="grid gap-6">
      {courseSlug && (
        <Link
          href={`/cursos/${courseSlug}/foro`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Volver al foro
        </Link>
      )}

      {success && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </p>
      )}

      <article className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            {post.tipo === 'PREGUNTA'
              ? 'Pregunta'
              : post.tipo === 'DISCUSION'
                ? 'Discusión'
                : 'Anuncio'}
          </span>
          {postResuelto && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
              Resuelto
            </span>
          )}
          {post.estado === 'CERRADO' && !postResuelto && (
            <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-700">
              Cerrado
            </span>
          )}
        </div>

        <h1 className="mt-4 text-3xl font-semibold text-[var(--foreground)]">
          {post.titulo}
        </h1>
        <p className="mt-3 whitespace-pre-wrap text-[var(--foreground)]">
          {post.contenido}
        </p>
        <p className="mt-4 text-sm text-[var(--muted)]">
          Publicado por {fullName(post.autor)}
        </p>

        {canModerate && (
          <div className="mt-6 flex flex-wrap gap-3">
            {post.estado === 'PUBLICADO' && (
              <button
                onClick={() => void handleCloseThread()}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--overlay-light)]"
              >
                Cerrar thread
              </button>
            )}
            <button
              onClick={() => void handleDeleteThread()}
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
            >
              Eliminar thread
            </button>
          </div>
        )}
      </article>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          Respuestas
        </h2>

        {post.respuestas.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--muted)]">
            Todavía no hay respuestas en este hilo.
          </div>
        ) : (
          post.respuestas.map((respuesta) => {
            const parent = respuesta.respuestaParentId
              ? post.respuestas.find(
                  (item) => item.id === respuesta.respuestaParentId
                )
              : null;

            return (
              <article
                key={respuesta.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm ${
                  respuesta.esSolucion
                    ? 'border-emerald-200 bg-emerald-50/60'
                    : 'border-[var(--border)]'
                } ${respuesta.respuestaParentId ? 'ml-6' : ''}`}
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {respuesta.esSolucion && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Solución
                    </span>
                  )}
                  <span className="text-xs font-medium text-[var(--muted)]">
                    {formatUtilCount(respuesta.esUtil)}
                  </span>
                </div>
                {parent && (
                  <p className="mb-2 text-xs font-medium text-[var(--muted)]">
                    Respuesta a {fullName(parent.autor)}
                  </p>
                )}
                <p className="whitespace-pre-wrap text-[var(--foreground)]">
                  {respuesta.contenido}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm text-[var(--muted)]">
                    {fullName(respuesta.autor)}
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    {post.tipo === 'PREGUNTA' &&
                      !respuesta.esSolucion &&
                      !respuesta.respuestaParentId &&
                      (post.autor.id === currentUserId ||
                        currentUserId === courseEducadorId ||
                        currentUserRol === 'ADMIN_ESCUELA' ||
                        currentUserRol === 'SUPER_ADMIN') && (
                        <button
                          onClick={() => void handleMarkSolution(respuesta.id)}
                          className="text-sm font-medium text-emerald-700 hover:underline"
                        >
                          Marcar como solución
                        </button>
                      )}
                    <button
                      onClick={() => void handleMarkUtil(respuesta.id)}
                      disabled={respuesta.marcoUtil}
                      className="text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-[var(--muted)]"
                    >
                      {respuesta.marcoUtil
                        ? 'Te resultó útil'
                        : 'Marcar como útil'}
                    </button>
                    {canReply && !respuesta.respuestaParentId && (
                      <button
                        onClick={() => setReplyParent(respuesta)}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Responder a {fullName(respuesta.autor)}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {canReply ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <RespuestaForm
            onSubmit={handleSubmitRespuesta}
            parentId={replyParent?.id ?? null}
            replyLabel={
              replyParent
                ? `Respondiendo a ${fullName(replyParent.autor)}`
                : null
            }
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--muted)]">
          Este thread está cerrado y no admite nuevas respuestas.
        </div>
      )}
    </section>
  );
}
