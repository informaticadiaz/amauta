import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { CalificacionesRapidasSection } from '@/components/calificaciones/CalificacionesRapidasSection';

export default async function CalificacionesPage() {
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
          Carga rápida de calificaciones
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Seleccioná grupo, período académico y materia para registrar o
          actualizar calificaciones con feedback inmediato.
        </p>
      </div>

      <CalificacionesRapidasSection />
    </div>
  );
}
