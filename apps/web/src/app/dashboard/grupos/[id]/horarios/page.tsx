import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api, ApiClientError } from '@/lib/api';
import { HorariosAdmin } from '@/components/horarios/HorariosAdmin';

async function getGrupo(id: string) {
  try {
    return await api.get<{ grupo: { id: string; nombre: string } }>(
      `/grupos/${id}`
    );
  } catch (error) {
    if (error instanceof ApiClientError && error.statusCode === 404)
      return null;
    throw error;
  }
}
export default async function GrupoHorariosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/login');
  if (session.user?.rol !== 'ADMIN_ESCUELA') redirect('/dashboard');
  const { id } = await params;
  const data = await getGrupo(id);
  if (!data) notFound();
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-xs text-[var(--muted)]">
            <Link href="/dashboard/grupos" className="hover:underline">
              Grupos
            </Link>{' '}
            / {data.grupo.nombre}
          </nav>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Horario semanal
          </h1>
          <p className="text-sm text-[var(--muted)]">{data.grupo.nombre}</p>
        </div>
        <Link
          href={`/dashboard/grupos/${id}/editar`}
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm"
        >
          Volver al grupo
        </Link>
      </div>
      <HorariosAdmin grupoId={id} />
    </div>
  );
}
