/**
 * Módulo de Lecciones
 *
 * Provee funcionalidad CRUD de lecciones
 */

import { Module } from '@nestjs/common';
import { LeccionesController } from './lecciones.controller';
import { LeccionesService } from './lecciones.service';

@Module({
  controllers: [LeccionesController],
  providers: [LeccionesService],
  exports: [LeccionesService],
})
export class LeccionesModule {}
