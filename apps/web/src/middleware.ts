/**
 * Middleware de Autenticación y Autorización
 *
 * Protege rutas que requieren autenticación y/o roles específicos.
 *
 * Configuración de rutas protegidas por rol en ROUTE_ROLES.
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

type Rol = 'ESTUDIANTE' | 'EDUCADOR' | 'ADMIN_ESCUELA' | 'SUPER_ADMIN';

/**
 * Configuración de rutas protegidas por rol
 *
 * - Rutas que empiezan con el path requieren uno de los roles listados
 * - Si una ruta no está aquí, solo requiere autenticación
 * - Rutas más específicas deben ir primero
 */
const ROUTE_ROLES: { path: string; roles: Rol[] }[] = [
  // Rutas de administración (solo admins)
  { path: '/admin', roles: ['ADMIN_ESCUELA', 'SUPER_ADMIN'] },
  { path: '/dashboard/admin', roles: ['ADMIN_ESCUELA', 'SUPER_ADMIN'] },
  { path: '/dashboard/usuarios', roles: ['ADMIN_ESCUELA', 'SUPER_ADMIN'] },

  // Rutas de educador
  {
    path: '/dashboard/cursos/crear',
    roles: ['EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN'],
  },
  {
    path: '/dashboard/cursos/editar',
    roles: ['EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN'],
  },
  {
    path: '/dashboard/mis-cursos',
    roles: ['EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN'],
  },

  // El dashboard general está abierto a todos los autenticados
];

function getRequiredRoles(pathname: string): Rol[] | null {
  for (const route of ROUTE_ROLES) {
    if (pathname.startsWith(route.path)) {
      return route.roles;
    }
  }
  return null; // No requiere rol específico, solo autenticación
}

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const pathname = nextUrl.pathname;

  // Rutas públicas (no requieren autenticación)
  const publicPaths = ['/', '/login', '/register', '/about'];
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith('/api/')
  );

  if (isPublicPath) {
    // Si está logueado y va a login/register, redirigir a dashboard
    if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    return NextResponse.next();
  }

  // Rutas protegidas
  if (!isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar roles si la ruta los requiere
  const requiredRoles = getRequiredRoles(pathname);

  if (requiredRoles) {
    const userRol = session.user.rol as Rol;

    if (!requiredRoles.includes(userRol)) {
      // Redirigir a página de acceso denegado o dashboard
      const deniedUrl = new URL('/dashboard', nextUrl);
      deniedUrl.searchParams.set('error', 'access_denied');
      return NextResponse.redirect(deniedUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
