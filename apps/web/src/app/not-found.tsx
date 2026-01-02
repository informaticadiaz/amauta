/**
 * Página 404 - No encontrado
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">
          Página no encontrada
        </h2>
        <p className="mt-2 text-[var(--muted)]">
          Lo sentimos, no pudimos encontrar la página que buscas.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover hover:no-underline"
          >
            Volver al inicio
          </Link>
          <Link
            href="/cursos"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--border)] hover:no-underline"
          >
            Explorar cursos
          </Link>
        </div>
      </div>
    </div>
  );
}
