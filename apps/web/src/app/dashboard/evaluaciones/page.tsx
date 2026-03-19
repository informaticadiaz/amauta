/**
 * Página de evaluaciones del educador
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { EvaluacionesList } from '@/components/evaluaciones/EvaluacionesList';

interface CursoItem {
  id: string;
  titulo: string;
}

interface CursosResponse {
  cursos: CursoItem[];
}

async function getMisCursos(): Promise<CursoItem[]> {
  try {
    const data = await api.get<CursosResponse>('/cursos/mis-cursos');
    return data.cursos || [];
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    return [];
  }
}

export default async function EvaluacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ creada?: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const rol = session.user?.rol;
  if (!['EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN'].includes(rol || '')) {
    redirect('/dashboard');
  }

  const cursos = await getMisCursos();
  const params = await searchParams;
  const showSuccess = params?.creada === '1';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Evaluaciones
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Gestioná las evaluaciones de tus cursos.
          </p>
        </div>

        <Link
          href="/dashboard/evaluaciones/nueva"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Crear evaluación
        </Link>
      </div>

      {showSuccess && (
        <div className="rounded-lg border border-[var(--success-text)] bg-[var(--success-bg)] px-4 py-3 text-sm text-[var(--success-text)]">
          Evaluación creada correctamente.
        </div>
      )}

      <EvaluacionesList cursos={cursos} />
    </div>
  );
}
