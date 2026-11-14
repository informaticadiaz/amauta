import { Module } from '@nestjs/common';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { AlertasController } from './alertas.controller';
import { AlertasService } from './alertas.service';

@Module({
  imports: [NotificacionesModule],
  controllers: [AlertasController],
  providers: [AlertasService],
})
export class AlertasModule {}
