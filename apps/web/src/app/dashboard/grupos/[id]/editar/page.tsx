/**
 * Página para editar un grupo existente
 */

import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api, ApiClientError } from '@/lib/api';
import { GrupoForm } from '@/components/grupos/GrupoForm';

interface MiInstitucionResponse {
  institucionId: string;
  nombre: string;
  periodos: Array<{ id: string; nombre: string; activo: boolean }>;
}

interface GrupoResponse {
  grupo: {
    id: string;
    nombre: string;
    grado: string | null;
    seccion: string | null;
    activo: boolean;
    periodoAcademicoId: string | null;
    educadorId: string;
  };
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

async function getGrupo(id: string): Promise<GrupoResponse | null> {
  try {
    return await api.get<GrupoResponse>(`/grupos/${id}`);
  } catch (error) {
    if (error instanceof ApiClientError && error.statusCode === 404) {
      return null;
    }
    console.error('Error al obtener grupo:', error);
    return null;
  }
}

export default async function EditarGrupoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const rol = session.user?.rol;
  if (rol !== 'ADMIN_ESCUELA') {
    redirect('/dashboard');
  }

  const { id } = await params;

  const [miInstitucion, grupoData] = await Promise.all([
    getMiInstitucion(),
    getGrupo(id),
  ]);

  if (!miInstitucion) {
    redirect('/dashboard/grupos');
  }

  if (!grupoData) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Editar grupo
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {grupoData.grupo.nombre} — {miInstitucion.nombre}
        </p>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6">
        <GrupoForm
          institucionId={miInstitucion.institucionId}
          periodos={miInstitucion.periodos}
          grupo={grupoData.grupo}
        />
      </div>
    </div>
  );
}
