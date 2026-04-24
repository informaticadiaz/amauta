/**
 * Módulo principal de la aplicación
 *
 * Configura todos los módulos, controllers y providers de la API
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CursosModule } from './cursos/cursos.module';
import { LeccionesModule } from './lecciones/lecciones.module';
import { UploadsModule } from './uploads/uploads.module';
import { CategoriasModule } from './categorias/categorias.module';
import { InscripcionesModule } from './inscripciones/inscripciones.module';
import { ProgresoModule } from './progreso/progreso.module';
import { EvaluacionesModule } from './evaluaciones/evaluaciones.module';
import { InstitucionesModule } from './instituciones/instituciones.module';
import { GruposModule } from './grupos/grupos.module';
import { AsistenciasModule } from './asistencias/asistencias.module';
import { CalificacionesModule } from './calificaciones/calificaciones.module';
import { ForosModule } from './foros/foros.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { JwtAuthGuard, RolesGuard } from './common/guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // ventana de 1 minuto
        limit: 100, // límite general (auth endpoints tienen límites más estrictos)
      },
    ]),
    PrismaModule,
    AuthModule,
    CursosModule,
    LeccionesModule,
    UploadsModule,
    CategoriasModule,
    InscripcionesModule,
    ProgresoModule,
    EvaluacionesModule,
    InstitucionesModule,
    GruposModule,
    AsistenciasModule,
    CalificacionesModule,
    NotificacionesModule,
    ForosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guards globales: throttler primero, luego auth, luego roles
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
