/**
 * Entry point de la API de Amauta
 *
 * Configura y arranca el servidor NestJS con Fastify
 */

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import { AppModule } from './app.module';
import { env, isDevelopment } from './config/env';

async function bootstrap() {
  // Crear aplicación con Fastify adapter
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: isDevelopment,
    })
  );

  // Registrar plugin para uploads multipart
  await app.register(multipart, {
    limits: {
      fileSize: env.MAX_FILE_SIZE,
    },
  });

  // Servir archivos estáticos (uploads)
  await app.register(fastifyStatic, {
    root: join(__dirname, '..', env.UPLOAD_DIR),
    prefix: '/uploads/',
    decorateReply: false,
  });

  // Configurar CORS
  app.enableCors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Prefijo global para API
  app.setGlobalPrefix('api/v1', {
    exclude: ['/', 'health', 'uploads/(.*)'],
  });

  // Iniciar servidor
  const host = env.API_HOST === 'localhost' ? '0.0.0.0' : env.API_HOST;
  const port = env.API_PORT;

  await app.listen(port, host);

  console.log(`
╔════════════════════════════════════════════════════════════╗
║                      AMAUTA API                            ║
╠════════════════════════════════════════════════════════════╣
║  Versión:     ${env.NODE_ENV.padEnd(43)}║
║  Puerto:      ${String(port).padEnd(43)}║
║  Host:        ${host.padEnd(43)}║
║  URL:         http://${host}:${port}${' '.repeat(Math.max(0, 35 - host.length - String(port).length))}║
╚════════════════════════════════════════════════════════════╝
  `);
}

bootstrap().catch((error) => {
  console.error('Error al iniciar la API:', error);
  process.exit(1);
});
