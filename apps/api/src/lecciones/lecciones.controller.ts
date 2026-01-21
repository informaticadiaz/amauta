/**
 * Controller de Lecciones
 *
 * Maneja los endpoints CRUD de lecciones
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { LeccionesService, type LeccionResponse } from './lecciones.service';
import type { CreateLeccionDto } from './dto/create-leccion.dto';
import type {
  UpdateLeccionDto,
  ReordenarLeccionesDto,
} from './dto/update-leccion.dto';
import type { QueryLeccionesDto } from './dto/query-lecciones.dto';
import { Public, CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/guards';

interface LeccionResponseWrapper {
  leccion: LeccionResponse;
  message: string;
}

interface ListaLeccionesResponse {
  lecciones: LeccionResponse[];
  total: number;
}

@Controller()
export class LeccionesController {
  constructor(private readonly leccionesService: LeccionesService) {}

  /**
   * Listar lecciones de un curso
   *
   * GET /api/v1/cursos/:cursoId/lecciones
   *
   * Query params:
   * - publicadas: filtrar solo publicadas (true/false)
   */
  @Public()
  @Get('cursos/:cursoId/lecciones')
  async listar(
    @Param('cursoId') cursoId: string,
    @Query() query: QueryLeccionesDto
  ): Promise<ListaLeccionesResponse> {
    const lecciones = await this.leccionesService.listarPorCurso(
      cursoId,
      query.publicadas
    );
    return {
      lecciones,
      total: lecciones.length,
    };
  }

  /**
   * Obtener lección por ID
   *
   * GET /api/v1/lecciones/:id
   */
  @Public()
  @Get('lecciones/:id')
  async obtenerPorId(@Param('id') id: string): Promise<LeccionResponseWrapper> {
    const leccion = await this.leccionesService.obtenerPorId(id);
    return {
      leccion,
      message: 'Lección obtenida exitosamente',
    };
  }

  /**
   * Crear una nueva lección
   *
   * POST /api/v1/cursos/:cursoId/lecciones
   */
  @Post('cursos/:cursoId/lecciones')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async crear(
    @Param('cursoId') cursoId: string,
    @Body() dto: CreateLeccionDto,
    @CurrentUser() user: RequestUser
  ): Promise<LeccionResponseWrapper> {
    const leccion = await this.leccionesService.crear(cursoId, dto, user.id);
    return {
      leccion,
      message: 'Lección creada exitosamente',
    };
  }

  /**
   * Actualizar una lección
   *
   * PATCH /api/v1/lecciones/:id
   */
  @Patch('lecciones/:id')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateLeccionDto,
    @CurrentUser() user: RequestUser
  ): Promise<LeccionResponseWrapper> {
    const leccion = await this.leccionesService.actualizar(id, dto, user.id);
    return {
      leccion,
      message: 'Lección actualizada exitosamente',
    };
  }

  /**
   * Eliminar una lección
   *
   * DELETE /api/v1/lecciones/:id
   */
  @Delete('lecciones/:id')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser
  ): Promise<void> {
    await this.leccionesService.eliminar(id, user.id);
  }

  /**
   * Reordenar lecciones de un curso
   *
   * PATCH /api/v1/cursos/:cursoId/lecciones/reordenar
   */
  @Patch('cursos/:cursoId/lecciones/reordenar')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async reordenar(
    @Param('cursoId') cursoId: string,
    @Body() dto: ReordenarLeccionesDto,
    @CurrentUser() user: RequestUser
  ): Promise<ListaLeccionesResponse> {
    const lecciones = await this.leccionesService.reordenar(
      cursoId,
      dto,
      user.id
    );
    return {
      lecciones,
      total: lecciones.length,
    };
  }
}
