/**
 * Configuración y validación de variables de entorno para API
 *
 * Este módulo utiliza Zod para validar todas las variables de entorno
 * requeridas al iniciar la aplicación. Si alguna variable falta o tiene
 * un valor inválido, la aplicación no se iniciará y mostrará un error claro.
 */

import { z } from 'zod';

/**
 * Schema de validación para variables de entorno
 * Define el tipo y las restricciones de cada variable
 */
const envSchema = z.object({
  // General
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  API_PORT: z
    .string()
    .default('3001')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val < 65536, {
      message: 'API_PORT debe estar entre 1 y 65535',
    }),

  API_HOST: z.string().default('localhost'),

  API_URL: z
    .string()
    .url('API_URL debe ser una URL válida')
    .default('http://localhost:3001'),

  // Base de datos
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL es requerida')
    .regex(
      /^postgresql:\/\/.+/,
      'DATABASE_URL debe ser una conexión PostgreSQL válida'
    ),

  DATABASE_POOL_MIN: z
    .string()
    .optional()
    .default('2')
    .transform((val) => parseInt(val, 10)),

  DATABASE_POOL_MAX: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10)),

  // Seguridad
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),

  JWT_EXPIRES_IN: z
    .string()
    .default('7d')
    .refine((val) => /^\d+[smhd]$/.test(val), {
      message: 'JWT_EXPIRES_IN debe tener formato: 1s, 1m, 1h, 1d',
    }),

  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET debe tener al menos 32 caracteres')
    .optional(),

  // CORS
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:3000')
    .transform((val) => val.split(',').map((origin) => origin.trim())),

  // Redis (opcional)
  REDIS_URL: z.string().url('REDIS_URL debe ser una URL válida').optional(),

  REDIS_CACHE_TTL: z
    .string()
    .optional()
    .default('3600')
    .transform((val) => parseInt(val, 10)),

  // Archivos y uploads
  UPLOAD_DIR: z.string().default('./uploads'),

  MAX_FILE_SIZE: z
    .string()
    .default('10485760')
    .transform((val) => parseInt(val, 10)),

  ALLOWED_FILE_TYPES: z
    .string()
    .default('image/jpeg,image/png,image/gif,application/pdf')
    .transform((val) => val.split(',').map((type) => type.trim())),

  // Email SMTP (opcional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM_NAME: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().email().optional(),

  // Logs
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
    .default('debug'),

  LOG_FORMAT: z.enum(['json', 'simple', 'pretty']).default('pretty'),

  // Frontend
  FRONTEND_URL: z
    .string()
    .url('FRONTEND_URL debe ser una URL válida')
    .default('http://localhost:3000'),

  // Rate limiting
  RATE_LIMIT_MAX: z
    .string()
    .default('100')
    .transform((val) => parseInt(val, 10)),

  RATE_LIMIT_WINDOW_MS: z
    .string()
    .default('15')
    .transform((val) => parseInt(val, 10) * 60 * 1000), // convertir minutos a ms

  // Debug
  DEBUG: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true'),

  DEBUG_PRISMA: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

/**
 * Tipo TypeScript inferido del schema de validación
 * Proporciona autocompletado y type-safety para las variables de entorno
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Función para validar y parsear las variables de entorno
 *
 * @throws {Error} Si las variables de entorno son inválidas
 * @returns {Env} Variables de entorno validadas y parseadas
 */
function validateEnv(): Env {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err) => {
        const path = err.path.join('.');
        return `  - ${path}: ${err.message}`;
      });

      console.error('❌ Error en la configuración de variables de entorno:\n');
      console.error(errorMessages.join('\n'));
      console.error(
        '\n📄 Revisa el archivo .env.example para ver las variables requeridas.\n'
      );

      process.exit(1);
    }
    throw error;
  }
}

/**
 * Variables de entorno validadas y listas para usar
 * Exportar como constante para usarla en toda la aplicación
 *
 * Ejemplo de uso:
 * ```typescript
 * import { env } from './config/env';
 *
 * console.log(env.API_PORT); // TypeScript sabe que es un number
 * console.log(env.DATABASE_URL); // TypeScript sabe que es un string
 * ```
 */
export const env = validateEnv();

/**
 * Helper para verificar si estamos en un entorno específico
 */
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
