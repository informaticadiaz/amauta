import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AsistenciaRapidaSection } from '@/components/asistencias/AsistenciaRapidaSection';

export default async function AsistenciasPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const rol = session.user?.rol;
  if (!['ADMIN_ESCUELA', 'EDUCADOR'].includes(rol || '')) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Carga rápida de asistencias
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Seleccioná grupo y fecha para registrar o ajustar la asistencia diaria
          con feedback inmediato.
        </p>
      </div>

      <AsistenciaRapidaSection />
    </div>
  );
}
