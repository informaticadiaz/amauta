import { Module } from '@nestjs/common';
import { InstitucionesController } from './instituciones.controller';
import { InstitucionesService } from './instituciones.service';

@Module({
  controllers: [InstitucionesController],
  providers: [InstitucionesService],
  exports: [InstitucionesService],
})
export class InstitucionesModule {}
