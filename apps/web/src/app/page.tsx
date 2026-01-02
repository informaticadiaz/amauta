import Link from 'next/link';
import { MainLayout } from '@/components/layout';

export default function Home() {
  return (
    <MainLayout>
      <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-[var(--foreground)] sm:text-6xl">
          <span className="text-primary">A</span>mauta
        </h1>
        <p className="mt-4 text-xl text-[var(--muted)]">Sistema Educativo</p>

        <div className="mt-6">
          <span className="inline-block rounded-full bg-yellow-100 px-4 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            En desarrollo
          </span>
        </div>

        <p className="mt-8 max-w-xl text-lg text-[var(--muted)]">
          Plataforma de gestión del aprendizaje diseñada para facilitar la
          educación moderna.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/cursos"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover hover:no-underline"
          >
            Explorar cursos
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--border)] hover:no-underline"
          >
            Crear cuenta
          </Link>
        </div>

        <div className="mt-16 flex items-center gap-4 text-sm text-[var(--muted)]">
          <a
            href="https://github.com/your-org/amauta"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--foreground)]"
          >
            GitHub
          </a>
          <span>·</span>
          <a
            href="/docs"
            className="transition-colors hover:text-[var(--foreground)]"
          >
            Documentación
          </a>
        </div>
      </div>
    </MainLayout>
  );
}
