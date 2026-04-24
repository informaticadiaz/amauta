import { Module } from '@nestjs/common';
import { ForosController } from './foros.controller';
import { ForosService } from './foros.service';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [NotificacionesModule],
  controllers: [ForosController],
  providers: [ForosService],
})
export class ForosModule {}
