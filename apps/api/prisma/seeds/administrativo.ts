/**
 * Seed de Módulo Administrativo: Asistencias, Calificaciones y Comunicados
 * Etapa 5 del seed data (final)
 */

import type { PrismaClient } from '@prisma/client';
import { EstadoAsistencia, Prioridad, TipoComunicado } from '@prisma/client';
import { getUsuarioByEmail } from './usuarios';
import { getInstitucionByNombre } from './instituciones';

// =====================
// DATOS DE ASISTENCIA
// =====================

interface AsistenciaSeed {
  grupoNombre: string;
  estudianteEmail: string;
  diasAtras: number;
  estado: EstadoAsistencia;
  observaciones?: string;
}

// Generar asistencias para los últimos 10 días hábiles
function generarAsistenciasData(): AsistenciaSeed[] {
  const asistencias: AsistenciaSeed[] = [];

  // Estudiantes y sus grupos
  const estudiantesGrupos = [
    { email: 'estudiante1@amauta.test', grupo: '4to Grado A' },
    { email: 'estudiante2@amauta.test', grupo: '4to Grado A' },
    { email: 'estudiante3@amauta.test', grupo: '1er Año A' },
    { email: 'estudiante4@amauta.test', grupo: '1er Año A' },
  ];

  // Generar 10 días de asistencia por estudiante
  for (const { email, grupo } of estudiantesGrupos) {
    for (let dia = 1; dia <= 10; dia++) {
      // Distribución: 80% PRESENTE, 10% AUSENTE, 5% TARDANZA, 5% JUSTIFICADO
      const random = Math.random() * 100;
      let estado: EstadoAsistencia;
      let observaciones: string | undefined;

      if (random < 80) {
        estado = EstadoAsistencia.PRESENTE;
      } else if (random < 90) {
        estado = EstadoAsistencia.AUSENTE;
      } else if (random < 95) {
        estado = EstadoAsistencia.TARDANZA;
        observaciones = 'Llegó 10 minutos tarde';
      } else {
        estado = EstadoAsistencia.JUSTIFICADO;
        observaciones = 'Certificado médico presentado';
      }

      asistencias.push({
        grupoNombre: grupo,
        estudianteEmail: email,
        diasAtras: dia,
        estado,
        observaciones,
      });
    }
  }

  return asistencias;
}

// =====================
// DATOS DE CALIFICACIONES
// =====================

interface CalificacionSeed {
  grupoNombre: string;
  estudianteEmail: string;
  materia: string;
  periodo: string;
  nota: number;
  observaciones?: string;
}

const calificacionesData: CalificacionSeed[] = [
  // Juan Pérez (4to Grado A)
  {
    grupoNombre: '4to Grado A',
    estudianteEmail: 'estudiante1@amauta.test',
    materia: 'Matemáticas',
    periodo: '1er Trimestre',
    nota: 8.5,
  },
  {
    grupoNombre: '4to Grado A',
    estudianteEmail: 'estudiante1@amauta.test',
    materia: 'Lengua',
    periodo: '1er Trimestre',
    nota: 7.0,
  },
  {
    grupoNombre: '4to Grado A',
    estudianteEmail: 'estudiante1@amauta.test',
    materia: 'Ciencias Naturales',
    periodo: '1er Trimestre',
    nota: 9.0,
    observaciones: 'Excelente participación en clase',
  },
  {
    grupoNombre: '4to Grado A',
    estudianteEmail: 'estudiante1@amauta.test',
    materia: 'Ciencias Sociales',
    periodo: '1er Trimestre',
    nota: 8.0,
  },

  // Sofía Rodríguez (4to Grado A)
  {
    grupoNombre: '4to Grado A',
    estudianteEmail: 'estudiante2@amauta.test',
    materia: 'Matemáticas',
    periodo: '1er Trimestre',
    nota: 9.5,
    observaciones: 'Mejor promedio del grupo',
  },
  {
    grupoNombre: '4to Grado A',
    estudianteEmail: 'estudiante2@amauta.test',
    materia: 'Lengua',
    periodo: '1er Trimestre',
    nota: 8.5,
  },
  {
    grupoNombre: '4to Grado A',
    estudianteEmail: 'estudiante2@amauta.test',
    materia: 'Ciencias Naturales',
    periodo: '1er Trimestre',
    nota: 9.0,
  },
  {
    grupoNombre: '4to Grado A',
    estudianteEmail: 'estudiante2@amauta.test',
    materia: 'Ciencias Sociales',
    periodo: '1er Trimestre',
    nota: 8.5,
  },

  // Mateo González (1er Año A)
  {
    grupoNombre: '1er Año A',
    estudianteEmail: 'estudiante3@amauta.test',
    materia: 'Matemáticas',
    periodo: '1er Trimestre',
    nota: 7.5,
  },
  {
    grupoNombre: '1er Año A',
    estudianteEmail: 'estudiante3@amauta.test',
    materia: 'Lengua',
    periodo: '1er Trimestre',
    nota: 8.0,
  },
  {
    grupoNombre: '1er Año A',
    estudianteEmail: 'estudiante3@amauta.test',
    materia: 'Biología',
    periodo: '1er Trimestre',
    nota: 9.0,
    observaciones: 'Muy interesado en la materia',
  },
  {
    grupoNombre: '1er Año A',
    estudianteEmail: 'estudiante3@amauta.test',
    materia: 'Historia',
    periodo: '1er Trimestre',
    nota: 7.0,
  },

  // Valentina Díaz (1er Año A)
  {
    grupoNombre: '1er Año A',
    estudianteEmail: 'estudiante4@amauta.test',
    materia: 'Matemáticas',
    periodo: '1er Trimestre',
    nota: 8.0,
  },
  {
    grupoNombre: '1er Año A',
    estudianteEmail: 'estudiante4@amauta.test',
    materia: 'Lengua',
    periodo: '1er Trimestre',
    nota: 9.5,
    observaciones: 'Excelente expresión escrita',
  },
  {
    grupoNombre: '1er Año A',
    estudianteEmail: 'estudiante4@amauta.test',
    materia: 'Biología',
    periodo: '1er Trimestre',
    nota: 8.5,
  },
  {
    grupoNombre: '1er Año A',
    estudianteEmail: 'estudiante4@amauta.test',
    materia: 'Historia',
    periodo: '1er Trimestre',
    nota: 9.0,
  },
];

