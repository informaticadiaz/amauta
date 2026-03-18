/**
 * Controller de Evaluaciones
 */

import { Body, Controller, Post } from '@nestjs/common';
import { Roles, CurrentUser } from '../common/decorators';
import type { RequestUser } from '../common/guards';
import type { EvaluacionesService } from './evaluaciones.service';
import { type EvaluacionResponse as EvaluacionEntity } from './evaluaciones.service';
import type { CreateEvaluacionDto } from './dto/create-evaluacion.dto';

interface EvaluacionResponse {
  evaluacion: EvaluacionEntity;
  message: string;
}

@Controller('evaluaciones')
export class EvaluacionesController {
  constructor(private readonly evaluacionesService: EvaluacionesService) {}

  @Post()
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
}
