/**
 * Módulo de Cursos
 *
 * Provee funcionalidad CRUD de cursos e inscripciones (sub-recurso)
 */

import { Module } from '@nestjs/common';
import { CursosController } from './cursos.controller';
import { CursosService } from './cursos.service';
import { InscripcionesModule } from '../inscripciones/inscripciones.module';

@Module({
  imports: [InscripcionesModule],
  controllers: [CursosController],
  providers: [CursosService],
  exports: [CursosService],
})
export class CursosModule {}
