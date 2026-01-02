/**
 * JWT Authentication Guard
 *
 * Verifica tokens JWT de NextAuth y adjunta el usuario al request.
 * Los endpoints marcados con @Public() se saltan la verificación.
 *
 * El token debe enviarse en el header:
 * Authorization: Bearer <token>
 */

import {
  Injectable,
  UnauthorizedException,
  Logger,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { Reflector } from '@nestjs/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { ConfigService } from '@nestjs/config';
import * as jose from 'jose';
import type { Rol } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../../prisma/prisma.service';

export interface RequestUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: Rol;
}

interface JWTPayload {
  id?: string;
  sub?: string;
  email?: string;
  rol?: Rol;
  name?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar si el endpoint es público
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: RequestUser;
    }>();

    const token = this.extractToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      const payload = await this.verifyToken(token);
      const userId = payload.id ?? payload.sub;

      if (!userId) {
        throw new UnauthorizedException('Token inválido: sin ID de usuario');
      }

      // Verificar que el usuario existe y está activo
      const user = await this.prisma.usuario.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          rol: true,
          activo: true,
        },
      });

      if (!user || !user.activo) {
        throw new UnauthorizedException('Usuario no encontrado o desactivado');
      }

      // Adjuntar usuario al request
      request.user = {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.warn(
        `Error verificando token: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw new UnauthorizedException('Token inválido');
    }
  }

  private extractToken(authHeader?: string): string | null {
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }

  private async verifyToken(token: string): Promise<JWTPayload> {
    const secret = this.configService.get<string>('AUTH_SECRET');

    if (!secret) {
      throw new Error('AUTH_SECRET no configurado');
    }

    // NextAuth usa HMAC SHA256 con el secret encodeado
    const encodedSecret = new TextEncoder().encode(secret);

    const { payload } = await jose.jwtVerify(token, encodedSecret, {
      algorithms: ['HS256'],
    });

    return payload as JWTPayload;
  }
}
