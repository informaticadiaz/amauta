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
  type ResumenMensualAsistenciaResponse,
  type MisAsistenciasResponse,
} from './asistencias.service';
import type { QueryAsistenciasDto } from './dto/query-asistencias.dto';
import type { QueryResumenMensualDto } from './dto/query-resumen-mensual.dto';
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

  @Get('me/asistencias')
  @Roles('ESTUDIANTE')
  async getMisAsistencias(
    @Query('mes') mes: string | undefined,
    @Query('anio') anio: string | undefined,
    @CurrentUser() user: RequestUser
  ): Promise<MisAsistenciasResponse> {
    return this.asistenciasService.getMisAsistencias(
      user.id,
      mes !== undefined ? parseInt(mes, 10) : undefined,
      anio !== undefined ? parseInt(anio, 10) : undefined
    );
  }

  @Get('grupos/:grupoId/asistencias')
  @Roles('ADMIN_ESCUELA', 'EDUCADOR')
  async obtenerNominaDelDia(
    @Param('grupoId') grupoId: string,
    @Query() query: QueryAsistenciasDto,
    @CurrentUser() user: RequestUser
  ): Promise<NominaAsistenciaResponse> {
    return this.asistenciasService.obtenerNominaDelDia(grupoId, query, user.id);
  }

  @Get('grupos/:grupoId/asistencias/resumen-mensual')
  @Roles('ADMIN_ESCUELA', 'EDUCADOR')
  async obtenerResumenMensual(
    @Param('grupoId') grupoId: string,
    @Query() query: QueryResumenMensualDto,
    @CurrentUser() user: RequestUser
  ): Promise<ResumenMensualAsistenciaResponse> {
    return this.asistenciasService.obtenerResumenMensual(
      grupoId,
      query,
      user.id
    );
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
