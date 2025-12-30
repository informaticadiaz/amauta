/**
 * Página de Login
 */

import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import styles from '../auth.module.css';

export const metadata = {
  title: 'Iniciar sesión - Amauta',
  description: 'Inicia sesión en tu cuenta de Amauta',
};

export default function LoginPage() {
  return (
    <>
      <h1 className={styles.title}>Bienvenido de nuevo</h1>
      <p className={styles.subtitle}>Ingresa tus credenciales para continuar</p>

      <LoginForm />

      <p className={styles.link}>
        ¿No tienes cuenta? <Link href="/register">Regístrate</Link>
      </p>
    </>
  );
}
