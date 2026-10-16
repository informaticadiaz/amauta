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
} from '@nestjs/common';
import { CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/guards';
import type { MateriasService } from './materias.service';
import type { CreateMateriaDto, UpdateMateriaDto } from './dto/materia.dto';

@Controller()
export class MateriasController {
  constructor(private readonly materias: MateriasService) {}

  @Post('instituciones/:institucionId/materias')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async crear(
    @Param('institucionId') institucionId: string,
    @Body() dto: CreateMateriaDto,
    @CurrentUser() user: RequestUser
  ) {
    const materia = await this.materias.crear(institucionId, dto, user.id);
    return { materia, message: 'Materia creada exitosamente' };
  }
  @Get('instituciones/:institucionId/materias')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async listar(
    @Param('institucionId') institucionId: string,
    @Query('incluirInactivas') incluirInactivas: string | undefined,
    @CurrentUser() user: RequestUser
  ) {
    return {
      materias: await this.materias.listar(
        institucionId,
        user.id,
        incluirInactivas === 'true'
      ),
    };
  }
  @Patch('materias/:id')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateMateriaDto,
    @CurrentUser() user: RequestUser
  ) {
    return {
      materia: await this.materias.actualizar(id, dto, user.id),
      message: 'Materia actualizada exitosamente',
    };
  }
  @Delete('materias/:id')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async desactivar(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return {
      materia: await this.materias.desactivar(id, user.id),
      message: 'Materia desactivada exitosamente',
    };
  }
  @Get('grupos/:grupoId/materias')
  @Roles('ADMIN_ESCUELA', 'EDUCADOR', 'SUPER_ADMIN')
  async listarPorGrupo(
    @Param('grupoId') grupoId: string,
    @CurrentUser() user: RequestUser
  ) {
    return { materias: await this.materias.listarPorGrupo(grupoId, user.id) };
  }
  @Post('grupos/:grupoId/materias/:materiaId')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async asignar(
    @Param('grupoId') grupoId: string,
    @Param('materiaId') materiaId: string,
    @CurrentUser() user: RequestUser
  ) {
    return {
      asignacion: await this.materias.asignarAGrupo(
        grupoId,
        materiaId,
        user.id
      ),
      message: 'Materia asignada al grupo',
    };
  }
  @Delete('grupos/:grupoId/materias/:materiaId')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(
    @Param('grupoId') grupoId: string,
    @Param('materiaId') materiaId: string,
    @CurrentUser() user: RequestUser
  ): Promise<void> {
    await this.materias.removerDeGrupo(grupoId, materiaId, user.id);
  }
}
