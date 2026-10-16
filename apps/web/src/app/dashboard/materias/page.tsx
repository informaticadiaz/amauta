import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { MateriasSection } from '@/components/materias/MateriasSection';
export default async function MateriasPage() {
  const session = await auth();
  if (!session) redirect('/login');
  if (session.user?.rol !== 'ADMIN_ESCUELA') redirect('/dashboard');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Materias escolares</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Administrá las materias del recorrido escolar formal de tu
          institución.
        </p>
      </div>
      <MateriasSection />
    </div>
  );
}
