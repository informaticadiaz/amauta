/**
 * Controller de Autenticación
 *
 * Maneja los endpoints de login y registro
 */

import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { AuthService, type AuthUser } from './auth.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import { Public, CurrentUser } from '../common/decorators';
import type { RequestUser } from '../common/guards';

interface AuthResponse {
  user: AuthUser;
  message: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login de usuario
   *
   * POST /api/v1/auth/login
   */
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    const user = await this.authService.login(dto);
    return {
      user,
      message: 'Login exitoso',
    };
  }

  /**
   * Registro de usuario
   *
   * POST /api/v1/auth/register
   */
  @Public()
  @Throttle({ default: { limit: 3, ttl: 300000 } })
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    const user = await this.authService.register(dto);
    return {
      user,
      message: 'Registro exitoso',
    };
  }

  /**
   * Obtener usuario actual (desde token)
   *
   * GET /api/v1/auth/me
   */
  @SkipThrottle()
  @Get('me')
  async getMe(@CurrentUser() user: RequestUser): Promise<AuthUser> {
    // El usuario ya está verificado por el guard
    return this.authService.getUserById(user.id) as Promise<AuthUser>;
  }

  /**
   * Obtener usuario por ID (requiere autenticación)
   *
   * GET /api/v1/auth/user/:id
   */
  @Get('user/:id')
  async getUser(@Param('id') id: string): Promise<AuthUser | null> {
    return this.authService.getUserById(id);
  }
}