// =====================
// DATOS DE COMUNICADOS
// =====================

interface ComunicadoSeed {
  institucionNombre: string;
  autorEmail: string;
  titulo: string;
  contenido: string;
  tipo: TipoComunicado;
  prioridad: Prioridad;
  diasAtras: number;
}

const comunicadosData: ComunicadoSeed[] = [
  {
    institucionNombre: 'Escuela Primaria Belgrano',
    autorEmail: 'admin1@amauta.test',
    titulo: 'Bienvenidos al ciclo lectivo 2025',
    contenido: `Estimadas familias,

Es un placer darles la bienvenida al nuevo ciclo lectivo 2025. Este año hemos preparado muchas actividades y proyectos para nuestros estudiantes.

Les recordamos que las clases comienzan el lunes 3 de marzo. El horario de ingreso es a las 8:00 AM.

Por favor, asegúrense de que sus hijos traigan:
- Útiles escolares según la lista entregada
- Uniforme completo
- Merienda saludable

¡Los esperamos con muchas ganas de aprender juntos!

Dirección
Escuela Primaria Belgrano`,
    tipo: TipoComunicado.GENERAL,
    prioridad: Prioridad.NORMAL,
    diasAtras: 60,
  },
  {
    institucionNombre: 'Escuela Primaria Belgrano',
    autorEmail: 'admin1@amauta.test',
    titulo: 'Acto del 25 de Mayo - Invitación especial',
    contenido: `Queridas familias,

Los invitamos cordialmente al acto conmemorativo del 25 de Mayo.

**Fecha**: Viernes 23 de mayo
**Hora**: 10:00 AM
**Lugar**: Patio central de la escuela

Los alumnos de 4° grado presentarán una obra de teatro sobre la Revolución de Mayo.
Habrá coro escolar y muestra de trabajos.

Se servirá chocolate caliente y empanadas después del acto.

¡Los esperamos!

Equipo docente`,
    tipo: TipoComunicado.EVENTO,
    prioridad: Prioridad.ALTA,
    diasAtras: 30,
  },
  {
    institucionNombre: 'Colegio Secundario San Martín',
    autorEmail: 'admin2@amauta.test',
    titulo: 'Fechas de exámenes del primer trimestre',
    contenido: `Estimados estudiantes y familias,

Comunicamos el cronograma de exámenes del primer trimestre:

**Semana del 15 al 19 de abril:**
- Lunes 15: Matemáticas
- Martes 16: Lengua y Literatura
- Miércoles 17: Biología / Física
- Jueves 18: Historia / Geografía
- Viernes 19: Inglés

**Horarios:**
- Turno mañana: 8:00 - 10:00 AM
- Turno tarde: 14:00 - 16:00 PM

Los estudiantes deben presentarse con DNI y materiales permitidos.

Dirección Académica
Colegio San Martín`,
    tipo: TipoComunicado.ACADEMICO,
    prioridad: Prioridad.NORMAL,
    diasAtras: 45,
  },
  {
    institucionNombre: 'Colegio Secundario San Martín',
    autorEmail: 'admin2@amauta.test',
    titulo: 'URGENTE: Suspensión de clases por alerta meteorológica',
    contenido: `COMUNICADO URGENTE

Debido a la alerta meteorológica emitida por el Servicio Meteorológico Nacional, se suspenden las clases del día de mañana.

**Fecha de suspensión**: Mañana
**Motivo**: Alerta naranja por tormentas severas

Las clases se retomarán cuando las condiciones climáticas lo permitan. Se enviará comunicado confirmando la fecha de regreso.

Por favor, permanezcan en sus hogares y tomen las precauciones necesarias.

Dirección
Colegio San Martín`,
    tipo: TipoComunicado.URGENTE,
    prioridad: Prioridad.URGENTE,
    diasAtras: 5,
  },
];

