import { Controller, Get, Inject, Post } from '@nestjs/common';
import { CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/guards';
import {
  AlertasService,
  type DeteccionAlertasResponse,
  type ListaAlertasResponse,
} from './alertas.service';

@Controller('alertas')
@Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
export class AlertasController {
  constructor(
    @Inject(AlertasService) private readonly alertasService: AlertasService
  ) {}

  @Post('detectar')
  async detectar(
    @CurrentUser() user: RequestUser
  ): Promise<DeteccionAlertasResponse> {
    return this.alertasService.detectar(user.id);
  }

  @Get()
  async listar(
    @CurrentUser() user: RequestUser
  ): Promise<ListaAlertasResponse> {
    return this.alertasService.listar(user.id);
  }
}
