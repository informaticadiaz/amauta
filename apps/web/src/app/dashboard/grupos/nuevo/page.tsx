/**
 * Página para crear un nuevo grupo
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api, ApiClientError } from '@/lib/api';
import { GrupoForm } from '@/components/grupos/GrupoForm';

interface MiInstitucionResponse {
  institucionId: string;
  nombre: string;
  periodos: Array<{ id: string; nombre: string; activo: boolean }>;
}

async function getMiInstitucion(): Promise<MiInstitucionResponse | null> {
  try {
    return await api.get<MiInstitucionResponse>(
      '/instituciones/mi-institucion'
    );
  } catch (error) {
    if (error instanceof ApiClientError && error.statusCode === 400) {
      return null;
    }
    console.error('Error al obtener institución:', error);
    return null;
  }
}

export default async function NuevoGrupoPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const rol = session.user?.rol;
  if (rol !== 'ADMIN_ESCUELA') {
    redirect('/dashboard');
  }

  const miInstitucion = await getMiInstitucion();

  if (!miInstitucion) {
    redirect('/dashboard/grupos');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Nuevo grupo
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Creá un nuevo grupo en {miInstitucion.nombre}.
        </p>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6">
        <GrupoForm
          institucionId={miInstitucion.institucionId}
          periodos={miInstitucion.periodos}
        />
      </div>
    </div>
  );
}
