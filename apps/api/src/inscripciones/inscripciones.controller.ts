/**
 * Controller de Inscripciones
 *
 * Maneja los endpoints para inscripción de estudiantes en cursos
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import {
  InscripcionesService,
  type InscripcionConCurso,
} from './inscripciones.service';
import type { QueryInscripcionesDto } from './dto/query-inscripciones.dto';
import { CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/guards';

interface InscripcionResponse {
  inscripcion: InscripcionConCurso;
  message: string;
}

interface ListaInscripcionesResponse {
  inscripciones: InscripcionConCurso[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface EstadoInscripcionResponse {
  inscripcion: InscripcionConCurso | null;
  inscrito: boolean;
}

@Controller()
export class InscripcionesController {
  constructor(private readonly inscripcionesService: InscripcionesService) {}

  /**
   * Listar mis cursos (inscripciones del estudiante)
   *
   * GET /api/v1/mis-cursos
   *
   * Query params:
   * - page: número de página (default: 1)
   * - limit: resultados por página (default: 10, max: 100)
   * - estado: filtrar por estado (ACTIVO, COMPLETADO, ABANDONADO)
   * - ordenarPor: campo para ordenar (inscritoEn, progreso)
   * - orden: dirección (asc, desc)
   */
  @Get('mis-cursos')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async listarMisInscripciones(
    @CurrentUser() user: RequestUser,
    @Query() query: QueryInscripcionesDto
  ): Promise<ListaInscripcionesResponse> {
    return this.inscripcionesService.listarMisInscripciones(user.id, query);
  }

  /**
   * Inscribirse en un curso
   *
   * POST /api/v1/cursos/:id/inscribir
   */
  @Post('cursos/:id/inscribir')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async inscribirse(
    @Param('id') cursoId: string,
    @CurrentUser() user: RequestUser
  ): Promise<InscripcionResponse> {
    const inscripcion = await this.inscripcionesService.inscribirse(
      cursoId,
      user.id
    );
    return {
      inscripcion,
      message: 'Te has inscrito exitosamente en el curso',
    };
  }

  /**
   * Cancelar inscripción en un curso
   *
   * DELETE /api/v1/cursos/:id/inscribir
   */
  @Delete('cursos/:id/inscribir')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelarInscripcion(
    @Param('id') cursoId: string,
    @CurrentUser() user: RequestUser
  ): Promise<void> {
    await this.inscripcionesService.cancelarInscripcion(cursoId, user.id);
  }

  /**
   * Obtener estado de inscripción en un curso
   *
   * GET /api/v1/cursos/:id/inscripcion
   */
  @Get('cursos/:id/inscripcion')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async obtenerEstadoInscripcion(
    @Param('id') cursoId: string,
    @CurrentUser() user: RequestUser
  ): Promise<EstadoInscripcionResponse> {
    const inscripcion =
      await this.inscripcionesService.obtenerEstadoInscripcion(
        cursoId,
        user.id
      );
    return {
      inscripcion,
      inscrito: inscripcion !== null && inscripcion.estado === 'ACTIVO',
    };
  }
}
