import { Controller, Get, Inject, Param } from '@nestjs/common';
import { CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/guards';
import { HistorialService, type HistorialResponse } from './historial.service';

@Controller()
export class HistorialController {
  constructor(
    @Inject(HistorialService)
    private readonly historialService: HistorialService
  ) {}

  @Get('me/historial')
  @Roles('ESTUDIANTE')
  getMiHistorial(@CurrentUser() user: RequestUser): Promise<HistorialResponse> {
    return this.historialService.getHistorial(user.id);
  }

  @Get('instituciones/:institucionId/estudiantes/:estudianteId/historial')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  getHistorialEstudiante(
    @Param('institucionId') institucionId: string,
    @Param('estudianteId') estudianteId: string,
    @CurrentUser() user: RequestUser
  ): Promise<HistorialResponse> {
    return this.historialService.getHistorialAdministrativo(
      institucionId,
      estudianteId,
      user.id
    );
  }
}
