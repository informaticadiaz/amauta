/**
 * Decorador @CurrentUser()
 *
 * Extrae el usuario autenticado del request.
 * Usar en endpoints protegidos para obtener info del usuario.
 *
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: RequestUser) {
 *   return user;
 * }
 */

import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { RequestUser } from '../guards/jwt-auth.guard';

export const CurrentUser = createParamDecorator(
  (
    data: keyof RequestUser | undefined,
    ctx: ExecutionContext
  ): RequestUser | string | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  }
);
