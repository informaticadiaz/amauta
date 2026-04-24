import Link from 'next/link';
import type { ForoPostListItem } from './types';

interface ForoPostCardProps {
  cursoSlug: string;
  post: ForoPostListItem;
}

function getTipoLabel(tipo: ForoPostListItem['tipo']) {
  if (tipo === 'PREGUNTA') return 'Pregunta';
  if (tipo === 'DISCUSION') return 'Discusión';
  return 'Anuncio';
}

export function ForoPostCard({ cursoSlug, post }: ForoPostCardProps) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
          {getTipoLabel(post.tipo)}
        </span>
        {post.estado === 'CERRADO' && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
            Resuelto
          </span>
        )}
      </div>

      <Link
        href={`/cursos/${cursoSlug}/foro/${post.id}`}
        className="group inline-block"
      >
        <h2 className="text-xl font-semibold text-[var(--foreground)] transition-colors group-hover:text-primary">
          {post.titulo}
        </h2>
      </Link>

      <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">
        {post.contenido}
      </p>

      {post.etiquetas.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.etiquetas.map((etiqueta) => (
            <span
              key={etiqueta}
              className="rounded-full bg-[var(--overlay-light)] px-3 py-1 text-xs text-[var(--foreground)]"
            >
              #{etiqueta}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted)]">
        <span>
          {post.autor.nombre} {post.autor.apellido}
        </span>
        <span>{post.responseCount} respuestas</span>
      </div>
    </article>
  );
}
