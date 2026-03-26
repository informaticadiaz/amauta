/**
 * Controller de gestión de grupos/clases
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Inject,
} from '@nestjs/common';
import { Roles, CurrentUser } from '../common/decorators';
import type { RequestUser } from '../common/guards';
import {
  GruposService,
  type GrupoResponse,
  type ListaGruposResponse,
} from './grupos.service';
import type { CreateGrupoDto } from './dto/create-grupo.dto';
import type { UpdateGrupoDto } from './dto/update-grupo.dto';
import type { QueryGruposDto } from './dto/query-grupos.dto';
import type { AsignarEstudiantesGrupoDto } from './dto/asignar-estudiantes.dto';
import type { QueryGrupoEstudiantesDto } from './dto/query-grupo-estudiantes.dto';

interface GrupoWrapper {
  grupo: GrupoResponse;
  message: string;
}

interface AsignacionEstudiantesWrapper {
  resultado: Awaited<ReturnType<GruposService['asignarEstudiantes']>>;
  message: string;
}

@Controller()
export class GruposController {
  constructor(
    @Inject(GruposService) private readonly gruposService: GruposService
  ) {}

  @Post('instituciones/:institucionId/grupos')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async crear(
    @Param('institucionId') institucionId: string,
    @Body() dto: CreateGrupoDto,
    @CurrentUser() user: RequestUser
  ): Promise<GrupoWrapper> {
    const grupo = await this.gruposService.crear(institucionId, dto, user.id);
    return {
      grupo,
      message: 'Grupo creado exitosamente',
    };
  }

  @Get('instituciones/:institucionId/grupos')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async listar(
    @Param('institucionId') institucionId: string,
    @Query() query: QueryGruposDto,
    @CurrentUser() user: RequestUser
  ): Promise<ListaGruposResponse> {
    return this.gruposService.listar(institucionId, query, user.id);
  }

  @Get('grupos/:id')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async obtenerPorId(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser
  ): Promise<GrupoWrapper> {
    const grupo = await this.gruposService.obtenerPorId(id, user.id);
    return {
      grupo,
      message: 'Grupo obtenido exitosamente',
    };
  }

  @Patch('grupos/:id')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateGrupoDto,
    @CurrentUser() user: RequestUser
  ): Promise<GrupoWrapper> {
    const grupo = await this.gruposService.actualizar(id, dto, user.id);
    return {
      grupo,
      message: 'Grupo actualizado exitosamente',
    };
  }

  @Delete('grupos/:id')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser
  ): Promise<void> {
    await this.gruposService.eliminar(id, user.id);
  }

  @Post('grupos/:id/estudiantes')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async asignarEstudiantes(
    @Param('id') id: string,
    @Body() dto: AsignarEstudiantesGrupoDto,
    @CurrentUser() user: RequestUser
  ): Promise<AsignacionEstudiantesWrapper> {
    const resultado = await this.gruposService.asignarEstudiantes(
      id,
      dto,
      user.id
    );

    return {
      resultado,
      message: 'Asignación de estudiantes completada',
    };
  }

  @Get('grupos/:id/estudiantes')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async listarEstudiantes(
    @Param('id') id: string,
    @Query() query: QueryGrupoEstudiantesDto,
    @CurrentUser() user: RequestUser
  ): Promise<Awaited<ReturnType<GruposService['listarEstudiantes']>>> {
    return this.gruposService.listarEstudiantes(id, query, user.id);
  }

  @Delete('grupos/:id/estudiantes/:estudianteId')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removerEstudiante(
    @Param('id') id: string,
    @Param('estudianteId') estudianteId: string,
    @CurrentUser() user: RequestUser
  ): Promise<void> {
    await this.gruposService.removerEstudiante(id, estudianteId, user.id);
  }
}
