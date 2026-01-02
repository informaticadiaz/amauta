/**
 * Decorador @Roles()
 *
 * Define qué roles pueden acceder a un endpoint.
 * Usar en conjunto con RolesGuard.
 *
 * @example
 * @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
 * @Get('admin-only')
 * getAdminData() { ... }
 */

import { SetMetadata } from '@nestjs/common';
import type { Rol } from '@prisma/client';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
