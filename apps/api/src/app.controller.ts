/**
 * Controller principal de la API
 *
 * Maneja los endpoints básicos: health check, info de API
 */

import { Controller, Get } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import {
  AppService,
  type HealthResponse,
  type ApiInfoResponse,
} from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check endpoint
   * Usado por Docker/Kubernetes para verificar que el servicio está vivo
   *
   * GET /health
   */
  @Get('health')
  getHealth(): HealthResponse {
    return this.appService.getHealth();
  }

  /**
   * Root endpoint - información básica
   *
   * GET /
   */
  @Get()
  getRoot(): ApiInfoResponse {
    return this.appService.getApiInfo();
  }

  /**
   * API info endpoint
   * Información detallada de la API
   *
   * GET /api/v1
   */
  @Get('info')
  getApiInfo(): ApiInfoResponse {
    return this.appService.getApiInfo();
  }
}
