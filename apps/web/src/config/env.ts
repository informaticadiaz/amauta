/**
 * Configuración y validación de variables de entorno para Web (Next.js)
 *
 * Este módulo utiliza Zod para validar todas las variables de entorno
 * requeridas al iniciar la aplicación. Si alguna variable falta o tiene
 * un valor inválido, la aplicación no se iniciará y mostrará un error claro.
 *
 * IMPORTANTE:
 * - Variables con NEXT_PUBLIC_ son accesibles en el cliente (navegador)
 * - Variables sin NEXT_PUBLIC_ solo están disponibles en el servidor
 * - Next.js valida variables en tiempo de build y runtime
 */

import { z } from 'zod';

/**
 * Schema para variables del servidor (solo server-side)
 */
const serverSchema = z.object({
  // General
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z
    .string()
    .default('3000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val < 65536, {
      message: 'PORT debe estar entre 1 y 65535',
    }),

  // API Backend (server-side)
  API_URL: z
    .string()
    .url('API_URL debe ser una URL válida')
    .default('http://localhost:3001'),

  // NextAuth
  NEXTAUTH_URL: z
    .string()
    .url('NEXTAUTH_URL debe ser una URL válida')
    .default('http://localhost:3000'),

  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET debe tener al menos 32 caracteres'),

  // Base de datos (si se usa Prisma en el frontend)
  DATABASE_URL: z
    .string()
    .regex(
      /^postgresql:\/\/.+/,
      'DATABASE_URL debe ser una conexión PostgreSQL válida'
    )
    .optional(),

  // Cloudinary (secrets)
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // AWS S3 (secrets)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),

  // Análisis de bundle
  ANALYZE: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

/**
 * Schema para variables del cliente (NEXT_PUBLIC_*)
 * Estas variables están disponibles en el navegador
 */
const clientSchema = z.object({
  // API Backend (client-side)
  NEXT_PUBLIC_API_URL: z
    .string()
    .url('NEXT_PUBLIC_API_URL debe ser una URL válida')
    .default('http://localhost:3001'),

  // Características de la aplicación
  NEXT_PUBLIC_APP_NAME: z.string().default('Amauta'),

  NEXT_PUBLIC_APP_URL: z
    .string()
    .url('NEXT_PUBLIC_APP_URL debe ser una URL válida')
    .default('http://localhost:3000'),

  NEXT_PUBLIC_APP_VERSION: z.string().default('0.1.0'),

  // Analytics
  NEXT_PUBLIC_GA_ID: z.string().optional(),

  // Sentry
  NEXT_PUBLIC_SENTRY_DSN: z
    .string()
    .url('NEXT_PUBLIC_SENTRY_DSN debe ser una URL válida')
    .optional(),

  // Cloudinary (public)
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),

  // PWA
  NEXT_PUBLIC_PWA_ENABLED: z
    .string()
    .optional()
    .default('true')
    .transform((val) => val === 'true'),

  // Debug (cliente)
  NEXT_PUBLIC_DEBUG: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true'),

  NEXT_PUBLIC_ENABLE_VERBOSE_LOGGING: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

/**
 * Schema combinado para todas las variables de entorno
 */
const envSchema = serverSchema.merge(clientSchema);

/**
 * Tipo TypeScript para variables del servidor
 */
export type ServerEnv = z.infer<typeof serverSchema>;

/**
 * Tipo TypeScript para variables del cliente
 */
export type ClientEnv = z.infer<typeof clientSchema>;

/**
 * Tipo TypeScript para todas las variables de entorno
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Función para validar variables del servidor
 * Solo se ejecuta en el servidor, no en el cliente
 */
function validateServerEnv(): Env {
  // En el cliente, solo validamos las variables públicas
  if (typeof window !== 'undefined') {
    return validateClientEnv() as Env;
  }

  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err) => {
        const path = err.path.join('.');
        return `  - ${path}: ${err.message}`;
      });

      console.error(
        '❌ Error en la configuración de variables de entorno (servidor):\n'
      );
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
 * Función para validar variables del cliente
 * Se ejecuta tanto en servidor como en cliente
 */
function validateClientEnv(): ClientEnv {
  // En Next.js, las variables NEXT_PUBLIC_ están disponibles en process.env
  // incluso en el cliente (se reemplazan en build time)
  const clientEnv: Record<string, string | undefined> = {};

  // Extraer solo las variables NEXT_PUBLIC_
  Object.keys(process.env).forEach((key) => {
    if (key.startsWith('NEXT_PUBLIC_')) {
      clientEnv[key] = process.env[key];
    }
  });

  try {
    const parsed = clientSchema.parse(clientEnv);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err) => {
        const path = err.path.join('.');
        return `  - ${path}: ${err.message}`;
      });

      console.error(
        '❌ Error en la configuración de variables de entorno (cliente):\n'
      );
      console.error(errorMessages.join('\n'));
      console.error(
        '\n📄 Revisa el archivo .env.example para ver las variables requeridas.\n'
      );

      // En el cliente, no podemos usar process.exit
      if (typeof window === 'undefined') {
        process.exit(1);
      }
    }
    throw error;
  }
}

/**
 * Variables de entorno validadas y listas para usar
 * En el servidor: incluye todas las variables
 * En el cliente: solo incluye NEXT_PUBLIC_*
 *
 * Ejemplo de uso:
 * ```typescript
 * // En componentes del servidor (Server Components)
 * import { env } from '@/config/env';
 * console.log(env.API_URL); // Funciona
 * console.log(env.NEXTAUTH_SECRET); // Funciona
 *
 * // En componentes del cliente (Client Components)
 * import { env } from '@/config/env';
 * console.log(env.NEXT_PUBLIC_API_URL); // Funciona
 * console.log(env.API_URL); // ❌ undefined en el cliente
 * ```
 */
export const env = validateServerEnv();

/**
 * Variables de entorno del cliente (solo NEXT_PUBLIC_*)
 * Usar esta cuando necesites acceso explícito a variables del cliente
 */
export const clientEnv = validateClientEnv();

/**
 * Helper para verificar si estamos en un entorno específico
 */
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

/**
 * Helper para verificar si estamos en el cliente
 */
export const isClient = typeof window !== 'undefined';

/**
 * Helper para verificar si estamos en el servidor
 */
export const isServer = typeof window === 'undefined';
