/**
 * Servicio de Autenticación
 *
 * Maneja la lógica de login y registro de usuarios
 */

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { PrismaService } from '../prisma/prisma.service';
import { loginSchema, type LoginDto } from './dto/login.dto';
import { registerSchema, type RegisterDto } from './dto/register.dto';
import type { Rol } from '@prisma/client';

const SALT_ROUNDS = 10;

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: Rol;
  avatar: string | null;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida credenciales y retorna usuario
   */
  async login(dto: LoginDto): Promise<AuthUser> {
    // Validar datos de entrada
    const result = loginSchema.safeParse(dto);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Datos inválidos';
      throw new BadRequestException(message);
    }

    const { email, password } = result.data;

    // Buscar usuario por email
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        avatar: true,
        password: true,
        activo: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que el usuario esté activo
    if (!usuario.activo) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Retornar usuario sin password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, activo: __, ...user } = usuario;
    return user;
  }

  /**
   * Registra un nuevo usuario
   */
  async register(dto: RegisterDto): Promise<AuthUser> {
    // Validar datos de entrada
    const result = registerSchema.safeParse(dto);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Datos inválidos';
      throw new BadRequestException(message);
    }

    const { email, password, nombre, apellido, rol } = result.data;

    // Verificar que el email no exista
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Crear usuario
    const usuario = await this.prisma.usuario.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        nombre,
        apellido,
        rol: rol as Rol,
        perfil: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        avatar: true,
      },
    });

    return usuario;
  }

  /**
   * Obtiene un usuario por ID
   */
  async getUserById(id: string): Promise<AuthUser | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        avatar: true,
        activo: true,
      },
    });

    if (!usuario || !usuario.activo) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { activo: _, ...user } = usuario;
    return user;
  }
}
