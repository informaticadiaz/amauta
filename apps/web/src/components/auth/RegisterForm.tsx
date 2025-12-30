'use client';

/**
 * Formulario de Registro
 */

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './AuthForm.module.css';

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      nombre: formData.get('nombre') as string,
      apellido: formData.get('apellido') as string,
      rol: formData.get('rol') as string,
    };

    // Validar contraseña
    const confirmPassword = formData.get('confirmPassword') as string;
    if (data.password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      // Registrar usuario
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error en el registro');
        setLoading(false);
        return;
      }

      // Auto-login después del registro
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError('Registro exitoso. Por favor inicia sesión.');
        router.push('/login');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="nombre" className={styles.label}>
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            autoComplete="given-name"
            className={styles.input}
            placeholder="Juan"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="apellido" className={styles.label}>
            Apellido
          </label>
          <input
            id="apellido"
            name="apellido"
            type="text"
            required
            autoComplete="family-name"
            className={styles.input}
            placeholder="Pérez"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={styles.input}
          placeholder="tu@email.com"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="rol" className={styles.label}>
          Soy...
        </label>
        <select
          id="rol"
          name="rol"
          className={styles.select}
          defaultValue="ESTUDIANTE"
        >
          <option value="ESTUDIANTE">Estudiante</option>
          <option value="EDUCADOR">Educador</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className={styles.input}
          placeholder="Mínimo 8 caracteres"
          minLength={8}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="confirmPassword" className={styles.label}>
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className={styles.input}
          placeholder="Repite tu contraseña"
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button type="submit" disabled={loading} className={styles.button}>
        {loading ? 'Registrando...' : 'Crear cuenta'}
      </button>
    </form>
  );
}
