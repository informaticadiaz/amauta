/**
 * Decorador @Public()
 *
 * Marca un endpoint como público (sin autenticación requerida).
 * Usar cuando un endpoint debe ser accesible sin token.
 *
 * @example
 * @Public()
 * @Get('health')
 * healthCheck() { return 'ok'; }
 */

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
