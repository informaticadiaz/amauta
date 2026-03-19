/**
 * Pagina de detalle de evaluacion (educador)
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { EvaluacionDetalle } from '@/components/evaluaciones/EvaluacionDetalle';

export default async function EvaluacionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const rol = session.user?.rol;
  if (!['EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN'].includes(rol || '')) {
    redirect('/dashboard');
  }

  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Detalle de evaluacion
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Revisa los datos principales de la evaluacion.
          </p>
        </div>

        <Link
          href="/dashboard/evaluaciones"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted-surface)]"
        >
          Volver al listado
        </Link>
      </div>

      <EvaluacionDetalle evaluacionId={id} />
    </div>
  );
}
