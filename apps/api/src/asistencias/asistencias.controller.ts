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
  AsistenciasService,
  type NominaAsistenciaResponse,
  type RegistroAsistenciasResponse,
} from './asistencias.service';
import type { QueryAsistenciasDto } from './dto/query-asistencias.dto';
import type { RegistrarAsistenciasDto } from './dto/registrar-asistencias.dto';

interface RegistroAsistenciasWrapper {
  resultado: RegistroAsistenciasResponse;
  message: string;
}

@Controller()
export class AsistenciasController {
  constructor(
    @Inject(AsistenciasService)
    private readonly asistenciasService: AsistenciasService
  ) {}

  @Get('grupos/:grupoId/asistencias')
  @Roles('ADMIN_ESCUELA', 'EDUCADOR')
  async obtenerNominaDelDia(
    @Param('grupoId') grupoId: string,
    @Query() query: QueryAsistenciasDto,
    @CurrentUser() user: RequestUser
  ): Promise<NominaAsistenciaResponse> {
    return this.asistenciasService.obtenerNominaDelDia(grupoId, query, user.id);
  }

  @Put('grupos/:grupoId/asistencias')
  @Roles('ADMIN_ESCUELA', 'EDUCADOR')
  async registrarAsistenciasDelDia(
    @Param('grupoId') grupoId: string,
    @Body() dto: RegistrarAsistenciasDto,
    @CurrentUser() user: RequestUser
  ): Promise<RegistroAsistenciasWrapper> {
    const resultado = await this.asistenciasService.registrarAsistenciasDelDia(
      grupoId,
      dto,
      user.id
    );

    return {
      resultado,
      message: 'Asistencias registradas exitosamente',
    };
  }
}
