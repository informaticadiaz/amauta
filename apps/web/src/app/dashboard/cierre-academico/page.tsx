import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { CierreAcademicoSection } from '@/components/cierre-academico/CierreAcademicoSection';

export default async function CierreAcademicoPage() {
  const session = await auth();
  if (!session) redirect('/login');
  if (session.user?.rol !== 'ADMIN_ESCUELA') redirect('/dashboard');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Cierre académico
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Revisá la promoción de todos los grupos y cerrá un período completo.
        </p>
      </div>
      <CierreAcademicoSection />
    </div>
  );
}
