import { Module } from '@nestjs/common';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { UploadsModule } from '../uploads/uploads.module';
import { JustificacionesController } from './justificaciones.controller';
import { JustificacionesService } from './justificaciones.service';

@Module({
  imports: [UploadsModule, NotificacionesModule],
  controllers: [JustificacionesController],
  providers: [JustificacionesService],
})
export class JustificacionesModule {}
