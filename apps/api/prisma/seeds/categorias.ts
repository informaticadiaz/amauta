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

const categoriasData: CategoriaSeed[] = [
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
    nombre: 'Arte',
    slug: 'arte',
    descripcion: 'Plástica, música y expresión artística',
    icono: 'palette',
  },
  {
    nombre: 'Tecnología',
    slug: 'tecnologia',
    descripcion: 'Informática, programación y herramientas digitales',
    icono: 'laptop',
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
