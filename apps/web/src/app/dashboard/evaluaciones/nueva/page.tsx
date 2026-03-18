/**
 * Página para crear una evaluación
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { EvaluacionForm } from '@/components/evaluaciones/EvaluacionForm';

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

export default async function NuevaEvaluacionPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const rol = session.user?.rol;
  if (!['EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN'].includes(rol || '')) {
    redirect('/dashboard');
  }

  const cursos = await getMisCursos();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Crear evaluación
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Definí los parámetros básicos de la evaluación para tu curso.
        </p>
      </div>

      <EvaluacionForm cursos={cursos} />
    </div>
  );
}
