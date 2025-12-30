/**
 * Seed de Cursos, Lecciones y Recursos
 * Etapa 3 del seed data
 */

import type { PrismaClient } from '@prisma/client';
import { EstadoCurso, Nivel, TipoLeccion } from '@prisma/client';
import { getUsuarioByEmail } from './usuarios';
import { getCategoriaBySlug } from './categorias';

interface RecursoSeed {
  nombre: string;
  tipo: string;
  url: string;
  tamano?: number;
  disponibleOffline: boolean;
}

interface LeccionSeed {
  titulo: string;
  descripcion: string;
  orden: number;
  tipo: TipoLeccion;
  duracion: number;
  contenido: object;
  publicada: boolean;
  recursos: RecursoSeed[];
}

interface CursoSeed {
  titulo: string;
  slug: string;
  descripcion: string;
  educadorEmail: string;
  categoriaSlug: string;
  nivel: Nivel;
  estado: EstadoCurso;
  duracion: number;
  imagen?: string;
  lecciones: LeccionSeed[];
}

const cursosData: CursoSeed[] = [
  // Curso 1: Álgebra Básica (Ana Martínez - Matemáticas)
  {
    titulo: 'Álgebra Básica',
    slug: 'algebra-basica',
    descripcion:
      'Introducción al álgebra para estudiantes de primaria. Aprenderás sobre variables, ecuaciones simples y operaciones algebraicas fundamentales.',
    educadorEmail: 'educador1@amauta.test',
    categoriaSlug: 'matematicas',
    nivel: Nivel.PRINCIPIANTE,
    estado: EstadoCurso.PUBLICADO,
    duracion: 180,
    imagen: '/images/cursos/algebra-basica.jpg',
    lecciones: [
      {
        titulo: '¿Qué es el álgebra?',
        descripcion: 'Introducción al mundo del álgebra y su importancia',
        orden: 1,
        tipo: TipoLeccion.VIDEO,
        duracion: 15,
        contenido: {
          videoUrl: 'https://example.com/videos/intro-algebra.mp4',
          transcript:
            'El álgebra es una rama de las matemáticas que utiliza letras y símbolos...',
        },
        publicada: true,
        recursos: [
          {
            nombre: 'Guía de introducción al álgebra',
            tipo: 'pdf',
            url: '/recursos/algebra/guia-intro.pdf',
            tamano: 524288,
            disponibleOffline: true,
          },
        ],
      },
      {
        titulo: 'Variables y constantes',
        descripcion: 'Aprende la diferencia entre variables y constantes',
        orden: 2,
        tipo: TipoLeccion.TEXTO,
        duracion: 20,
        contenido: {
          markdown: `# Variables y Constantes

## ¿Qué es una variable?
Una **variable** es un símbolo (generalmente una letra) que representa un valor que puede cambiar.

Por ejemplo: En la expresión \`x + 5 = 10\`, la letra \`x\` es una variable.

## ¿Qué es una constante?
Una **constante** es un valor que no cambia. Los números como 5, 10, -3 son constantes.

## Ejemplos prácticos
- \`2x + 3\`: aquí 2 y 3 son constantes, x es variable
- \`y = 7\`: aquí 7 es constante, y es variable`,
        },
        publicada: true,
        recursos: [],
      },
      {
        titulo: 'Evaluación: Conceptos básicos',
        descripcion:
          'Evalúa tu comprensión de los conceptos básicos de álgebra',
        orden: 3,
        tipo: TipoLeccion.QUIZ,
        duracion: 15,
        contenido: {
          preguntas: [
            {
              pregunta: '¿Qué es una variable en álgebra?',
              opciones: [
                'Un número fijo',
                'Una letra que representa un valor que puede cambiar',
                'Una operación matemática',
                'Un símbolo de suma',
              ],
              respuestaCorrecta: 1,
            },
            {
              pregunta: 'En la expresión 3x + 5, ¿cuál es la constante?',
              opciones: ['x', '3x', '5', 'Ninguna'],
              respuestaCorrecta: 2,
            },
            {
              pregunta: '¿Qué letra se usa comúnmente como variable?',
              opciones: [
                'Solo la x',
                'Solo la y',
                'Cualquier letra',
                'Solo vocales',
              ],
              respuestaCorrecta: 2,
            },
          ],
          puntajeMinimo: 2,
          intentosPermitidos: 3,
        },
        publicada: true,
        recursos: [],
      },
    ],
  },

  // Curso 2: Geometría Plana (Ana Martínez - Matemáticas)
  {
    titulo: 'Geometría Plana',
    slug: 'geometria-plana',
    descripcion:
      'Explora las figuras geométricas en dos dimensiones: triángulos, cuadriláteros, círculos y sus propiedades.',
    educadorEmail: 'educador1@amauta.test',
    categoriaSlug: 'matematicas',
    nivel: Nivel.INTERMEDIO,
    estado: EstadoCurso.BORRADOR,
    duracion: 240,
    lecciones: [
      {
        titulo: 'Introducción a la geometría',
        descripcion: 'Conceptos fundamentales de la geometría plana',
        orden: 1,
        tipo: TipoLeccion.VIDEO,
        duracion: 20,
        contenido: {
          videoUrl: 'https://example.com/videos/intro-geometria.mp4',
          transcript:
            'La geometría estudia las formas, tamaños y posiciones...',
        },
        publicada: false,
        recursos: [
          {
            nombre: 'Plantillas de figuras geométricas',
            tipo: 'pdf',
            url: '/recursos/geometria/plantillas.pdf',
            tamano: 1048576,
            disponibleOffline: true,
          },
        ],
      },
      {
        titulo: 'Ejercicios interactivos de figuras',
        descripcion: 'Practica identificando y midiendo figuras geométricas',
        orden: 2,
        tipo: TipoLeccion.INTERACTIVO,
        duracion: 30,
        contenido: {
          tipo: 'arrastra-y-suelta',
          instrucciones: 'Arrastra cada figura a su nombre correspondiente',
          elementos: [
            { id: 'fig1', tipo: 'triangulo', imagen: '/imgs/triangulo.svg' },
            { id: 'fig2', tipo: 'cuadrado', imagen: '/imgs/cuadrado.svg' },
            { id: 'fig3', tipo: 'circulo', imagen: '/imgs/circulo.svg' },
          ],
          zonas: [
            { id: 'zona1', nombre: 'Triángulo', respuestaCorrecta: 'fig1' },
            { id: 'zona2', nombre: 'Cuadrado', respuestaCorrecta: 'fig2' },
            { id: 'zona3', nombre: 'Círculo', respuestaCorrecta: 'fig3' },
          ],
        },
        publicada: false,
        recursos: [],
      },
    ],
  },

  // Curso 3: Comprensión Lectora (Pedro Sánchez - Lengua)
  {
    titulo: 'Comprensión Lectora',
    slug: 'comprension-lectora',
    descripcion:
      'Desarrolla habilidades de lectura crítica y comprensión de textos. Ideal para estudiantes que quieren mejorar su análisis textual.',
    educadorEmail: 'educador2@amauta.test',
    categoriaSlug: 'lengua-literatura',
    nivel: Nivel.PRINCIPIANTE,
    estado: EstadoCurso.PUBLICADO,
    duracion: 150,
    imagen: '/images/cursos/comprension-lectora.jpg',
    lecciones: [
      {
        titulo: 'Estrategias de lectura',
        descripcion: 'Aprende técnicas para leer de manera más efectiva',
        orden: 1,
        tipo: TipoLeccion.VIDEO,
        duracion: 18,
        contenido: {
          videoUrl: 'https://example.com/videos/estrategias-lectura.mp4',
          transcript:
            'Leer no es solo pasar los ojos por el texto. Es un proceso activo...',
        },
        publicada: true,
        recursos: [
          {
            nombre: 'Checklist de comprensión lectora',
            tipo: 'pdf',
            url: '/recursos/lengua/checklist-lectura.pdf',
            tamano: 256000,
            disponibleOffline: true,
          },
        ],
      },
      {
        titulo: 'Identificando ideas principales',
        descripcion: 'Cómo encontrar la idea central de un texto',
        orden: 2,
        tipo: TipoLeccion.TEXTO,
        duracion: 25,
        contenido: {
          markdown: `# Identificando Ideas Principales

## ¿Qué es la idea principal?
La **idea principal** es el mensaje central que el autor quiere comunicar.

## Estrategias para identificarla:

1. **Lee el título**: Muchas veces anticipa el tema
2. **Busca palabras repetidas**: Suelen indicar el tema central
3. **Lee el primer y último párrafo**: Generalmente contienen la idea principal
4. **Hazte preguntas**: ¿De qué trata principalmente este texto?

## Práctica
Lee el siguiente párrafo e identifica la idea principal...`,
        },
        publicada: true,
        recursos: [],
      },
      {
        titulo: 'Práctica de comprensión',
        descripcion: 'Evalúa tu capacidad de comprensión con textos reales',
        orden: 3,
        tipo: TipoLeccion.QUIZ,
        duracion: 20,
        contenido: {
          textoBase: `El agua es esencial para la vida en la Tierra. Todos los seres vivos necesitan agua para sobrevivir. Los humanos pueden vivir semanas sin comida, pero solo unos pocos días sin agua. Por eso es tan importante cuidar este recurso natural.`,
          preguntas: [
            {
              pregunta: '¿Cuál es la idea principal del texto?',
              opciones: [
                'Los humanos necesitan comida',
                'El agua es esencial para la vida',
                'La Tierra tiene agua',
                'Los recursos naturales son muchos',
              ],
              respuestaCorrecta: 1,
            },
            {
              pregunta: '¿Cuánto tiempo puede vivir un humano sin agua?',
              opciones: ['Unas semanas', 'Un mes', 'Unos pocos días', 'Un año'],
              respuestaCorrecta: 2,
            },
          ],
          puntajeMinimo: 1,
          intentosPermitidos: 2,
        },
        publicada: true,
        recursos: [
          {
            nombre: 'Textos de práctica adicionales',
            tipo: 'pdf',
            url: '/recursos/lengua/textos-practica.pdf',
            tamano: 768000,
            disponibleOffline: true,
          },
        ],
      },
    ],
  },

  // Curso 4: Taller de Redacción (Pedro Sánchez - Lengua)
  {
    titulo: 'Taller de Redacción',
    slug: 'taller-redaccion',
    descripcion:
      'Mejora tu escritura con técnicas de redacción clara y efectiva. Aprende a estructurar textos y expresar ideas con precisión.',
    educadorEmail: 'educador2@amauta.test',
    categoriaSlug: 'lengua-literatura',
    nivel: Nivel.INTERMEDIO,
    estado: EstadoCurso.REVISION,
    duracion: 200,
    lecciones: [
      {
        titulo: 'Estructura de un párrafo',
        descripcion: 'Aprende a construir párrafos bien estructurados',
        orden: 1,
        tipo: TipoLeccion.TEXTO,
        duracion: 25,
        contenido: {
          markdown: `# Estructura de un Párrafo

Un buen párrafo tiene tres partes:

## 1. Oración temática
La primera oración presenta la idea principal del párrafo.

## 2. Oraciones de desarrollo
Explican, ejemplifican o argumentan la idea principal.

## 3. Oración de cierre
Concluye el párrafo y puede hacer transición al siguiente.

## Ejemplo
> **Los perros son excelentes compañeros.** Nos brindan amor incondicional y alegran nuestros días. Además, nos motivan a hacer ejercicio con sus paseos diarios. **Sin duda, tener un perro mejora nuestra calidad de vida.**`,
        },
        publicada: true,
        recursos: [
          {
            nombre: 'Plantilla de párrafo',
            tipo: 'pdf',
            url: '/recursos/lengua/plantilla-parrafo.pdf',
            tamano: 128000,
            disponibleOffline: true,
          },
        ],
      },
      {
        titulo: 'Ejercicio de redacción guiada',
        descripcion: 'Practica escribiendo con guías paso a paso',
        orden: 2,
        tipo: TipoLeccion.INTERACTIVO,
        duracion: 35,
        contenido: {
          tipo: 'escritura-guiada',
          instrucciones:
            'Completa cada parte del párrafo siguiendo las indicaciones',
          pasos: [
            {
              paso: 1,
              indicacion:
                'Escribe una oración temática sobre tu mascota favorita',
              ejemplo: 'Los gatos son mascotas independientes y cariñosas.',
            },
            {
              paso: 2,
              indicacion: 'Agrega dos oraciones de desarrollo',
              ejemplo:
                'No requieren paseos diarios. Son muy limpios y se acicalan solos.',
            },
            {
              paso: 3,
              indicacion: 'Escribe una oración de cierre',
              ejemplo:
                'Por estas razones, los gatos son ideales para personas ocupadas.',
            },
          ],
        },
        publicada: false,
        recursos: [],
      },
    ],
  },

  // Curso 5: Biología Celular (Laura Fernández - Ciencias Naturales)
  {
    titulo: 'Biología Celular',
    slug: 'biologia-celular',
    descripcion:
      'Descubre el fascinante mundo de las células: la unidad básica de la vida. Aprende sobre sus partes, funciones y tipos.',
    educadorEmail: 'educador3@amauta.test',
    categoriaSlug: 'ciencias-naturales',
    nivel: Nivel.PRINCIPIANTE,
    estado: EstadoCurso.PUBLICADO,
    duracion: 210,
    imagen: '/images/cursos/biologia-celular.jpg',
    lecciones: [
      {
        titulo: 'La célula: unidad de vida',
        descripcion: 'Introducción a la célula y su importancia',
        orden: 1,
        tipo: TipoLeccion.VIDEO,
        duracion: 22,
        contenido: {
          videoUrl: 'https://example.com/videos/intro-celula.mp4',
          transcript:
            'Todos los seres vivos están formados por células. La célula es la unidad estructural y funcional de la vida...',
        },
        publicada: true,
        recursos: [
          {
            nombre: 'Infografía de la célula',
            tipo: 'image',
            url: '/recursos/biologia/infografia-celula.png',
            tamano: 2097152,
            disponibleOffline: true,
          },
        ],
      },
      {
        titulo: 'Partes de la célula',
        descripcion: 'Conoce los organelos y sus funciones',
        orden: 2,
        tipo: TipoLeccion.TEXTO,
        duracion: 30,
        contenido: {
          markdown: `# Partes de la Célula

## Membrana celular
Capa externa que protege la célula y controla lo que entra y sale.

## Citoplasma
Sustancia gelatinosa donde flotan los organelos.

## Núcleo
"Cerebro" de la célula. Contiene el ADN con la información genética.

## Mitocondrias
"Centrales de energía". Producen ATP para que la célula funcione.

## Ribosomas
Fabrican proteínas siguiendo las instrucciones del ADN.

## Retículo endoplasmático
Sistema de transporte interno de la célula.`,
        },
        publicada: true,
        recursos: [
          {
            nombre: 'Diagrama interactivo de la célula',
            tipo: 'pdf',
            url: '/recursos/biologia/diagrama-celula.pdf',
            tamano: 1536000,
            disponibleOffline: true,
          },
        ],
      },
      {
        titulo: 'Evaluación: La célula',
        descripcion: 'Demuestra lo que aprendiste sobre las células',
        orden: 3,
        tipo: TipoLeccion.QUIZ,
        duracion: 15,
        contenido: {
          preguntas: [
            {
              pregunta: '¿Qué organelo contiene el ADN?',
              opciones: ['Mitocondria', 'Núcleo', 'Ribosoma', 'Membrana'],
              respuestaCorrecta: 1,
            },
            {
              pregunta: '¿Qué función tiene la mitocondria?',
              opciones: [
                'Almacenar ADN',
                'Producir energía (ATP)',
                'Fabricar proteínas',
                'Proteger la célula',
              ],
              respuestaCorrecta: 1,
            },
            {
              pregunta: '¿Qué organelo fabrica proteínas?',
              opciones: ['Núcleo', 'Mitocondria', 'Ribosoma', 'Citoplasma'],
              respuestaCorrecta: 2,
            },
          ],
          puntajeMinimo: 2,
          intentosPermitidos: 3,
        },
        publicada: true,
        recursos: [],
      },
    ],
  },

  // Curso 6: Introducción a Física (Laura Fernández - Ciencias Naturales)
  {
    titulo: 'Introducción a Física',
    slug: 'introduccion-fisica',
    descripcion:
      'Explora los principios fundamentales de la física: movimiento, fuerza, energía y las leyes que gobiernan el universo.',
    educadorEmail: 'educador3@amauta.test',
    categoriaSlug: 'ciencias-naturales',
    nivel: Nivel.AVANZADO,
    estado: EstadoCurso.BORRADOR,
    duracion: 300,
    lecciones: [
      {
        titulo: '¿Qué es la física?',
        descripcion: 'Introducción a la ciencia que estudia la naturaleza',
        orden: 1,
        tipo: TipoLeccion.VIDEO,
        duracion: 25,
        contenido: {
          videoUrl: 'https://example.com/videos/intro-fisica.mp4',
          transcript:
            'La física es la ciencia que estudia las propiedades de la materia y la energía...',
        },
        publicada: false,
        recursos: [
          {
            nombre: 'Línea del tiempo de la física',
            tipo: 'pdf',
            url: '/recursos/fisica/linea-tiempo.pdf',
            tamano: 896000,
            disponibleOffline: false,
          },
        ],
      },
      {
        titulo: 'Las leyes de Newton',
        descripcion: 'Fundamentos del movimiento y las fuerzas',
        orden: 2,
        tipo: TipoLeccion.TEXTO,
        duracion: 35,
        contenido: {
          markdown: `# Las Tres Leyes de Newton

## Primera Ley: Inercia
Un objeto en reposo permanece en reposo, y un objeto en movimiento continúa en movimiento a velocidad constante, a menos que actúe sobre él una fuerza externa.

**Ejemplo**: Una pelota no se mueve sola; necesitas patearla.

## Segunda Ley: F = m × a
La aceleración de un objeto es directamente proporcional a la fuerza neta que actúa sobre él e inversamente proporcional a su masa.

**Ejemplo**: Es más fácil empujar una silla que un auto.

## Tercera Ley: Acción y Reacción
Para cada acción hay una reacción igual y opuesta.

**Ejemplo**: Cuando saltas, empujas el suelo hacia abajo y el suelo te empuja hacia arriba.`,
        },
        publicada: false,
        recursos: [],
      },
    ],
  },
];

