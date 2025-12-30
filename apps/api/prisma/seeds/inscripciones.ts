/**
 * Seed de Inscripciones y Progreso
 * Etapa 4 del seed data
 */

import type { PrismaClient } from '@prisma/client';
import { EstadoInscripcion, TipoLeccion } from '@prisma/client';
import { getUsuarioByEmail } from './usuarios';
import { getCursoBySlug } from './cursos';

interface ProgresoSeed {
  leccionOrden: number;
  completado: boolean;
  porcentaje: number;
  intentos?: number;
  mejorPuntaje?: number;
}

interface InscripcionSeed {
  estudianteEmail: string;
  cursoSlug: string;
  estado: EstadoInscripcion;
  progreso: number;
  diasAtras: number; // Días desde la inscripción
  progresos: ProgresoSeed[];
}

const inscripcionesData: InscripcionSeed[] = [
  // =========================================
  // Estudiante 1: Juan Pérez (estudiante1)
  // =========================================

  // Álgebra Básica - COMPLETADO (100%)
  {
    estudianteEmail: 'estudiante1@amauta.test',
    cursoSlug: 'algebra-basica',
    estado: EstadoInscripcion.COMPLETADO,
    progreso: 100,
    diasAtras: 30,
    progresos: [
      { leccionOrden: 1, completado: true, porcentaje: 100 },
      { leccionOrden: 2, completado: true, porcentaje: 100 },
      {
        leccionOrden: 3,
        completado: true,
        porcentaje: 100,
        intentos: 2,
        mejorPuntaje: 85,
      },
    ],
  },

  // Comprensión Lectora - EN PROGRESO (66%)
  {
    estudianteEmail: 'estudiante1@amauta.test',
    cursoSlug: 'comprension-lectora',
    estado: EstadoInscripcion.ACTIVO,
    progreso: 66,
    diasAtras: 20,
    progresos: [
      { leccionOrden: 1, completado: true, porcentaje: 100 },
      { leccionOrden: 2, completado: true, porcentaje: 100 },
      { leccionOrden: 3, completado: false, porcentaje: 0 },
    ],
  },

  // Biología Celular - EN PROGRESO (33%)
  {
    estudianteEmail: 'estudiante1@amauta.test',
    cursoSlug: 'biologia-celular',
    estado: EstadoInscripcion.ACTIVO,
    progreso: 33,
    diasAtras: 15,
    progresos: [
      { leccionOrden: 1, completado: true, porcentaje: 100 },
      { leccionOrden: 2, completado: false, porcentaje: 30 },
      { leccionOrden: 3, completado: false, porcentaje: 0 },
    ],
  },

  // =========================================
  // Estudiante 2: Sofía Rodríguez (estudiante2)
  // =========================================

  // Álgebra Básica - EN PROGRESO (50%)
  {
    estudianteEmail: 'estudiante2@amauta.test',
    cursoSlug: 'algebra-basica',
    estado: EstadoInscripcion.ACTIVO,
    progreso: 50,
    diasAtras: 25,
    progresos: [
      { leccionOrden: 1, completado: true, porcentaje: 100 },
      { leccionOrden: 2, completado: false, porcentaje: 50 },
      { leccionOrden: 3, completado: false, porcentaje: 0 },
    ],
  },

  // Comprensión Lectora - RECIÉN INSCRITA (0%)
  {
    estudianteEmail: 'estudiante2@amauta.test',
    cursoSlug: 'comprension-lectora',
    estado: EstadoInscripcion.ACTIVO,
    progreso: 0,
    diasAtras: 5,
    progresos: [],
  },

  // Biología Celular - EN PROGRESO (66%)
  {
    estudianteEmail: 'estudiante2@amauta.test',
    cursoSlug: 'biologia-celular',
    estado: EstadoInscripcion.ACTIVO,
    progreso: 66,
    diasAtras: 18,
    progresos: [
      { leccionOrden: 1, completado: true, porcentaje: 100 },
      { leccionOrden: 2, completado: true, porcentaje: 100 },
      {
        leccionOrden: 3,
        completado: false,
        porcentaje: 60,
        intentos: 1,
        mejorPuntaje: 60,
      },
    ],
  },

  // =========================================
  // Estudiante 3: Mateo González (estudiante3)
  // =========================================

  // Álgebra Básica - COMPLETADO (100%)
  {
    estudianteEmail: 'estudiante3@amauta.test',
    cursoSlug: 'algebra-basica',
    estado: EstadoInscripcion.COMPLETADO,
    progreso: 100,
    diasAtras: 45,
    progresos: [
      { leccionOrden: 1, completado: true, porcentaje: 100 },
      { leccionOrden: 2, completado: true, porcentaje: 100 },
      {
        leccionOrden: 3,
        completado: true,
        porcentaje: 100,
        intentos: 1,
        mejorPuntaje: 100,
      },
    ],
  },

  // Taller de Redacción - EN PROGRESO (50%)
  {
    estudianteEmail: 'estudiante3@amauta.test',
    cursoSlug: 'taller-redaccion',
    estado: EstadoInscripcion.ACTIVO,
    progreso: 50,
    diasAtras: 12,
    progresos: [
      { leccionOrden: 1, completado: true, porcentaje: 100 },
      { leccionOrden: 2, completado: false, porcentaje: 25 },
    ],
  },

  // Biología Celular - EN PROGRESO (33%)
  {
    estudianteEmail: 'estudiante3@amauta.test',
    cursoSlug: 'biologia-celular',
    estado: EstadoInscripcion.ACTIVO,
    progreso: 33,
    diasAtras: 10,
    progresos: [
      { leccionOrden: 1, completado: true, porcentaje: 100 },
      { leccionOrden: 2, completado: false, porcentaje: 0 },
      { leccionOrden: 3, completado: false, porcentaje: 0 },
    ],
  },

  // =========================================
  // Estudiante 4: Valentina Díaz (estudiante4)
  // =========================================

  // Geometría Plana (BORRADOR) - No debería poder inscribirse normalmente
  // pero lo incluimos para testing
  {
    estudianteEmail: 'estudiante4@amauta.test',
    cursoSlug: 'geometria-plana',
    estado: EstadoInscripcion.ACTIVO,
    progreso: 50,
    diasAtras: 8,
    progresos: [
      { leccionOrden: 1, completado: true, porcentaje: 100 },
      { leccionOrden: 2, completado: false, porcentaje: 40 },
    ],
  },

  // Comprensión Lectora - EN PROGRESO (33%)
  {
    estudianteEmail: 'estudiante4@amauta.test',
    cursoSlug: 'comprension-lectora',
    estado: EstadoInscripcion.ACTIVO,
    progreso: 33,
    diasAtras: 22,
    progresos: [
      { leccionOrden: 1, completado: true, porcentaje: 100 },
      { leccionOrden: 2, completado: false, porcentaje: 20 },
      { leccionOrden: 3, completado: false, porcentaje: 0 },
    ],
  },

  // Introducción a Física (BORRADOR) - Para testing
  {
    estudianteEmail: 'estudiante4@amauta.test',
    cursoSlug: 'introduccion-fisica',
    estado: EstadoInscripcion.ACTIVO,
    progreso: 0,
    diasAtras: 3,
    progresos: [],
  },
];

