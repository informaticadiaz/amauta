'use client';

/**
 * Componente RequireRole
 *
 * Wrapper que solo renderiza sus children si el usuario tiene uno de los roles permitidos.
 * Si no tiene el rol, muestra el fallback o redirige.
 *
 * @example
 * <RequireRole roles={['EDUCADOR', 'ADMIN_ESCUELA']}>
 *   <CreateCourseButton />
 * </RequireRole>
 *
 * @example Con fallback personalizado
 * <RequireRole roles={['SUPER_ADMIN']} fallback={<AccessDenied />}>
 *   <AdminPanel />
 * </RequireRole>
 */

import { useAuthorization } from '@/hooks/useAuthorization';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

type Rol = 'ESTUDIANTE' | 'EDUCADOR' | 'ADMIN_ESCUELA' | 'SUPER_ADMIN';

interface RequireRoleProps {
  roles: Rol[];
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function RequireRole({
  roles,
  children,
  fallback = null,
  redirectTo,
}: RequireRoleProps) {
  const { isLoading, isAuthenticated, hasAnyRole } = useAuthorization();
  const router = useRouter();

  const hasRequiredRole = hasAnyRole(...roles);

  useEffect(() => {
    if (!isLoading && redirectTo) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!hasRequiredRole) {
        router.push(redirectTo);
      }
    }
  }, [isLoading, isAuthenticated, hasRequiredRole, redirectTo, router]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !hasRequiredRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
