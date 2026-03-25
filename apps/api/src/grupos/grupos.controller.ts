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

interface GrupoWrapper {
  grupo: GrupoResponse;
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
}