export async function seedCursos(prisma: PrismaClient): Promise<void> {
  console.log('📖 Creando cursos, lecciones y recursos...');

  let _totalLecciones = 0;
  let _totalRecursos = 0;

  for (const cursoData of cursosData) {
    // Obtener educador y categoría
    const educador = await getUsuarioByEmail(prisma, cursoData.educadorEmail);
    const categoria = await getCategoriaBySlug(prisma, cursoData.categoriaSlug);

    if (!educador) {
      console.log(`   ⚠ Educador no encontrado: ${cursoData.educadorEmail}`);
      continue;
    }

    if (!categoria) {
      console.log(`   ⚠ Categoría no encontrada: ${cursoData.categoriaSlug}`);
      continue;
    }

    // Crear o actualizar curso
    const curso = await prisma.curso.upsert({
      where: { slug: cursoData.slug },
      update: {
        titulo: cursoData.titulo,
        descripcion: cursoData.descripcion,
        educadorId: educador.id,
        categoriaId: categoria.id,
        nivel: cursoData.nivel,
        estado: cursoData.estado,
        duracion: cursoData.duracion,
        imagen: cursoData.imagen,
        publicadoEn:
          cursoData.estado === EstadoCurso.PUBLICADO ? new Date() : null,
      },
      create: {
        titulo: cursoData.titulo,
        slug: cursoData.slug,
        descripcion: cursoData.descripcion,
        educadorId: educador.id,
        categoriaId: categoria.id,
        nivel: cursoData.nivel,
        estado: cursoData.estado,
        duracion: cursoData.duracion,
        imagen: cursoData.imagen,
        publicadoEn:
          cursoData.estado === EstadoCurso.PUBLICADO ? new Date() : null,
      },
    });

    console.log(
      `   ✓ Curso: ${curso.titulo} (${curso.nivel}, ${curso.estado})`
    );

    // Crear lecciones para este curso
    for (const leccionData of cursoData.lecciones) {
      // Buscar lección existente por curso y orden
      const existingLeccion = await prisma.leccion.findFirst({
        where: {
          cursoId: curso.id,
          orden: leccionData.orden,
        },
      });

      const leccion = existingLeccion
        ? await prisma.leccion.update({
            where: { id: existingLeccion.id },
            data: {
              titulo: leccionData.titulo,
              descripcion: leccionData.descripcion,
              tipo: leccionData.tipo,
              duracion: leccionData.duracion,
              contenido: leccionData.contenido,
              publicada: leccionData.publicada,
            },
          })
        : await prisma.leccion.create({
            data: {
              titulo: leccionData.titulo,
              descripcion: leccionData.descripcion,
              orden: leccionData.orden,
              cursoId: curso.id,
              tipo: leccionData.tipo,
              duracion: leccionData.duracion,
              contenido: leccionData.contenido,
              publicada: leccionData.publicada,
            },
          });

      _totalLecciones++;
      console.log(
        `      ✓ Lección ${leccion.orden}: ${leccion.titulo} (${leccion.tipo})`
      );

      // Crear recursos para esta lección
      for (const recursoData of leccionData.recursos) {
        // Buscar recurso existente por lección y nombre
        const existingRecurso = await prisma.recurso.findFirst({
          where: {
            leccionId: leccion.id,
            nombre: recursoData.nombre,
          },
        });

        if (existingRecurso) {
          await prisma.recurso.update({
            where: { id: existingRecurso.id },
            data: {
              tipo: recursoData.tipo,
              url: recursoData.url,
              tamano: recursoData.tamano,
              disponibleOffline: recursoData.disponibleOffline,
            },
          });
        } else {
          await prisma.recurso.create({
            data: {
              nombre: recursoData.nombre,
              tipo: recursoData.tipo,
              url: recursoData.url,
              tamano: recursoData.tamano,
              leccionId: leccion.id,
              disponibleOffline: recursoData.disponibleOffline,
            },
          });
        }

        _totalRecursos++;
        console.log(
          `         ✓ Recurso: ${recursoData.nombre} (${recursoData.tipo})`
        );
      }
    }
  }

  // Resumen
  const totalCursos = await prisma.curso.count();
  const dbLecciones = await prisma.leccion.count();
  const dbRecursos = await prisma.recurso.count();

  console.log(
    `✅ ${totalCursos} cursos, ${dbLecciones} lecciones, ${dbRecursos} recursos\n`
  );
}

/**
 * Obtener curso por slug (helper para otras etapas)
 */
export async function getCursoBySlug(prisma: PrismaClient, slug: string) {
  return prisma.curso.findUnique({
    where: { slug },
    include: {
      lecciones: {
        orderBy: { orden: 'asc' },
        include: { recursos: true },
      },
    },
  });
}
