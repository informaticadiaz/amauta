'use client';

/**
 * Menú de usuario
 *
 * Muestra avatar y opciones del usuario logueado
 */

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import styles from './UserMenu.module.css';

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!session?.user) {
    return (
      <div className={styles.authLinks}>
        <Link href="/login" className={styles.loginLink}>
          Iniciar sesión
        </Link>
        <Link href="/register" className={styles.registerLink}>
          Registrarse
        </Link>
      </div>
    );
  }

  const initials = session.user.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  return (
    <div className={styles.container} ref={menuRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'Avatar'}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>{initials}</div>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{session.user.name}</span>
            <span className={styles.userEmail}>{session.user.email}</span>
            <span className={styles.userRole}>{session.user.rol}</span>
          </div>

          <div className={styles.divider} />

          <Link
            href="/dashboard"
            className={styles.menuItem}
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            href="/dashboard/perfil"
            className={styles.menuItem}
            onClick={() => setIsOpen(false)}
          >
            Mi perfil
          </Link>

          <div className={styles.divider} />

          <button
            className={styles.logoutButton}
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
