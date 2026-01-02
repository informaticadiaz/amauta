'use client';

/**
 * Menú móvil (hamburguesa)
 *
 * Se muestra en dispositivos móviles y tablets pequeñas
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthorization } from '@/hooks/useAuthorization';

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function MobileMenuButton({
  isOpen,
  onClick,
  className = '',
}: MobileMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-md p-2 text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary ${className}`}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
    >
      <span className="sr-only">{isOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
      {isOpen ? (
        // X icon
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ) : (
        // Hamburger icon
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      )}
    </button>
  );
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { isAuthenticated, canManageCourses, isAdmin } = useAuthorization();

  if (!isOpen) return null;

  const navItems = [
    { href: '/cursos', label: 'Explorar cursos', show: true },
    { href: '/dashboard', label: 'Dashboard', show: isAuthenticated },
    {
      href: '/dashboard/mis-cursos',
      label: 'Mis cursos',
      show: isAuthenticated,
    },
    {
      href: '/dashboard/crear-curso',
      label: 'Crear curso',
      show: canManageCourses,
    },
    { href: '/dashboard/usuarios', label: 'Usuarios', show: isAdmin },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu panel */}
      <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-[var(--background)] shadow-xl lg:hidden">
        <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4">
          <span className="text-lg font-bold text-[var(--foreground)]">
            <span className="text-primary">A</span>mauta
          </span>
          <MobileMenuButton isOpen={true} onClick={onClose} />
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navItems
            .filter((item) => item.show)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:no-underline ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-[var(--foreground)] hover:bg-[var(--border)]'
                }`}
              >
                {item.label}
              </Link>
            ))}
        </nav>
      </div>
    </>
  );
}
