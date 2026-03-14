/**
 * Controller de Progreso
 *
 * Endpoints para seguimiento de progreso de estudiantes.
 */

import { Controller, Get, Post, Param } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import {
  ProgresoService,
  type CompletarLeccionResponse,
  type ProgresoCursoResponse,
  type ProgresoEstudiantesResponse,
} from './progreso.service';
import { Roles, CurrentUser } from '../common/decorators';
import type { RequestUser } from '../common/guards';

@Controller()
export class ProgresoController {
  constructor(private readonly progresoService: ProgresoService) {}

  /**
   * Marcar lección como completada
   *
   * POST /api/v1/lecciones/:id/completar
   *
   * Solo ESTUDIANTE puede marcar sus propias lecciones.
   */
  @Post('lecciones/:id/completar')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async completarLeccion(
    @Param('id') leccionId: string,
    @CurrentUser() user: RequestUser
  ): Promise<CompletarLeccionResponse> {
    return this.progresoService.completarLeccion(leccionId, user.id);
  }

  /**
   * Obtener mi progreso en un curso
   *
   * GET /api/v1/cursos/:id/progreso
   */
  @Get('cursos/:id/progreso')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async obtenerProgresoCurso(
    @Param('id') cursoId: string,
    @CurrentUser() user: RequestUser
  ): Promise<ProgresoCursoResponse> {
    return this.progresoService.obtenerProgresoCurso(cursoId, user.id);
  }

  /**
   * Obtener progreso de todos los estudiantes (para educador)
   *
   * GET /api/v1/cursos/:id/estudiantes/progreso
   */
  @Get('cursos/:id/estudiantes/progreso')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async obtenerProgresoEstudiantes(
    @Param('id') cursoId: string,
    @CurrentUser() user: RequestUser
  ): Promise<ProgresoEstudiantesResponse> {
    return this.progresoService.obtenerProgresoEstudiantes(cursoId, user.id);
  }
}
