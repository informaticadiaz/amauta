import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { MatriculasSection } from '@/components/matriculas/MatriculasSection';

export default async function MatriculasPage() {
  const session = await auth();
  if (!session) redirect('/login');
  if (session.user?.rol !== 'ADMIN_ESCUELA') redirect('/dashboard');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Matrículas
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Gestioná el padrón institucional y las matrículas por período
          académico.
        </p>
      </div>
      <MatriculasSection />
    </div>
  );
}
