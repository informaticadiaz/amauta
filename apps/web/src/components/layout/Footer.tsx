/**
 * Footer de la aplicación
 *
 * Muestra links de ayuda, información legal y copyright
 */

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Logo y descripción */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <span className="text-lg font-bold text-[var(--foreground)]">
              <span className="text-primary">A</span>mauta
            </span>
            <p className="text-center text-sm text-[var(--muted)] md:text-left">
              Sistema educativo para la gestión del aprendizaje
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link
              href="/acerca"
              className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)] hover:no-underline"
            >
              Acerca de
            </Link>
            <Link
              href="/ayuda"
              className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)] hover:no-underline"
            >
              Ayuda
            </Link>
            <Link
              href="/privacidad"
              className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)] hover:no-underline"
            >
              Privacidad
            </Link>
            <Link
              href="/terminos"
              className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)] hover:no-underline"
            >
              Términos
            </Link>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-[var(--border)] pt-4 text-center">
          <p className="text-xs text-[var(--muted)]">
            © {currentYear} Amauta. Software libre bajo licencia AGPL-3.0.
          </p>
        </div>
      </div>
    </footer>
  );
}
