/**
 * Página de Registro
 */

import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import styles from '../auth.module.css';

export const metadata = {
  title: 'Crear cuenta - Amauta',
  description: 'Crea tu cuenta en Amauta y comienza a aprender',
};

export default function RegisterPage() {
  return (
    <>
      <h1 className={styles.title}>Crea tu cuenta</h1>
      <p className={styles.subtitle}>
        Únete a nuestra comunidad de aprendizaje
      </p>

      <RegisterForm />

      <p className={styles.link}>
        ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
      </p>
    </>
  );
}
