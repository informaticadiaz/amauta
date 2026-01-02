/**
 * Roles Guard
 *
 * Verifica que el usuario autenticado tenga uno de los roles permitidos.
 * Debe usarse después de JwtAuthGuard.
 *
 * @example
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
 * @Get('admin')
 * adminEndpoint() { ... }
 */

import {
  Injectable,
  ForbiddenException,
  Logger,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { Reflector } from '@nestjs/core';
import type { Rol } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { RequestUser } from './jwt-auth.guard';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener roles requeridos del decorador
    const requiredRoles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles definidos, permitir acceso (solo requiere autenticación)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const hasRole = requiredRoles.includes(user.rol);

    if (!hasRole) {
      this.logger.warn(
        `Acceso denegado: usuario ${user.id} (${user.rol}) intentó acceder a ruta que requiere ${requiredRoles.join(', ')}`
      );
      throw new ForbiddenException(
        `Acceso denegado. Roles permitidos: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}
