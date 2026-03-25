import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Roles, CurrentUser } from '../common/decorators';
import type { RequestUser } from '../common/guards';
import type { InstitucionesService } from './instituciones.service';

@Controller('instituciones')
export class InstitucionesController {
  constructor(
    @Inject(InstitucionesService)
    private readonly institucionesService: InstitucionesService
  ) {}

  // ============================================================
  // PERÍODOS ACADÉMICOS
  // ============================================================

  @Post(':institucionId/periodos')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async crearPeriodo(
    @Param('institucionId') institucionId: string,
    @Body() dto: unknown,
    @CurrentUser() _user: RequestUser
  ) {
    const periodo = await this.institucionesService.crearPeriodo(
      institucionId,
      dto
    );
    return { periodo, message: 'Período académico creado exitosamente' };
  }

  @Get(':institucionId/periodos')
  @Roles('ADMIN_ESCUELA', 'EDUCADOR', 'SUPER_ADMIN')
  async listarPeriodos(@Param('institucionId') institucionId: string) {
    const periodos =
      await this.institucionesService.listarPeriodos(institucionId);
    return { periodos };
  }

  @Patch(':institucionId/periodos/:id')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async actualizarPeriodo(
    @Param('institucionId') _institucionId: string,
    @Param('id') id: string,
    @Body() dto: unknown,
    @CurrentUser() _user: RequestUser
  ) {
    const periodo = await this.institucionesService.actualizarPeriodo(id, dto);
    return { periodo, message: 'Período académico actualizado exitosamente' };
  }

  @Delete(':institucionId/periodos/:id')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarPeriodo(
    @Param('institucionId') _institucionId: string,
    @Param('id') id: string,
    @CurrentUser() _user: RequestUser
  ): Promise<void> {
    await this.institucionesService.eliminarPeriodo(id);
  }

  // ============================================================
  // ESCALA DE CALIFICACIÓN
  // ============================================================

  @Get(':institucionId/escala-calificacion')
  @Roles('ADMIN_ESCUELA', 'EDUCADOR', 'SUPER_ADMIN')
  async obtenerEscala(@Param('institucionId') institucionId: string) {
    const escala = await this.institucionesService.obtenerEscala(institucionId);
    return { escala };
  }

  @Put(':institucionId/escala-calificacion')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async upsertEscala(
    @Param('institucionId') institucionId: string,
    @Body() dto: unknown,
    @CurrentUser() _user: RequestUser
  ) {
    const escala = await this.institucionesService.upsertEscala(
      institucionId,
      dto
    );
    return {
      escala,
      message: 'Escala de calificación actualizada exitosamente',
    };
  }
}
