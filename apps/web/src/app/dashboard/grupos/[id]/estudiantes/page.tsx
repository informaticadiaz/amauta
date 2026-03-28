/**
 * Página de asignación de estudiantes a grupos
 */

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api, ApiClientError } from '@/lib/api';
import { GrupoEstudiantesSection } from '@/components/grupos/GrupoEstudiantesSection';

interface MiInstitucionResponse {
  institucionId: string;
  nombre: string;
}

interface GrupoResponse {
  grupo: {
    id: string;
    nombre: string;
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

export default async function GrupoEstudiantesPage({
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-xs text-[var(--muted)]">
            <Link href="/dashboard/grupos" className="hover:underline">
              Grupos
            </Link>{' '}
            / {grupoData.grupo.nombre}
          </nav>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Estudiantes del grupo
          </h1>
          <p className="text-sm text-[var(--muted)]">
            {miInstitucion.nombre} · {grupoData.grupo.nombre}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/grupos/${id}/educadores`}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]"
          >
            Ver educadores
          </Link>
          <Link
            href={`/dashboard/grupos/${id}/editar`}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]"
          >
            Volver al grupo
          </Link>
        </div>
      </div>

      <GrupoEstudiantesSection
        grupoId={id}
        institucionId={miInstitucion.institucionId}
      />
    </div>
  );
}
