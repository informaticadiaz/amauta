/**
 * Controller de Evaluaciones
 */

import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Inject,
} from '@nestjs/common';
import { Roles, CurrentUser } from '../common/decorators';
import type { RequestUser } from '../common/guards';
import {
  EvaluacionesService,
  type EvaluacionResponse as EvaluacionEntity,
  type ListaEvaluacionesResponse,
} from './evaluaciones.service';
import type { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import type { QueryEvaluacionesDto } from './dto/query-evaluaciones.dto';
import type { PublicarEvaluacionDto } from './dto/publicar-evaluacion.dto';

interface EvaluacionResponse {
  evaluacion: EvaluacionEntity;
  message: string;
}

@Controller()
export class EvaluacionesController {
  constructor(
    @Inject(EvaluacionesService)
    private readonly evaluacionesService: EvaluacionesService
  ) {}

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

  @Get('evaluaciones/:id')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async obtenerDetalle(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser
  ): Promise<EvaluacionResponse> {
    const evaluacion = await this.evaluacionesService.obtenerDetalle(
      id,
      user.id
    );
    return {
      evaluacion,
      message: 'Evaluación obtenida exitosamente',
    };
  }

  @Patch('evaluaciones/:id/publicar')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async cambiarEstadoPublicacion(
    @Param('id') id: string,
    @Body() dto: PublicarEvaluacionDto,
    @CurrentUser() user: RequestUser
  ): Promise<EvaluacionResponse> {
    const evaluacion = await this.evaluacionesService.cambiarEstadoPublicacion(
      id,
      dto,
      user.id
    );
    const message = dto.publicar
      ? 'Evaluación publicada exitosamente'
      : 'Evaluación despublicada';
    return {
      evaluacion,
      message,
    };
  }
}
