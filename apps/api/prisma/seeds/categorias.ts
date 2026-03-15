/**
 * Seed de Categorías
 * Etapa 2 del seed data
 */

import type { PrismaClient } from '@prisma/client';

interface CategoriaSeed {
  nombre: string;
  slug: string;
  descripcion: string;
  icono: string;
}

export const categoriasData: CategoriaSeed[] = [
  {
    nombre: 'Matemáticas',
    slug: 'matematicas',
    descripcion: 'Álgebra, geometría, cálculo y estadística',
    icono: 'calculator',
  },
  {
    nombre: 'Lengua y Literatura',
    slug: 'lengua-literatura',
    descripcion: 'Gramática, comprensión lectora, redacción y literatura',
    icono: 'book-open',
  },
  {
    nombre: 'Ciencias Naturales',
    slug: 'ciencias-naturales',
    descripcion: 'Biología, física, química y astronomía',
    icono: 'flask',
  },
  {
    nombre: 'Ciencias Sociales',
    slug: 'ciencias-sociales',
    descripcion: 'Historia, geografía, educación cívica y economía',
    icono: 'globe',
  },
  {
    nombre: 'Educación Artística',
    slug: 'educacion-artistica',
    descripcion: 'Artes visuales, música, danza, teatro y audiovisual',
    icono: 'palette',
  },
  {
    nombre: 'Educación Tecnológica',
    slug: 'educacion-tecnologica',
    descripcion: 'Tecnología, procesos técnicos y pensamiento sociotécnico',
    icono: 'laptop',
  },
  {
    nombre: 'Educación Física',
    slug: 'educacion-fisica',
    descripcion: 'Corporeidad, movimiento, juegos y vida saludable',
    icono: 'activity',
  },
  {
    nombre: 'Formación Ética y Ciudadana',
    slug: 'formacion-etica-ciudadana',
    descripcion: 'Ciudadanía, derechos, convivencia y participación',
    icono: 'scale',
  },
];

export async function seedCategorias(prisma: PrismaClient): Promise<void> {
  console.log('📚 Creando categorías...');

  for (const categoria of categoriasData) {
    const created = await prisma.categoria.upsert({
      where: { slug: categoria.slug },
      update: {
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        icono: categoria.icono,
      },
      create: {
        nombre: categoria.nombre,
        slug: categoria.slug,
        descripcion: categoria.descripcion,
        icono: categoria.icono,
      },
    });

    console.log(`   ✓ ${created.nombre} (${created.slug})`);
  }

  console.log(`✅ ${categoriasData.length} categorías creadas\n`);
}

/**
 * Obtener categoría por slug (helper para otras etapas)
 */
export async function getCategoriaBySlug(prisma: PrismaClient, slug: string) {
  return prisma.categoria.findUnique({
    where: { slug },
  });
}
