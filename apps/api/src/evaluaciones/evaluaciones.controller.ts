/**
 * Controller de Evaluaciones
 */

import { Body, Controller, Get, Post, Param, Query } from '@nestjs/common';
import { Roles, CurrentUser } from '../common/decorators';
import type { RequestUser } from '../common/guards';
import type { EvaluacionesService } from './evaluaciones.service';
import {
  type EvaluacionResponse as EvaluacionEntity,
  type ListaEvaluacionesResponse,
} from './evaluaciones.service';
import type { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import type { QueryEvaluacionesDto } from './dto/query-evaluaciones.dto';

interface EvaluacionResponse {
  evaluacion: EvaluacionEntity;
  message: string;
}

@Controller()
export class EvaluacionesController {
  constructor(private readonly evaluacionesService: EvaluacionesService) {}

  @Post('evaluaciones')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async crear(
    @Body() dto: CreateEvaluacionDto,
    @CurrentUser() user: RequestUser
  ): Promise<EvaluacionResponse> {
    const evaluacion = await this.evaluacionesService.crear(dto, user.id);
    return {
      evaluacion,
      message: 'Evaluación creada exitosamente',
    };
  }

  @Get('cursos/:cursoId/evaluaciones')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async listarPorCurso(
    @Param('cursoId') cursoId: string,
    @Query() query: QueryEvaluacionesDto,
    @CurrentUser() user: RequestUser
  ): Promise<ListaEvaluacionesResponse> {
    return this.evaluacionesService.listarPorCurso(cursoId, query, user.id);
  }
}
