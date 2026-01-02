/**
 * Dashboard principal
 *
 * Página protegida que muestra resumen del usuario
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard - Amauta',
  description: 'Tu panel de control en Amauta',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Dashboard
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Bienvenido, <strong>{session.user.name}</strong>
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card: Información del usuario */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
            Tu información
          </h2>
          <dl className="space-y-3">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-[var(--muted)]">Email</dt>
              <dd className="text-sm text-[var(--foreground)]">
                {session.user.email}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-[var(--muted)]">Rol</dt>
              <dd>
                <span className="inline-block rounded bg-primary/10 px-2 py-1 text-xs font-semibold uppercase text-primary">
                  {session.user.rol}
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-[var(--muted)]">ID</dt>
              <dd className="font-mono text-xs text-[var(--muted)]">
                {session.user.id}
              </dd>
            </div>
          </dl>
        </div>

        {/* Card: Próximamente */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
            Próximamente
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {session.user.rol === 'EDUCADOR' ||
            session.user.rol === 'SUPER_ADMIN' ? (
              <>Aquí podrás gestionar tus cursos y ver estadísticas.</>
            ) : (
              <>Aquí verás tus cursos y progreso de aprendizaje.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
