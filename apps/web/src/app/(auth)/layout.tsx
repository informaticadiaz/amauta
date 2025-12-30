/**
 * Layout para páginas de autenticación
 *
 * Centrado y con diseño limpio
 */

import Link from 'next/link';
import styles from './auth.module.css';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>
          Amauta
        </Link>
        {children}
      </div>
    </div>
  );
}