// =====================
// FUNCIÓN PRINCIPAL
// =====================

export async function seedAdministrativo(prisma: PrismaClient): Promise<void> {
  console.log('📋 Creando datos administrativos...');

  // ---- ASISTENCIAS ----
  console.log('\n   📅 Registrando asistencias...');
  const asistenciasData = generarAsistenciasData();
  let _totalAsistencias = 0;

  // Obtener grupos
  const grupos = await prisma.grupo.findMany({
    include: { institucion: true },
  });

  // Preparar las relaciones del módulo escolar requeridas por las calificaciones.
  // Estas entidades fueron incorporadas después del seed administrativo original.
  const periodoPorInstitucion = new Map<string, string>();
  const materiaPorInstitucionYNombre = new Map<string, string>();
  const nombresDeMaterias = [
    ...new Set(calificacionesData.map((calificacion) => calificacion.materia)),
  ];

  for (const institucion of await prisma.institucion.findMany()) {
    const periodoExistente = await prisma.periodoAcademico.findFirst({
      where: { institucionId: institucion.id, nombre: '1er Trimestre' },
    });
    const periodo =
      periodoExistente ??
      (await prisma.periodoAcademico.create({
        data: {
          institucionId: institucion.id,
          nombre: '1er Trimestre',
          fechaInicio: new Date('2025-03-01T00:00:00.000Z'),
          fechaFin: new Date('2025-06-30T23:59:59.999Z'),
          orden: 1,
        },
      }));

    periodoPorInstitucion.set(institucion.id, periodo.id);

    for (const nombre of nombresDeMaterias) {
      const materiaExistente = await prisma.materia.findFirst({
        where: { institucionId: institucion.id, nombre },
      });
      const materia =
        materiaExistente ??
        (await prisma.materia.create({
          data: { institucionId: institucion.id, nombre },
        }));
      materiaPorInstitucionYNombre.set(
        `${institucion.id}:${nombre}`,
        materia.id
      );
    }
  }

  for (const grupo of grupos) {
    const periodoId = periodoPorInstitucion.get(grupo.institucionId);
    if (periodoId) {
      await prisma.grupo.update({
        where: { id: grupo.id },
        data: { periodoAcademicoId: periodoId },
      });
    }

    const nombresParaGrupo = calificacionesData
      .filter((calificacion) => calificacion.grupoNombre === grupo.nombre)
      .map((calificacion) => calificacion.materia);

    for (const nombre of new Set(nombresParaGrupo)) {
      const materiaId = materiaPorInstitucionYNombre.get(
        `${grupo.institucionId}:${nombre}`
      );
      if (materiaId) {
        await prisma.grupoMateria.upsert({
          where: { grupoId_materiaId: { grupoId: grupo.id, materiaId } },
          update: { activo: true },
          create: { grupoId: grupo.id, materiaId },
        });
      }
    }
  }

  for (const asistData of asistenciasData) {
    const estudiante = await getUsuarioByEmail(
      prisma,
      asistData.estudianteEmail
    );
    const grupo = grupos.find((g) => g.nombre === asistData.grupoNombre);

    if (!estudiante || !grupo) continue;

    // Calcular fecha
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - asistData.diasAtras);
    fecha.setHours(8, 0, 0, 0); // Normalizar hora

    // Crear o actualizar asistencia
    await prisma.asistencia.upsert({
      where: {
        grupoId_estudianteId_fecha: {
          grupoId: grupo.id,
          estudianteId: estudiante.id,
          fecha,
        },
      },
      update: {
        estado: asistData.estado,
        observaciones: asistData.observaciones,
      },
      create: {
        grupoId: grupo.id,
        estudianteId: estudiante.id,
        fecha,
        estado: asistData.estado,
        observaciones: asistData.observaciones,
      },
    });

    _totalAsistencias++;
  }

  const dbAsistencias = await prisma.asistencia.count();
  const presentes = await prisma.asistencia.count({
    where: { estado: EstadoAsistencia.PRESENTE },
  });
  console.log(
    `      ✓ ${dbAsistencias} registros (${presentes} presentes, ${dbAsistencias - presentes} otras)`
  );

  // ---- CALIFICACIONES ----
  console.log('\n   📊 Registrando calificaciones...');
  let _totalCalificaciones = 0;

  for (const califData of calificacionesData) {
    const estudiante = await getUsuarioByEmail(
      prisma,
      califData.estudianteEmail
    );
    const grupo = grupos.find((g) => g.nombre === califData.grupoNombre);

    if (!estudiante || !grupo) continue;

    const periodoAcademicoId = periodoPorInstitucion.get(grupo.institucionId);
    const materiaId = materiaPorInstitucionYNombre.get(
      `${grupo.institucionId}:${califData.materia}`
    );

    if (!periodoAcademicoId || !materiaId) continue;

    // Buscar calificación existente
    const existing = await prisma.calificacion.findFirst({
      where: {
        grupoId: grupo.id,
        estudianteId: estudiante.id,
        materiaId,
        periodoAcademicoId,
      },
    });

    if (existing) {
      await prisma.calificacion.update({
        where: { id: existing.id },
        data: {
          nota: califData.nota,
          observaciones: califData.observaciones,
        },
      });
    } else {
      await prisma.calificacion.create({
        data: {
          grupoId: grupo.id,
          estudianteId: estudiante.id,
          materiaId,
          periodoAcademicoId,
          nota: califData.nota,
          observaciones: califData.observaciones,
        },
      });
    }

    _totalCalificaciones++;
    console.log(
      `      ✓ ${estudiante.nombre}: ${califData.materia} = ${califData.nota}`
    );
  }

  const dbCalificaciones = await prisma.calificacion.count();
  console.log(`      Total: ${dbCalificaciones} calificaciones`);

  // ---- COMUNICADOS ----
  console.log('\n   📢 Publicando comunicados...');
  let _totalComunicados = 0;

  for (const comData of comunicadosData) {
    const institucion = await getInstitucionByNombre(
      prisma,
      comData.institucionNombre
    );
    const autor = await getUsuarioByEmail(prisma, comData.autorEmail);

    if (!institucion || !autor) continue;

    // Calcular fecha de publicación
    const publicadoEn = new Date();
    publicadoEn.setDate(publicadoEn.getDate() - comData.diasAtras);

    // Buscar comunicado existente por título e institución
    const existing = await prisma.comunicado.findFirst({
      where: {
        institucionId: institucion.id,
        titulo: comData.titulo,
      },
    });

    if (existing) {
      await prisma.comunicado.update({
        where: { id: existing.id },
        data: {
          contenido: comData.contenido,
          tipo: comData.tipo,
          prioridad: comData.prioridad,
        },
      });
    } else {
      await prisma.comunicado.create({
        data: {
          institucionId: institucion.id,
          autorId: autor.id,
          titulo: comData.titulo,
          contenido: comData.contenido,
          tipo: comData.tipo,
          prioridad: comData.prioridad,
          publicadoEn,
        },
      });
    }

    _totalComunicados++;
    const prioridadIcon =
      comData.prioridad === Prioridad.URGENTE
        ? '🔴'
        : comData.prioridad === Prioridad.ALTA
          ? '🟠'
          : '🟢';
    console.log(`      ${prioridadIcon} ${comData.titulo.slice(0, 40)}...`);
  }

  const dbComunicados = await prisma.comunicado.count();
  console.log(`      Total: ${dbComunicados} comunicados`);

  // ---- RESUMEN ----
  console.log(
    `\n✅ Módulo administrativo: ${dbAsistencias} asistencias, ${dbCalificaciones} calificaciones, ${dbComunicados} comunicados\n`
  );
}
