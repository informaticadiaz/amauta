/**
 * Dashboard principal
 *
 * Página protegida que muestra resumen del usuario
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import styles from './dashboard.module.css';

export const metadata = {
  title: 'Dashboard - Amauta',
  description: 'Tu panel de control en Amauta',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.welcome}>
          Bienvenido, <strong>{session.user.name}</strong>
        </p>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <h2>Tu información</h2>
          <dl className={styles.info}>
            <div>
              <dt>Email</dt>
              <dd>{session.user.email}</dd>
            </div>
            <div>
              <dt>Rol</dt>
              <dd className={styles.role}>{session.user.rol}</dd>
            </div>
            <div>
              <dt>ID</dt>
              <dd className={styles.id}>{session.user.id}</dd>
            </div>
          </dl>
        </div>

        <div className={styles.card}>
          <h2>Próximamente</h2>
          <p className={styles.placeholder}>
            {session.user.rol === 'EDUCADOR' ||
            session.user.rol === 'SUPER_ADMIN' ? (
              <>Aquí podrás gestionar tus cursos y ver estadísticas.</>
            ) : (
              <>Aquí verás tus cursos y progreso de aprendizaje.</>
            )}
          </p>
        </div>
      </main>

      <footer className={styles.footer}>
        <a href="/api/auth/signout" className={styles.logoutLink}>
          Cerrar sesión
        </a>
      </footer>
    </div>
  );
}
