import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/guards';
import {
  CalificacionesService,
  type CargaCalificacionesResponse,
  type ListaCalificacionesResponse,
} from './calificaciones.service';
import type { QueryCalificacionesDto } from './dto/query-calificaciones.dto';
import type { CargarCalificacionesDto } from './dto/cargar-calificaciones.dto';

interface CargaCalificacionesWrapper {
  resultado: CargaCalificacionesResponse;
  message: string;
}

@Controller()
export class CalificacionesController {
  constructor(
    @Inject(CalificacionesService)
    private readonly calificacionesService: CalificacionesService
  ) {}

  @Get('grupos/:grupoId/calificaciones')
  @Roles('ADMIN_ESCUELA', 'EDUCADOR')
  async listarCalificaciones(
    @Param('grupoId') grupoId: string,
    @Query() query: QueryCalificacionesDto,
    @CurrentUser() user: RequestUser
  ): Promise<ListaCalificacionesResponse> {
    return this.calificacionesService.listarCalificaciones(
      grupoId,
      query,
      user.id
    );
  }

  @Put('grupos/:grupoId/calificaciones')
  @Roles('ADMIN_ESCUELA', 'EDUCADOR')
  async cargarCalificaciones(
    @Param('grupoId') grupoId: string,
    @Body() dto: CargarCalificacionesDto,
    @CurrentUser() user: RequestUser
  ): Promise<CargaCalificacionesWrapper> {
    const resultado = await this.calificacionesService.cargarCalificaciones(
      grupoId,
      dto,
      user.id
    );

    return {
      resultado,
      message: 'Calificaciones cargadas exitosamente',
    };
  }
}
