/**
 * Seed Entry Point
 *
 * Ejecutar con: npm run prisma:seed
 *
 * Este script puebla la base de datos con datos de prueba.
 * Es idempotente: puede ejecutarse múltiples veces sin duplicar datos.
 *
 * Usuarios de prueba (password: password123):
 * - superadmin@amauta.test (SUPER_ADMIN)
 * - admin1@amauta.test, admin2@amauta.test (ADMIN_ESCUELA)
 * - educador1-3@amauta.test (EDUCADOR)
 * - estudiante1-4@amauta.test (ESTUDIANTE)
 */

import { PrismaClient } from '@prisma/client';
import { runAllSeeds } from './seeds';

const prisma = new PrismaClient();

async function main() {
  try {
    await runAllSeeds(prisma);
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
