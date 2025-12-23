/**
 * Módulo principal de la aplicación
 *
 * Configura todos los módulos, controllers y providers de la API
 */

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
