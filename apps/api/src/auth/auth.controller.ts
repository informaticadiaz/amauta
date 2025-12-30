/**
 * Controller de Autenticación
 *
 * Maneja los endpoints de login y registro
 */

import { Controller, Post, Body, Get, Param } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { AuthService, type AuthUser } from './auth.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

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
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    const user = await this.authService.register(dto);
    return {
      user,
      message: 'Registro exitoso',
    };
  }

  /**
   * Obtener usuario por ID (para verificar sesión)
   *
   * GET /api/v1/auth/user/:id
   */
  @Get('user/:id')
  async getUser(@Param('id') id: string): Promise<AuthUser | null> {
    return this.authService.getUserById(id);
  }
}
