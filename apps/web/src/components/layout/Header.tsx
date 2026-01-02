'use client';

/**
 * Header principal de la aplicación
 *
 * Muestra logo, navegación principal y estado de sesión
 */

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { UserMenu } from '@/components/auth/UserMenu';
import { MobileMenuButton } from './MobileMenu';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Header({ onMenuToggle, isMobileMenuOpen }: HeaderProps) {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo y botón móvil */}
        <div className="flex items-center gap-4">
          {isAuthenticated && onMenuToggle && (
            <MobileMenuButton
              isOpen={isMobileMenuOpen || false}
              onClick={onMenuToggle}
              className="lg:hidden"
            />
          )}
          <Link
            href={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)] hover:no-underline"
          >
            <span className="text-primary">A</span>
            <span className="hidden sm:inline">Amauta</span>
          </Link>
        </div>

        {/* Navegación desktop */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/cursos"
            className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)] hover:no-underline"
          >
            Cursos
          </Link>
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)] hover:no-underline"
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Usuario / Auth */}
        <div className="flex items-center">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