export async function seedInscripciones(prisma: PrismaClient): Promise<void> {
  console.log('📝 Creando inscripciones y progreso...');

  let _totalInscripciones = 0;
  let _totalProgresos = 0;

  for (const inscData of inscripcionesData) {
    // Obtener estudiante y curso
    const estudiante = await getUsuarioByEmail(
      prisma,
      inscData.estudianteEmail
    );
    const curso = await getCursoBySlug(prisma, inscData.cursoSlug);

    if (!estudiante) {
      console.log(`   ⚠ Estudiante no encontrado: ${inscData.estudianteEmail}`);
      continue;
    }

    if (!curso) {
      console.log(`   ⚠ Curso no encontrado: ${inscData.cursoSlug}`);
      continue;
    }

    // Calcular fechas
    const inscritoEn = new Date();
    inscritoEn.setDate(inscritoEn.getDate() - inscData.diasAtras);

    const completadoEn =
      inscData.estado === EstadoInscripcion.COMPLETADO
        ? new Date(inscritoEn.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 días después
        : null;

    // Crear o actualizar inscripción
    const inscripcion = await prisma.inscripcion.upsert({
      where: {
        usuarioId_cursoId: {
          usuarioId: estudiante.id,
          cursoId: curso.id,
        },
      },
      update: {
        estado: inscData.estado,
        progreso: inscData.progreso,
        inscritoEn,
        completadoEn,
      },
      create: {
        usuarioId: estudiante.id,
        cursoId: curso.id,
        estado: inscData.estado,
        progreso: inscData.progreso,
        inscritoEn,
        completadoEn,
      },
    });

    _totalInscripciones++;
    console.log(
      `   ✓ ${estudiante.nombre} → ${curso.titulo} (${inscripcion.progreso}%, ${inscripcion.estado})`
    );

    // Crear progreso por lección
    for (const progData of inscData.progresos) {
      // Buscar lección por orden
      const leccion = curso.lecciones.find(
        (l) => l.orden === progData.leccionOrden
      );

      if (!leccion) {
        console.log(
          `      ⚠ Lección orden ${progData.leccionOrden} no encontrada en ${curso.titulo}`
        );
        continue;
      }

      // Calcular fecha de último acceso
      const ultimoAcceso = new Date();
      ultimoAcceso.setDate(
        ultimoAcceso.getDate() - Math.floor(Math.random() * inscData.diasAtras)
      );

      const completadoEnLeccion = progData.completado ? ultimoAcceso : null;

      // Determinar intentos y puntaje según tipo de lección
      const esQuiz = leccion.tipo === TipoLeccion.QUIZ;
      const intentos =
        progData.intentos ?? (esQuiz && progData.completado ? 1 : 0);
      const mejorPuntaje = progData.mejorPuntaje ?? null;

      // Crear o actualizar progreso
      await prisma.progreso.upsert({
        where: {
          usuarioId_leccionId: {
            usuarioId: estudiante.id,
            leccionId: leccion.id,
          },
        },
        update: {
          completado: progData.completado,
          porcentaje: progData.porcentaje,
          ultimoAcceso,
          completadoEn: completadoEnLeccion,
          intentos,
          mejorPuntaje,
        },
        create: {
          usuarioId: estudiante.id,
          leccionId: leccion.id,
          completado: progData.completado,
          porcentaje: progData.porcentaje,
          ultimoAcceso,
          completadoEn: completadoEnLeccion,
          intentos,
          mejorPuntaje,
        },
      });

      _totalProgresos++;
      const statusIcon = progData.completado ? '✓' : '○';
      const puntajeStr = mejorPuntaje ? ` (${mejorPuntaje}pts)` : '';
      console.log(
        `      ${statusIcon} Lección ${leccion.orden}: ${progData.porcentaje}%${puntajeStr}`
      );
    }
  }

  // Resumen
  const dbInscripciones = await prisma.inscripcion.count();
  const dbProgresos = await prisma.progreso.count();
  const completados = await prisma.inscripcion.count({
    where: { estado: EstadoInscripcion.COMPLETADO },
  });

  console.log(
    `✅ ${dbInscripciones} inscripciones (${completados} completadas), ${dbProgresos} registros de progreso\n`
  );
}
