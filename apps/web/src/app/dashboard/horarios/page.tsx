import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { MisHorarios } from '@/components/horarios/MisHorarios';
import { GruposHorariosList } from '@/components/horarios/GruposHorariosList';

export default async function HorariosPage() {
  const session = await auth();
  if (!session) redirect('/login');
  const rol = session.user?.rol;
  if (rol === 'EDUCADOR')
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Mis clases de la semana
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Consultá tus clases ordenadas por día y horario.
          </p>
        </div>
        <MisHorarios rol="EDUCADOR" />
      </div>
    );
  if (rol === 'ESTUDIANTE')
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Mi horario semanal
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Tu horario de clases de los grupos activos.
          </p>
        </div>
        <MisHorarios rol="ESTUDIANTE" />
      </div>
    );
  if (rol !== 'ADMIN_ESCUELA') redirect('/dashboard');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Horarios semanales
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Seleccioná un grupo para administrar sus franjas horarias.
        </p>
      </div>
      <GruposHorariosList />
    </div>
  );
}
