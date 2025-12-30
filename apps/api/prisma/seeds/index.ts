/**
 * Orquestador de Seeds
 *
 * Ejecuta todos los seeds en el orden correcto respetando dependencias.
 * Cada etapa es idempotente (puede re-ejecutarse sin duplicar datos).
 */

import type { PrismaClient } from '@prisma/client';
import { seedUsuarios } from './usuarios';
import { seedCategorias } from './categorias';
import { seedInstituciones } from './instituciones';
import { seedCursos } from './cursos';
// import { seedInscripciones } from './inscripciones';
// import { seedAdministrativo } from './administrativo';

export async function runAllSeeds(prisma: PrismaClient): Promise<void> {
  console.log('🌱 Iniciando seed de base de datos...\n');
  console.log('═'.repeat(50));

  // Etapa 1: Usuarios y Perfiles (sin dependencias)
  await seedUsuarios(prisma);

  // Etapa 2: Categorías + Instituciones (depende de Etapa 1)
  await seedCategorias(prisma);
  await seedInstituciones(prisma);

  // Etapa 3: Cursos + Lecciones + Recursos (depende de Etapa 1 y 2)
  await seedCursos(prisma);

  // Etapa 4: Inscripciones + Progreso (depende de Etapa 3)
  // await seedInscripciones(prisma);

  // Etapa 5: Asistencias + Calificaciones + Comunicados (depende de Etapa 2)
  // await seedAdministrativo(prisma);

  console.log('═'.repeat(50));
  console.log('✅ Seed completado exitosamente\n');
}
