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
  Res,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
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
import type { AsignarEducadorGrupoDto } from './dto/asignar-educador.dto';
import type { QueryGrupoEducadoresDto } from './dto/query-grupo-educadores.dto';
import type { QueryReporteAsistenciaDto } from './dto/query-reporte-asistencia.dto';
import type { QueryReporteRendimientoDto } from './dto/query-reporte-rendimiento.dto';

interface GrupoWrapper {
  grupo: GrupoResponse;
  message: string;
}

interface AsignacionEstudiantesWrapper {
  resultado: Awaited<ReturnType<GruposService['asignarEstudiantes']>>;
  message: string;
}

interface AsignacionEducadorWrapper {
  asignacion: Awaited<ReturnType<GruposService['asignarEducador']>>;
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

  @Post('grupos/:id/educadores')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async asignarEducador(
    @Param('id') id: string,
    @Body() dto: AsignarEducadorGrupoDto,
    @CurrentUser() user: RequestUser
  ): Promise<AsignacionEducadorWrapper> {
    const asignacion = await this.gruposService.asignarEducador(
      id,
      dto,
      user.id
    );

    return {
      asignacion,
      message: 'Educador asignado exitosamente',
    };
  }

  @Get('grupos/:id/educadores')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async listarEducadores(
    @Param('id') id: string,
    @Query() query: QueryGrupoEducadoresDto,
    @CurrentUser() user: RequestUser
  ): Promise<Awaited<ReturnType<GruposService['listarEducadores']>>> {
    return this.gruposService.listarEducadores(id, query, user.id);
  }

  @Delete('grupos/:id/educadores/:educadorId')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removerEducador(
    @Param('id') id: string,
    @Param('educadorId') educadorId: string,
    @CurrentUser() user: RequestUser
  ): Promise<void> {
    await this.gruposService.removerEducador(id, educadorId, user.id);
  }

  @Get('educadores/me/grupos')
  @Roles('EDUCADOR')
  async listarMisGruposComoEducador(
    @Query() query: QueryGrupoEducadoresDto,
    @CurrentUser() user: RequestUser
  ): Promise<
    Awaited<ReturnType<GruposService['listarMisGruposComoEducador']>>
  > {
    return this.gruposService.listarMisGruposComoEducador(query, user.id);
  }

  @Get('grupos/:id/reportes/asistencia/csv')
  @Roles('ADMIN_ESCUELA', 'EDUCADOR')
  async reporteAsistenciaCsv(
    @Param('id') grupoId: string,
    @Query() query: QueryReporteAsistenciaDto,
    @CurrentUser() user: RequestUser,
    @Res() res: FastifyReply
  ): Promise<void> {
    const csv = await this.gruposService.reporteAsistenciaCsv(
      grupoId,
      query,
      user.id
    );
    const filename = `reporte-asistencia-${grupoId}.csv`;
    void res
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .send(csv);
  }

  @Get('grupos/:id/reportes/asistencia')
  @Roles('ADMIN_ESCUELA', 'EDUCADOR')
  async reporteAsistencia(
    @Param('id') grupoId: string,
    @Query() query: QueryReporteAsistenciaDto,
    @CurrentUser() user: RequestUser
  ): Promise<Awaited<ReturnType<GruposService['reporteAsistencia']>>> {
    return this.gruposService.reporteAsistencia(grupoId, query, user.id);
  }

  @Get('grupos/:id/reportes/rendimiento')
  @Roles('ADMIN_ESCUELA', 'EDUCADOR')
  async reporteRendimiento(
    @Param('id') grupoId: string,
    @Query() query: QueryReporteRendimientoDto,
    @CurrentUser() user: RequestUser
  ): Promise<Awaited<ReturnType<GruposService['reporteRendimiento']>>> {
    return this.gruposService.reporteRendimiento(grupoId, query, user.id);
  }
}
