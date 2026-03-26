/**
 * Página de gestión de grupos/clases
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api, ApiClientError } from '@/lib/api';
import { GruposList } from '@/components/grupos/GruposList';

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

export default async function GruposPage({
  searchParams,
}: {
  searchParams: Promise<{ creado?: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const rol = session.user?.rol;
  if (rol !== 'ADMIN_ESCUELA') {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const showSuccess = params?.creado === '1';

  const miInstitucion = await getMiInstitucion();

  if (!miInstitucion) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Grupos</h1>
        <div className="rounded-lg border border-[var(--warning-bg)] bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning-text)]">
          No tenés una institución asociada a tu cuenta. Contactá con el
          administrador.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Grupos</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {miInstitucion.nombre} — Gestioná los grupos y clases.
        </p>
      </div>

      {showSuccess && (
        <div className="rounded-lg border border-[var(--success-text)] bg-[var(--success-bg)] px-4 py-3 text-sm text-[var(--success-text)]">
          Grupo creado correctamente.
        </div>
      )}

      <GruposList
        institucionId={miInstitucion.institucionId}
        periodos={miInstitucion.periodos}
      />
    </div>
  );
}
