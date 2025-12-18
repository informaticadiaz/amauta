// Prisma Configuration - Amauta
// Configura Prisma para leer variables de entorno desde .env.local
import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// Cargar variables de entorno desde .env.local
config({ path: '.env.local' });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  engine: 'classic',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
