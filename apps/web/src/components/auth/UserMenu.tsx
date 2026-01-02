'use client';

/**
 * Menú de usuario
 *
 * Muestra avatar y opciones del usuario logueado
 */

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

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
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)] hover:no-underline"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover hover:no-underline"
        >
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
    <div className="relative" ref={menuRef}>
      <button
        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary transition-colors hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'Avatar'}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-lg">
          <div className="border-b border-[var(--border)] p-3">
            <p className="text-sm font-medium text-[var(--foreground)]">
              {session.user.name}
            </p>
            <p className="text-xs text-[var(--muted)]">{session.user.email}</p>
            <span className="mt-1 inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {session.user.rol}
            </span>
          </div>

          <div className="p-1">
            <Link
              href="/dashboard"
              className="block rounded-md px-3 py-2 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--border)] hover:no-underline"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/perfil"
              className="block rounded-md px-3 py-2 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--border)] hover:no-underline"
              onClick={() => setIsOpen(false)}
            >
              Mi perfil
            </Link>
          </div>

          <div className="border-t border-[var(--border)] p-1">
            <button
              className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
