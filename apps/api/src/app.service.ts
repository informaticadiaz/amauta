/**
 * Service principal de la API
 *
 * Proporciona lógica para endpoints básicos
 */

import { Injectable } from '@nestjs/common';
import { env } from './config/env';

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  uptime: number;
}

export interface ApiInfoResponse {
  name: string;
  version: string;
  description: string;
  environment: string;
  documentation: string;
  repository: string;
}

@Injectable()
export class AppService {
  private readonly startTime: Date;

  constructor() {
    this.startTime = new Date();
  }

  /**
   * Obtiene el estado de salud del servicio
   */
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
    };
  }

  /**
   * Obtiene información de la API
   */
  getApiInfo(): ApiInfoResponse {
    return {
      name: 'Amauta API',
      version: '0.1.0',
      description: 'Sistema educativo para la gestión del aprendizaje',
      environment: env.NODE_ENV,
      documentation:
        'https://github.com/informaticadiaz/amauta/blob/master/docs/technical/architecture.md',
      repository: 'https://github.com/informaticadiaz/amauta',
    };
  }
}
