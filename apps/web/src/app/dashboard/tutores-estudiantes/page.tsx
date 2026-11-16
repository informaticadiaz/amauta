import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { TutorEstudiantesSection } from '@/components/tutores/TutorEstudiantesSection';

export default async function TutoresEstudiantesPage() {
  const session = await auth();
  if (!session) redirect('/login');
  if (!['ADMIN_ESCUELA', 'SUPER_ADMIN'].includes(session.user?.rol ?? '')) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Vínculos tutor-estudiante
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Gestioná los tutores vinculados a estudiantes con matrícula activa.
        </p>
      </div>
      <TutorEstudiantesSection />
    </div>
  );
}
