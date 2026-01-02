'use client';

/**
 * Componente AccessDenied
 *
 * Mensaje estándar cuando el usuario no tiene permisos para acceder.
 */

import Link from 'next/link';
import { useAuthorization } from '@/hooks/useAuthorization';

interface AccessDeniedProps {
  message?: string;
  showBackButton?: boolean;
}

export function AccessDenied({
  message = 'No tienes permisos para acceder a esta sección.',
  showBackButton = true,
}: AccessDeniedProps) {
  const { user } = useAuthorization();

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 text-6xl">🔒</div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">Acceso Denegado</h2>
      <p className="mb-6 max-w-md text-gray-600">{message}</p>
      {user && (
        <p className="mb-4 text-sm text-gray-500">
          Tu rol actual: <span className="font-medium">{user.rol}</span>
        </p>
      )}
      {showBackButton && (
        <Link
          href="/dashboard"
          className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          Volver al Dashboard
        </Link>
      )}
    </div>
  );
}
