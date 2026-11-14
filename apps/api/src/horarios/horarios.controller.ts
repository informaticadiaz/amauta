import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/guards';
import { HorariosService } from './horarios.service';
import type {
  CreateHorarioDto,
  QueryHorarioDto,
  UpdateHorarioDto,
} from './dto/horario.dto';

@Controller()
export class HorariosController {
  constructor(
    @Inject(HorariosService) private readonly horarios: HorariosService
  ) {}

  @Post('grupos/:grupoId/horarios')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async crear(
    @Param('grupoId') grupoId: string,
    @Body() dto: CreateHorarioDto,
    @CurrentUser() user: RequestUser
  ) {
    return {
      horario: await this.horarios.crear(grupoId, dto, user.id),
      message: 'Horario creado exitosamente',
    };
  }

  @Get('grupos/:grupoId/horarios')
  @Roles('ADMIN_ESCUELA', 'EDUCADOR', 'ESTUDIANTE', 'SUPER_ADMIN')
  async listarPorGrupo(
    @Param('grupoId') grupoId: string,
    @Query() query: QueryHorarioDto,
    @CurrentUser() user: RequestUser
  ) {
    return this.horarios.listarPorGrupo(grupoId, query, user.id);
  }

  @Patch('horarios/:id')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateHorarioDto,
    @CurrentUser() user: RequestUser
  ) {
    return {
      horario: await this.horarios.actualizar(id, dto, user.id),
      message: 'Horario actualizado exitosamente',
    };
  }

  @Delete('horarios/:id')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser
  ): Promise<void> {
    await this.horarios.eliminar(id, user.id);
  }

  @Get('educadores/me/horarios')
  @Roles('EDUCADOR')
  listarMisHorariosEducador(
    @Query() query: QueryHorarioDto,
    @CurrentUser() user: RequestUser
  ) {
    return this.horarios.listarMisHorariosEducador(user.id, query);
  }

  @Get('me/horarios')
  @Roles('ESTUDIANTE')
  listarMisHorariosEstudiante(
    @Query() query: QueryHorarioDto,
    @CurrentUser() user: RequestUser
  ) {
    return this.horarios.listarMisHorariosEstudiante(user.id, query);
  }
}
