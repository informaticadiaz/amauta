/**
 * Controller de Inscripciones
 *
 * Maneja el endpoint /mis-cursos para listar inscripciones del estudiante.
 * Los endpoints de inscripción/cancelación están en CursosController
 * como sub-recursos de cursos.
 */

import { Controller, Get, Query } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import {
  InscripcionesService,
  type InscripcionConCurso,
} from './inscripciones.service';
import type { QueryInscripcionesDto } from './dto/query-inscripciones.dto';
import { CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/guards';

interface ListaInscripcionesResponse {
  inscripciones: InscripcionConCurso[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
}
