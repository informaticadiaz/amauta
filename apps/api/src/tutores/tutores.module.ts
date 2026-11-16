import { Module } from '@nestjs/common';
import { BoletinModule } from '../boletin/boletin.module';
import { CalificacionesModule } from '../calificaciones/calificaciones.module';
import { ComunicadosModule } from '../comunicados/comunicados.module';
import { TutorAccessService } from '../common/tutor-access.service';
import { TutoresController } from './tutores.controller';
import { TutorReadService } from './tutor-read.service';
import { TutoresService } from './tutores.service';

@Module({
  imports: [BoletinModule, CalificacionesModule, ComunicadosModule],
  controllers: [TutoresController],
  providers: [TutoresService, TutorAccessService, TutorReadService],
})
export class TutoresModule {}
