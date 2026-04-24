import { Controller, Get, Inject, Param, Patch, Query } from '@nestjs/common';
import { CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/guards';
import {
  NotificacionesService,
  type ListaNotificacionesResponse,
  type NotificacionItem,
} from './notificaciones.service';
import type { QueryNotificacionesDto } from './dto/query-notificaciones.dto';

interface NotificacionResponse {
  notificacion: NotificacionItem;
  message: string;
}

@Controller()
export class NotificacionesController {
  constructor(
    @Inject(NotificacionesService)
    private readonly notificacionesService: NotificacionesService
  ) {}

  @Get('notificaciones')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async listar(
    @Query() query: QueryNotificacionesDto,
    @CurrentUser() user: RequestUser
  ): Promise<ListaNotificacionesResponse> {
    return this.notificacionesService.listar(user.id, query);
  }

  @Patch('notificaciones/:id/leida')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async marcarComoLeida(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser
  ): Promise<NotificacionResponse> {
    const notificacion = await this.notificacionesService.marcarComoLeida(
      id,
      user.id
    );

    return {
      notificacion,
      message: 'Notificación marcada como leída',
    };
  }
}
