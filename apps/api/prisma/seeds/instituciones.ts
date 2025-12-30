/**
 * Seed de Instituciones, Grupos y Asignación de Estudiantes
 * Etapa 2 del seed data
 */

import type { PrismaClient } from '@prisma/client';
import { TipoInstitucion } from '@prisma/client';
import { getUsuarioByEmail } from './usuarios';

interface InstitucionSeed {
  nombre: string;
  tipo: TipoInstitucion;
  direccion: string;
  telefono: string;
  email: string;
  adminEmail: string;
  grupos: GrupoSeed[];
}

interface GrupoSeed {
  nombre: string;
  grado: string;
  seccion: string;
  educadorEmail: string;
  estudiantesEmails: string[];
}

const institucionesData: InstitucionSeed[] = [
  {
    nombre: 'Escuela Primaria Belgrano',
    tipo: TipoInstitucion.ESCUELA,
    direccion: 'Av. Belgrano 1234, Buenos Aires',
    telefono: '+54 11 4555-0001',
    email: 'contacto@escuelabelgrano.edu.ar',
    adminEmail: 'admin1@amauta.test',
    grupos: [
      {
        nombre: '4to Grado A',
        grado: '4°',
        seccion: 'A',
        educadorEmail: 'educador1@amauta.test',
        estudiantesEmails: [
          'estudiante1@amauta.test',
          'estudiante2@amauta.test',
        ],
      },
      {
        nombre: '5to Grado B',
        grado: '5°',
        seccion: 'B',
        educadorEmail: 'educador2@amauta.test',
        estudiantesEmails: [],
      },
    ],
  },
  {
    nombre: 'Colegio Secundario San Martín',
    tipo: TipoInstitucion.COLEGIO,
    direccion: 'Calle San Martín 567, Córdoba',
    telefono: '+54 351 4555-0002',
    email: 'info@colegiosanmartin.edu.ar',
    adminEmail: 'admin2@amauta.test',
    grupos: [
      {
        nombre: '1er Año A',
        grado: '1°',
        seccion: 'A',
        educadorEmail: 'educador3@amauta.test',
        estudiantesEmails: [
          'estudiante3@amauta.test',
          'estudiante4@amauta.test',
        ],
      },
      {
        nombre: '2do Año B',
        grado: '2°',
        seccion: 'B',
        educadorEmail: 'educador3@amauta.test',
        estudiantesEmails: [],
      },
    ],
  },
];

export async function seedInstituciones(prisma: PrismaClient): Promise<void> {
  console.log('🏫 Creando instituciones y grupos...');

  for (const institucionData of institucionesData) {
    // Crear o actualizar institución
    const institucion = await prisma.institucion.upsert({
      where: {
        // Usar nombre como identificador único para upsert
        id:
          (
            await prisma.institucion.findFirst({
              where: { nombre: institucionData.nombre },
            })
          )?.id || 'new-id',
      },
      update: {
        nombre: institucionData.nombre,
        tipo: institucionData.tipo,
        direccion: institucionData.direccion,
        telefono: institucionData.telefono,
        email: institucionData.email,
        activa: true,
      },
      create: {
        nombre: institucionData.nombre,
        tipo: institucionData.tipo,
        direccion: institucionData.direccion,
        telefono: institucionData.telefono,
        email: institucionData.email,
        activa: true,
      },
    });

    console.log(
      `   ✓ Institución: ${institucion.nombre} (${institucion.tipo})`
    );

    // Crear grupos para esta institución
    for (const grupoData of institucionData.grupos) {
      const educador = await getUsuarioByEmail(prisma, grupoData.educadorEmail);

      if (!educador) {
        console.log(`   ⚠ Educador no encontrado: ${grupoData.educadorEmail}`);
        continue;
      }

      // Buscar si el grupo ya existe
      const existingGrupo = await prisma.grupo.findFirst({
        where: {
          nombre: grupoData.nombre,
          institucionId: institucion.id,
        },
      });

      const grupo = existingGrupo
        ? await prisma.grupo.update({
            where: { id: existingGrupo.id },
            data: {
              grado: grupoData.grado,
              seccion: grupoData.seccion,
              educadorId: educador.id,
              activo: true,
            },
          })
        : await prisma.grupo.create({
            data: {
              nombre: grupoData.nombre,
              grado: grupoData.grado,
              seccion: grupoData.seccion,
              institucionId: institucion.id,
              educadorId: educador.id,
              activo: true,
            },
          });

      console.log(
        `      ✓ Grupo: ${grupo.nombre} (Educador: ${educador.nombre})`
      );

      // Asignar estudiantes al grupo
      for (const estudianteEmail of grupoData.estudiantesEmails) {
        const estudiante = await getUsuarioByEmail(prisma, estudianteEmail);

        if (!estudiante) {
          console.log(`      ⚠ Estudiante no encontrado: ${estudianteEmail}`);
          continue;
        }

        // Usar upsert para GrupoEstudiante
        await prisma.grupoEstudiante.upsert({
          where: {
            grupoId_estudianteId: {
              grupoId: grupo.id,
              estudianteId: estudiante.id,
            },
          },
          update: {},
          create: {
            grupoId: grupo.id,
            estudianteId: estudiante.id,
          },
        });

        console.log(
          `         ✓ Estudiante asignado: ${estudiante.nombre} ${estudiante.apellido}`
        );
      }
    }
  }

  // Resumen
  const totalInstituciones = await prisma.institucion.count();
  const totalGrupos = await prisma.grupo.count();
  const totalAsignaciones = await prisma.grupoEstudiante.count();

  console.log(
    `✅ ${totalInstituciones} instituciones, ${totalGrupos} grupos, ${totalAsignaciones} estudiantes asignados\n`
  );
}

/**
 * Obtener institución por nombre (helper para otras etapas)
 */
export async function getInstitucionByNombre(
  prisma: PrismaClient,
  nombre: string
) {
  return prisma.institucion.findFirst({
    where: { nombre },
    include: { grupos: true },
  });
}
