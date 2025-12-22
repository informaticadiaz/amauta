# Roadmap - Amauta

## Visión General

Este roadmap establece la estrategia de desarrollo de Amauta en fases incrementales, priorizando funcionalidad básica primero y agregando complejidad de manera gradual.

## Principio de Desarrollo

**MVP → Iteración → Escala**

Cada fase entrega valor usable antes de pasar a la siguiente.

---

## Fase 0: Fundamentos (Actual - 76% Completado)

**Duración estimada**: 2 semanas
**Progreso**: 13/17 tareas completadas
**Iniciado**: 01/12/2024
**Estimado de finalización**: 31/12/2024

### Objetivos

- Establecer bases del proyecto
- Configurar infraestructura de desarrollo
- Documentación inicial

### Entregables

- [x] Estructura de proyecto (Turborepo con monorepo) - T-008
- [x] Documentación técnica base
- [x] Documentación de gestión
- [x] Configuración de repositorio (.gitignore, licencia, código de conducta) - T-001, T-002, T-003, T-004
- [x] CI/CD pipeline básico (GitHub Actions) - T-005, T-006
- [x] TypeScript configurado con strict mode - T-009
- [x] ESLint y Prettier configurados - T-010
- [x] Pre-commit hooks con Husky - T-007
- [x] Variables de entorno con validación Zod - T-011
- [x] PostgreSQL 15 + Redis 7 configurados - T-012
- [x] Prisma ORM con schema completo (15 modelos) - T-013
- [x] Entorno de desarrollo documentado
- [x] Estrategia de seguridad para variables de entorno
- [ ] Seed data para base de datos - T-014
- [ ] Expandir CI con lint, type-check y build - T-014bis
- [ ] Diagramas de arquitectura - T-015
- [ ] Documentar API endpoints - T-016

---

## Fase 1: MVP - Plataforma de Cursos Básica

**Duración estimada**: 6-8 semanas
**Sprint 1-4**

### Objetivos

Crear plataforma funcional donde educadores puedan publicar cursos y estudiantes consumirlos.

### Historias de Usuario Principales

#### Como Educador

- Puedo registrarme en la plataforma
- Puedo crear un curso con título, descripción e imagen
- Puedo agregar lecciones de texto y video
- Puedo publicar mi curso

#### Como Estudiante

- Puedo registrarme en la plataforma
- Puedo navegar el catálogo de cursos
- Puedo inscribirme en un curso
- Puedo ver las lecciones del curso
- Puedo marcar lecciones como completadas

### Funcionalidades Técnicas

- Autenticación y autorización (NextAuth.js)
- CRUD de cursos
- CRUD de lecciones
- Sistema de inscripción
- Seguimiento básico de progreso
- UI responsive

### Entregables

- Frontend con Next.js desplegado
- Backend API funcional
- Base de datos PostgreSQL configurada
- Autenticación implementada
- 5+ cursos de demostración

### Criterios de Éxito

- Un educador puede crear y publicar un curso completo
- Un estudiante puede completar un curso de principio a fin
- La aplicación funciona en móvil y desktop

---

## Fase 2: Offline-First & PWA

**Duración estimada**: 4-6 semanas
**Sprint 5-7**

### Objetivos

Habilitar funcionalidad offline para acceso sin conexión, transformando Amauta en una Progressive Web App completamente funcional offline.

### Historias de Usuario

#### Como Estudiante

- Puedo descargar un curso para verlo sin conexión
- Puedo ver mis lecciones descargadas sin internet
- Mi progreso se sincroniza automáticamente cuando recupero conexión
- Puedo instalar Amauta como app en mi dispositivo
- Recibo notificaciones cuando se completa la sincronización
- Puedo ver cuánto espacio ocupan mis descargas
- Puedo eliminar cursos descargados para liberar espacio

#### Como Educador

- Puedo actualizar contenido de un curso y los estudiantes reciben la actualización al conectarse
- Puedo ver métricas de uso offline de mis cursos

### Funcionalidades Técnicas

#### Service Worker con Workbox

**Estrategias de caché**:

```typescript
// apps/web/src/service-worker.ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Precachear assets estáticos (CSS, JS, fonts)
precacheAndRoute(self.__WB_MANIFEST);

// API requests - Network First
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60, // 1 hora
      }),
    ],
  })
);

// Imágenes - Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
      }),
    ],
  })
);

// Videos - Cache First (para cursos descargados)
registerRoute(
  ({ url }) => url.pathname.includes('/videos/'),
  new CacheFirst({
    cacheName: 'video-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 24 * 60 * 60, // 60 días
      }),
    ],
  })
);
```

#### IndexedDB para Almacenamiento Local

**Stores necesarias**:

- `cursos`: Metadata de cursos descargados
- `lecciones`: Contenido de lecciones
- `progreso`: Tracking de progreso local
- `pendingSyncs`: Cola de operaciones pendientes
- `assets`: Imágenes y multimedia

```typescript
// apps/web/src/lib/db/offline-db.ts
import Dexie, { Table } from 'dexie';

interface CursoOffline {
  id: string;
  titulo: string;
  descripcion: string;
  fechaDescarga: Date;
  ultimaActualizacion: Date;
  tamañoBytes: number;
}

interface LeccionOffline {
  id: string;
  cursoId: string;
  titulo: string;
  contenido: string;
  videoUrl?: string;
  videoBlobUrl?: string; // Blob URL del video descargado
}

interface ProgresoOffline {
  leccionId: string;
  completada: boolean;
  progreso: number;
  timestamp: Date;
  sincronizado: boolean;
}

class OfflineDatabase extends Dexie {
  cursos!: Table<CursoOffline>;
  lecciones!: Table<LeccionOffline>;
  progreso!: Table<ProgresoOffline>;

  constructor() {
    super('AmatuaOfflineDB');
    this.version(1).stores({
      cursos: 'id, fechaDescarga',
      lecciones: 'id, cursoId',
      progreso: 'leccionId, sincronizado',
    });
  }
}

export const db = new OfflineDatabase();
```

#### Background Sync API

**Sincronización de progreso**:

```typescript
// apps/web/src/lib/sync/background-sync.ts
export async function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-progress');
  }
}

// En el Service Worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncPendingProgress());
  }
});

async function syncPendingProgress() {
  const pendingProgress = await db.progreso
    .where('sincronizado')
    .equals(false)
    .toArray();

  for (const item of pendingProgress) {
    try {
      await fetch('/api/progreso', {
        method: 'POST',
        body: JSON.stringify(item),
      });

      // Marcar como sincronizado
      await db.progreso.update(item.leccionId, { sincronizado: true });
    } catch (error) {
      console.error('Error sincronizando:', error);
    }
  }
}
```

#### Gestión de Conflictos

**Estrategia: Last-Write-Wins con timestamp**

```typescript
// apps/web/src/lib/sync/conflict-resolution.ts
export async function resolveConflict(
  local: ProgresoOffline,
  remote: ProgresoRemote
) {
  // Si el timestamp local es más reciente, usar local
  if (local.timestamp > remote.timestamp) {
    return local;
  }

  // Si el remoto es más reciente, usar remoto
  if (remote.timestamp > local.timestamp) {
    return remote;
  }

  // Si son iguales, preferir el que tiene más progreso
  return local.progreso > remote.progreso ? local : remote;
}
```

#### PWA Manifest

```json
// apps/web/public/manifest.json
{
  "name": "Amauta - Plataforma Educativa",
  "short_name": "Amauta",
  "description": "Educación accesible offline-first",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ],
  "categories": ["education"],
  "lang": "es"
}
```

#### Descarga Selectiva de Contenido

```typescript
// apps/web/src/components/curso/download-button.tsx
'use client';

import { useState } from 'react';
import { Download, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function DownloadCursoButton({ cursoId }: { cursoId: string }) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);

    try {
      // 1. Obtener metadata del curso
      const curso = await fetch(`/api/cursos/${cursoId}`).then(r => r.json());

      // 2. Descargar lecciones
      const lecciones = await fetch(`/api/cursos/${cursoId}/lecciones`).then(r => r.json());

      // 3. Descargar videos e imágenes
      for (let i = 0; i < lecciones.length; i++) {
        const leccion = lecciones[i];

        if (leccion.videoUrl) {
          const videoBlob = await fetch(leccion.videoUrl).then(r => r.blob());
          const videoBlobUrl = URL.createObjectURL(videoBlob);

          await db.lecciones.add({
            ...leccion,
            videoBlobUrl,
          });
        }

        setProgress((i + 1) / lecciones.length * 100);
      }

      // 4. Guardar en IndexedDB
      await db.cursos.add({
        id: curso.id,
        titulo: curso.titulo,
        descripcion: curso.descripcion,
        fechaDescarga: new Date(),
      });

      setDownloaded(true);
    } catch (error) {
      console.error('Error descargando curso:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    await db.lecciones.where('cursoId').equals(cursoId).delete();
    await db.cursos.delete(cursoId);
    setDownloaded(false);
  };

  if (downloaded) {
    return (
      <Button variant="destructive" onClick={handleDelete}>
        <Trash className="mr-2 h-4 w-4" />
        Eliminar descarga
      </Button>
    );
  }

  return (
    <>
      <Button onClick={handleDownload} disabled={downloading}>
        <Download className="mr-2 h-4 w-4" />
        {downloading ? 'Descargando...' : 'Descargar para offline'}
      </Button>
      {downloading && <Progress value={progress} className="mt-2" />}
    </>
  );
}
```

### Entregables

- [x] PWA manifest configurado
- [x] Service Worker con Workbox implementado
- [x] IndexedDB schema definida
- [x] UI de descarga de cursos
- [x] Background Sync implementado
- [x] Indicadores de estado de sincronización
- [x] Gestión de almacenamiento (ver espacio usado)
- [x] Tests de funcionalidad offline

### Stack Tecnológico Específico

- **Service Worker**: Workbox 7+
- **IndexedDB**: Dexie.js
- **PWA tooling**: next-pwa o @ducanh2912/next-pwa
- **Notificaciones**: Web Notifications API
- **Detección de red**: Network Information API

### Criterios de Éxito

- ✅ Usuario puede descargar curso completo en < 2 minutos
- ✅ Usuario puede estudiar 100% offline sin errores
- ✅ Progreso se sincroniza al reconectar en < 10 segundos
- ✅ PWA instalable en Android/iOS/Desktop (Lighthouse PWA score > 90)
- ✅ App funciona offline en modo avión
- ✅ Conflictos de sincronización se resuelven automáticamente

### Consideraciones de Implementación

**Prioridad 1 (Core)**:

- Service Worker básico con caché de assets
- Descarga de lecciones de texto
- Sincronización de progreso básica

**Prioridad 2 (Nice to have)**:

- Descarga de videos
- Background Sync avanzado
- Notificaciones push

**Prioridad 3 (Futuro)**:

- Sincronización selectiva (solo cambios delta)
- Compartir cursos offline vía Bluetooth/Wi-Fi Direct
- Pre-caching inteligente basado en uso

---

## Fase 3: Evaluaciones y Certificaciones

**Duración estimada**: 4-5 semanas
**Sprint 8-10**

### Objetivos

Agregar sistema robusto de evaluación y certificación de conocimientos que permita a educadores medir el aprendizaje y a estudiantes validar sus conocimientos.

### Historias de Usuario

#### Como Educador

- Puedo crear quizzes y exámenes con banco de preguntas
- Puedo definir criterios de aprobación (puntaje mínimo, intentos máximos)
- Puedo ver estadísticas de rendimiento de estudiantes
- Puedo exportar resultados de evaluaciones
- Puedo crear preguntas de diferentes tipos
- Puedo reutilizar preguntas entre evaluaciones
- Puedo ver tiempo promedio de respuesta por pregunta

#### Como Estudiante

- Puedo realizar evaluaciones dentro de los cursos
- Puedo ver mi puntaje y feedback inmediato
- Puedo obtener un certificado al completar un curso exitosamente
- Puedo descargar/compartir mi certificado
- Puedo ver mi historial de intentos de evaluaciones
- Puedo revisar mis respuestas después de completar
- Puedo obtener retroalimentación sobre respuestas incorrectas

### Funcionalidades Técnicas

#### Tipos de Pregunta

**1. Opción Múltiple (single choice)**

```typescript
// apps/api/src/modules/evaluaciones/entities/pregunta.entity.ts
interface PreguntaOpcionMultiple {
  tipo: 'MULTIPLE_CHOICE';
  enunciado: string;
  opciones: {
    id: string;
    texto: string;
    esCorrecta: boolean;
    feedback?: string; // Feedback específico por opción
  }[];
  puntaje: number;
  tiempoLimiteSegundos?: number;
}
```

**2. Selección Múltiple (multiple select)**

```typescript
interface PreguntaSeleccionMultiple {
  tipo: 'MULTIPLE_SELECT';
  enunciado: string;
  opciones: {
    id: string;
    texto: string;
    esCorrecta: boolean;
  }[];
  puntaje: number;
  puntajeParcial: boolean; // Si se otorga puntaje parcial por respuestas parcialmente correctas
}
```

**3. Verdadero/Falso**

```typescript
interface PreguntaVerdaderoFalso {
  tipo: 'TRUE_FALSE';
  enunciado: string;
  respuestaCorrecta: boolean;
  puntaje: number;
  explicacion?: string;
}
```

**4. Respuesta Corta**

```typescript
interface PreguntaRespuestaCorta {
  tipo: 'SHORT_ANSWER';
  enunciado: string;
  respuestasValidas: string[]; // Múltiples respuestas válidas posibles
  caseSensitive: boolean;
  puntaje: number;
}
```

**5. Respuesta Larga (requiere revisión manual)**

```typescript
interface PreguntaRespuestaLarga {
  tipo: 'ESSAY';
  enunciado: string;
  minimoCaracteres: number;
  maximoCaracteres: number;
  puntaje: number;
  criteriosEvaluacion: string[]; // Rúbrica para el educador
}
```

**6. Emparejamiento**

```typescript
interface PreguntaEmparejamiento {
  tipo: 'MATCHING';
  enunciado: string;
  pares: {
    izquierda: string;
    derecha: string;
  }[];
  puntaje: number;
}
```

#### Sistema de Calificación Automática

```typescript
// apps/api/src/modules/evaluaciones/services/calificacion.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class CalificacionService {
  /**
   * Califica una respuesta de estudiante
   */
  async calificarRespuesta(
    pregunta: Pregunta,
    respuestaEstudiante: any
  ): Promise<ResultadoCalificacion> {
    switch (pregunta.tipo) {
      case 'MULTIPLE_CHOICE':
        return this.calificarOpcionMultiple(pregunta, respuestaEstudiante);

      case 'MULTIPLE_SELECT':
        return this.calificarSeleccionMultiple(pregunta, respuestaEstudiante);

      case 'TRUE_FALSE':
        return this.calificarVerdaderoFalso(pregunta, respuestaEstudiante);

      case 'SHORT_ANSWER':
        return this.calificarRespuestaCorta(pregunta, respuestaEstudiante);

      case 'ESSAY':
        // Requiere revisión manual
        return { puntajeObtenido: null, requiereRevision: true };

      case 'MATCHING':
        return this.calificarEmparejamiento(pregunta, respuestaEstudiante);

      default:
        throw new Error(`Tipo de pregunta no soportado: ${pregunta.tipo}`);
    }
  }

  private calificarOpcionMultiple(
    pregunta: PreguntaOpcionMultiple,
    respuestaEstudiante: string
  ): ResultadoCalificacion {
    const opcionCorrecta = pregunta.opciones.find((op) => op.esCorrecta);
    const esCorrecta = respuestaEstudiante === opcionCorrecta?.id;

    return {
      puntajeObtenido: esCorrecta ? pregunta.puntaje : 0,
      esCorrecta,
      feedback: pregunta.opciones.find((op) => op.id === respuestaEstudiante)
        ?.feedback,
    };
  }

  private calificarSeleccionMultiple(
    pregunta: PreguntaSeleccionMultiple,
    respuestasEstudiante: string[]
  ): ResultadoCalificacion {
    const opcionesCorrectas = pregunta.opciones
      .filter((op) => op.esCorrecta)
      .map((op) => op.id);

    const correctas = respuestasEstudiante.filter((r) =>
      opcionesCorrectas.includes(r)
    ).length;
    const incorrectas = respuestasEstudiante.filter(
      (r) => !opcionesCorrectas.includes(r)
    ).length;
    const omitidas = opcionesCorrectas.filter(
      (c) => !respuestasEstudiante.includes(c)
    ).length;

    const esCorrecta =
      correctas === opcionesCorrectas.length && incorrectas === 0;

    let puntaje: number;
    if (pregunta.puntajeParcial) {
      // Puntaje parcial: (correctas - incorrectas) / total * puntaje máximo
      puntaje = Math.max(
        0,
        ((correctas - incorrectas) / opcionesCorrectas.length) *
          pregunta.puntaje
      );
    } else {
      puntaje = esCorrecta ? pregunta.puntaje : 0;
    }

    return { puntajeObtenido: puntaje, esCorrecta };
  }

  private calificarRespuestaCorta(
    pregunta: PreguntaRespuestaCorta,
    respuestaEstudiante: string
  ): ResultadoCalificacion {
    const respuestaNormalizada = pregunta.caseSensitive
      ? respuestaEstudiante.trim()
      : respuestaEstudiante.trim().toLowerCase();

    const respuestasValidasNormalizadas = pregunta.respuestasValidas.map((r) =>
      pregunta.caseSensitive ? r.trim() : r.trim().toLowerCase()
    );

    const esCorrecta =
      respuestasValidasNormalizadas.includes(respuestaNormalizada);

    return {
      puntajeObtenido: esCorrecta ? pregunta.puntaje : 0,
      esCorrecta,
    };
  }
}
```

#### Generación de Certificados (PDF)

```typescript
// apps/api/src/modules/certificados/services/certificado-generator.service.ts
import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { join } from 'path';

@Injectable()
export class CertificadoGeneratorService {
  async generarCertificado(
    estudianteId: string,
    cursoId: string
  ): Promise<string> {
    const estudiante = await this.prisma.usuario.findUnique({
      where: { id: estudianteId },
    });

    const curso = await this.prisma.curso.findUnique({
      where: { id: cursoId },
      include: { educador: true },
    });

    const progreso = await this.prisma.progresoCurso.findUnique({
      where: {
        estudianteId_cursoId: {
          estudianteId,
          cursoId,
        },
      },
    });

    if (progreso?.porcentajeCompletado < 100) {
      throw new Error('El curso no está completado');
    }

    const certificadoId = `CERT-${Date.now()}-${estudianteId.slice(0, 8)}`;
    const filePath = join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'certificados',
      `${certificadoId}.pdf`
    );

    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
    });

    doc.pipe(createWriteStream(filePath));

    // Header
    doc
      .fontSize(40)
      .font('Helvetica-Bold')
      .text('CERTIFICADO DE FINALIZACIÓN', { align: 'center' });

    doc.moveDown(2);

    // Cuerpo
    doc
      .fontSize(16)
      .font('Helvetica')
      .text('Se certifica que', { align: 'center' });

    doc.moveDown(0.5);

    doc
      .fontSize(30)
      .font('Helvetica-Bold')
      .text(estudiante.nombre, { align: 'center' });

    doc.moveDown(0.5);

    doc
      .fontSize(16)
      .font('Helvetica')
      .text('ha completado exitosamente el curso', { align: 'center' });

    doc.moveDown(0.5);

    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(curso.titulo, { align: 'center' });

    doc.moveDown(1);

    doc
      .fontSize(14)
      .font('Helvetica')
      .text(`Impartido por: ${curso.educador.nombre}`, { align: 'center' });

    doc.moveDown(0.5);

    doc.text(
      `Fecha de finalización: ${progreso.fechaFinalizacion?.toLocaleDateString('es-ES')}`,
      { align: 'center' }
    );

    doc.moveDown(2);

    // Footer
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`ID del certificado: ${certificadoId}`, { align: 'center' });

    doc.text(
      'Verifica este certificado en: https://amauta.diazignacio.ar/verificar/' +
        certificadoId,
      { align: 'center' }
    );

    doc.end();

    // Guardar referencia en base de datos
    await this.prisma.certificado.create({
      data: {
        id: certificadoId,
        estudianteId,
        cursoId,
        archivoUrl: `/uploads/certificados/${certificadoId}.pdf`,
        fechaEmision: new Date(),
      },
    });

    return filePath;
  }

  /**
   * Verifica la autenticidad de un certificado
   */
  async verificarCertificado(
    certificadoId: string
  ): Promise<CertificadoVerificacion> {
    const certificado = await this.prisma.certificado.findUnique({
      where: { id: certificadoId },
      include: {
        estudiante: { select: { nombre: true, email: true } },
        curso: { select: { titulo: true } },
      },
    });

    if (!certificado) {
      return { valido: false, mensaje: 'Certificado no encontrado' };
    }

    return {
      valido: true,
      estudiante: certificado.estudiante.nombre,
      curso: certificado.curso.titulo,
      fechaEmision: certificado.fechaEmision,
    };
  }
}
```

#### Dashboard de Estadísticas

```typescript
// apps/api/src/modules/evaluaciones/controllers/analytics.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@Controller('cursos/:cursoId/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('resumen')
  @Roles('EDUCADOR', 'ADMIN')
  async obtenerResumen(@Param('cursoId') cursoId: string) {
    const [
      totalEstudiantes,
      promedioGeneral,
      tasaAprobacion,
      tiempoPromedio,
      preguntasDificiles,
    ] = await Promise.all([
      this.analyticsService.contarEstudiantes(cursoId),
      this.analyticsService.calcularPromedioGeneral(cursoId),
      this.analyticsService.calcularTasaAprobacion(cursoId),
      this.analyticsService.calcularTiempoPromedio(cursoId),
      this.analyticsService.identificarPreguntasDificiles(cursoId),
    ]);

    return {
      totalEstudiantes,
      promedioGeneral,
      tasaAprobacion,
      tiempoPromedio,
      preguntasDificiles,
    };
  }

  @Get('estudiantes/:estudianteId/rendimiento')
  @Roles('EDUCADOR', 'ADMIN')
  async obtenerRendimientoEstudiante(
    @Param('cursoId') cursoId: string,
    @Param('estudianteId') estudianteId: string
  ) {
    return this.analyticsService.obtenerRendimientoDetallado(
      cursoId,
      estudianteId
    );
  }
}
```

### Entregables

- [x] Editor de evaluaciones con preview en tiempo real
- [x] Banco de preguntas reutilizables
- [x] Motor de calificación automática para 6 tipos de preguntas
- [x] Sistema de generación de certificados PDF
- [x] Página de verificación de certificados
- [x] Dashboard de analytics para educadores
- [x] Exportación de resultados (CSV, PDF)
- [x] Historial de intentos de estudiantes
- [x] Sistema de retroalimentación automática

### Stack Tecnológico Específico

- **Generación PDF**: PDFKit o Puppeteer
- **Charts**: Recharts o Chart.js
- **Editor de texto**: Lexical o TipTap (para preguntas y feedback)
- **Validación**: Zod schemas para cada tipo de pregunta
- **Almacenamiento**: PostgreSQL (evaluaciones) + S3/R2 (PDFs)

### Criterios de Éxito

- ✅ Educador puede crear evaluación completa con 10+ preguntas en < 15 minutos
- ✅ Estudiante puede completar evaluación y recibir feedback en < 2 segundos
- ✅ Certificado generado y descargable en < 5 segundos
- ✅ Dashboard de analytics carga en < 1 segundo
- ✅ Sistema soporta 100+ estudiantes tomando evaluación simultáneamente
- ✅ Certificados verificables públicamente
- ✅ 95%+ de preguntas calificadas automáticamente (solo essays requieren revisión manual)

### Consideraciones de Implementación

**Prioridad 1 (MVP)**:

- Opción múltiple y verdadero/falso
- Calificación automática básica
- Certificado PDF simple
- Historial de intentos

**Prioridad 2 (Importante)**:

- Selección múltiple y respuesta corta
- Dashboard de analytics
- Exportación de resultados
- Verificación de certificados

**Prioridad 3 (Futuro)**:

- Preguntas tipo essay con revisión manual
- Emparejamiento y orden
- Banco de preguntas colaborativo
- Certificados con blockchain verification
- Proctoring básico (detección de tab switching)

### Seguridad en Evaluaciones

**Anti-cheating measures**:

```typescript
// apps/web/src/components/evaluacion/evaluacion-secura.tsx
'use client';

import { useEffect, useState } from 'react';

export function EvaluacionSegura({ evaluacionId }: { evaluacionId: string }) {
  const [tabSwitches, setTabSwitches] = useState(0);

  useEffect(() => {
    // Detectar cambios de tab
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => prev + 1);

        // Reportar al servidor
        fetch(`/api/evaluaciones/${evaluacionId}/actividad`, {
          method: 'POST',
          body: JSON.stringify({ tipo: 'TAB_SWITCH', timestamp: new Date() }),
        });

        // Opcional: advertir al estudiante
        if (tabSwitches >= 3) {
          alert(
            'Has cambiado de pestaña múltiples veces. Esto ha sido registrado.'
          );
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [evaluacionId, tabSwitches]);

  return {
    /* UI de evaluación */
  };
}
```

**Tiempo límite por pregunta**:

```typescript
// apps/web/src/components/evaluacion/pregunta-con-timer.tsx
export function PreguntaConTimer({ pregunta, onTimeout }: Props) {
  const [tiempoRestante, setTiempoRestante] = useState(pregunta.tiempoLimiteSegundos);

  useEffect(() => {
    if (tiempoRestante <= 0) {
      onTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTiempoRestante(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [tiempoRestante, onTimeout]);

  return (
    <div>
      <div className="text-right text-red-600">
        Tiempo restante: {Math.floor(tiempoRestante / 60)}:{tiempoRestante % 60}
      </div>
      {/* Renderizar pregunta */}
    </div>
  );
}
```

---

## Fase 4: Módulo Administrativo Escolar

**Duración estimada**: 6-8 semanas
**Sprint 11-14**

### Objetivos

Implementar un sistema completo de gestión administrativa escolar que permita a instituciones educativas gestionar estudiantes, asistencias, calificaciones y comunicaciones de manera eficiente.

### Historias de Usuario

#### Como Administrador Escolar

- Puedo crear y gestionar grupos/clases (cursos, grados, secciones)
- Puedo asignar estudiantes a grupos de manera masiva
- Puedo asignar educadores a grupos
- Puedo registrar asistencias diarias para múltiples grupos
- Puedo cargar calificaciones por periodos académicos
- Puedo publicar comunicados a estudiantes/apoderados con diferentes prioridades
- Puedo generar reportes de asistencia y rendimiento académico
- Puedo configurar periodos académicos (bimestres, trimestres, semestres)
- Puedo gestionar escalas de calificación personalizadas
- Puedo exportar datos para auditorías

#### Como Educador de Institución

- Puedo ver la lista de mis grupos asignados
- Puedo tomar asistencia fácilmente (interfaz rápida)
- Puedo ingresar notas de evaluaciones por periodo
- Puedo ver el historial académico de mis estudiantes
- Puedo generar reportes de mi grupo
- Puedo publicar comunicados a mis estudiantes

#### Como Estudiante/Apoderado

- Puedo ver mi historial de asistencias con gráficos
- Puedo ver mis calificaciones por periodo y materia
- Puedo recibir notificaciones de comunicados importantes
- Puedo descargar mi boletín de calificaciones
- Puedo ver el calendario académico
- Puedo ver estadísticas de mi rendimiento

### Funcionalidades Técnicas

#### Modelo Multi-Tenant (Instituciones)

**Aislamiento de datos por institución**:

```typescript
// apps/api/src/modules/instituciones/entities/institucion.entity.ts
export class Institucion {
  id: string;
  nombre: string;
  slug: string; // URL amigable: amauta.com/escuelas/san-martin
  tipoInstitucion: TipoInstitucion; // ESCUELA, COLEGIO, UNIVERSIDAD
  pais: string;
  ciudad: string;
  configuracion: ConfiguracionInstitucion; // JSON con settings específicos
  activa: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ConfiguracionInstitucion {
  periodosAcademicos: PeriodoAcademico[];
  escalaCalificacion: EscalaCalificacion;
  horarioClases: HorarioClase[];
  diasLaborables: DiaSemana[];
}

// Middleware para filtrar por institución
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const user = req.user as UserPayload;

    if (user && user.institucionId) {
      // Inyectar institucionId en el contexto de la request
      req['institucionId'] = user.institucionId;
    }

    next();
  }
}
```

#### Sistema de Asistencias

**Estados de asistencia**:

```typescript
enum EstadoAsistencia {
  PRESENTE = 'PRESENTE',
  AUSENTE = 'AUSENTE',
  TARDANZA = 'TARDANZA',
  JUSTIFICADO = 'JUSTIFICADO',
  PERMISO = 'PERMISO',
}

// apps/api/src/modules/asistencias/entities/asistencia.entity.ts
export class RegistroAsistencia {
  id: string;
  estudianteId: string;
  grupoId: string;
  fecha: Date;
  estado: EstadoAsistencia;
  observaciones?: string;
  registradoPor: string; // Usuario que registró
  horaRegistro: Date;
}
```

**Interfaz de registro rápido**:

```typescript
// apps/api/src/modules/asistencias/controllers/asistencia.controller.ts
@Controller('grupos/:grupoId/asistencia')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsistenciaController {
  /**
   * Registro masivo de asistencia para un grupo
   */
  @Post('masivo')
  @Roles('EDUCADOR', 'ADMIN_ESCOLAR')
  async registrarAsistenciaMasiva(
    @Param('grupoId') grupoId: string,
    @Body() dto: RegistroAsistenciaMasivoDto
  ) {
    // dto.asistencias = [{ estudianteId, estado, observaciones }]
    return this.asistenciaService.registrarMasivo(grupoId, dto);
  }

  /**
   * Obtener resumen de asistencias de un grupo por mes
   */
  @Get('resumen')
  @Roles('EDUCADOR', 'ADMIN_ESCOLAR')
  async obtenerResumenMensual(
    @Param('grupoId') grupoId: string,
    @Query('mes') mes: number,
    @Query('año') año: number
  ) {
    return this.asistenciaService.obtenerResumenMensual(grupoId, mes, año);
  }

  /**
   * Obtener porcentaje de asistencia de un estudiante
   */
  @Get('estudiante/:estudianteId/estadisticas')
  async obtenerEstadisticasEstudiante(
    @Param('grupoId') grupoId: string,
    @Param('estudianteId') estudianteId: string
  ) {
    const total = await this.asistenciaService.contarTotal(
      estudianteId,
      grupoId
    );
    const presentes = await this.asistenciaService.contarPresentes(
      estudianteId,
      grupoId
    );
    const ausentes = await this.asistenciaService.contarAusentes(
      estudianteId,
      grupoId
    );
    const tardanzas = await this.asistenciaService.contarTardanzas(
      estudianteId,
      grupoId
    );

    return {
      total,
      presentes,
      ausentes,
      tardanzas,
      porcentajeAsistencia: (presentes / total) * 100,
    };
  }
}
```

**UI de toma de asistencia rápida**:

```typescript
// apps/web/src/app/(dashboard)/grupos/[id]/asistencia/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Check, X, Clock, FileCheck } from 'lucide-react';

export default function TomaAsistenciaPage({ params }: { params: { id: string } }) {
  const { data: estudiantes } = useQuery(['grupo', params.id, 'estudiantes']);
  const [asistencias, setAsistencias] = useState<Map<string, EstadoAsistencia>>(new Map());

  const handleEstado = (estudianteId: string, estado: EstadoAsistencia) => {
    setAsistencias(prev => new Map(prev).set(estudianteId, estado));
  };

  const handleGuardar = async () => {
    const payload = Array.from(asistencias.entries()).map(([estudianteId, estado]) => ({
      estudianteId,
      estado,
    }));

    await fetch(`/api/grupos/${params.id}/asistencia/masivo`, {
      method: 'POST',
      body: JSON.stringify({ asistencias: payload, fecha: new Date() }),
    });

    toast.success('Asistencia registrada correctamente');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Toma de Asistencia</h1>
        <Button onClick={handleGuardar}>Guardar Asistencia</Button>
      </div>

      <div className="grid gap-2">
        {estudiantes?.map(estudiante => (
          <div key={estudiante.id} className="flex items-center justify-between p-4 border rounded">
            <div className="flex items-center gap-3">
              <Avatar>{estudiante.nombre[0]}</Avatar>
              <span className="font-medium">{estudiante.nombre}</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant={asistencias.get(estudiante.id) === 'PRESENTE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleEstado(estudiante.id, 'PRESENTE')}
              >
                <Check className="h-4 w-4" />
              </Button>

              <Button
                variant={asistencias.get(estudiante.id) === 'TARDANZA' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleEstado(estudiante.id, 'TARDANZA')}
              >
                <Clock className="h-4 w-4" />
              </Button>

              <Button
                variant={asistencias.get(estudiante.id) === 'AUSENTE' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => handleEstado(estudiante.id, 'AUSENTE')}
              >
                <X className="h-4 w-4" />
              </Button>

              <Button
                variant={asistencias.get(estudiante.id) === 'JUSTIFICADO' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleEstado(estudiante.id, 'JUSTIFICADO')}
              >
                <FileCheck className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Sistema de Calificaciones por Periodo

```typescript
// apps/api/src/modules/calificaciones/entities/calificacion.entity.ts
export class CalificacionEscolar {
  id: string;
  estudianteId: string;
  grupoId: string;
  materiaId: string;
  periodoId: string; // Bimestre, Trimestre, Semestre
  calificacion: number;
  calificacionCualitativa?: string; // "Excelente", "Bueno", "Regular", etc.
  observaciones?: string;
  fechaRegistro: Date;
  registradoPor: string;
}

export class PeriodoAcademico {
  id: string;
  institucionId: string;
  nombre: string; // "1er Bimestre 2024"
  tipo: TipoPeriodo; // BIMESTRE, TRIMESTRE, SEMESTRE, ANUAL
  fechaInicio: Date;
  fechaFin: Date;
  activo: boolean;
}

export class EscalaCalificacion {
  id: string;
  institucionId: string;
  nombre: string;
  tipo: TipoEscala; // NUMERICA, LITERAL, CONCEPTUAL
  valorMinimo: number;
  valorMaximo: number;
  notaAprobatoria: number;
  equivalencias?: EquivalenciaCalificacion[]; // Para escalas conceptuales
}

interface EquivalenciaCalificacion {
  desde: number;
  hasta: number;
  concepto: string; // "AD", "A", "B", "C" o "Excelente", "Bueno", etc.
}
```

**Boletín de calificaciones**:

```typescript
// apps/api/src/modules/reportes/services/boletin.service.ts
@Injectable()
export class BoletinService {
  async generarBoletin(
    estudianteId: string,
    periodoId: string
  ): Promise<Buffer> {
    const estudiante = await this.prisma.usuario.findUnique({
      where: { id: estudianteId },
    });

    const calificaciones = await this.prisma.calificacionEscolar.findMany({
      where: { estudianteId, periodoId },
      include: { materia: true },
    });

    const periodo = await this.prisma.periodoAcademico.findUnique({
      where: { id: periodoId },
    });

    const promedio =
      calificaciones.reduce((acc, cal) => acc + cal.calificacion, 0) /
      calificaciones.length;

    // Generar PDF con PDFKit
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));

    doc.fontSize(20).text('BOLETÍN DE CALIFICACIONES', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Estudiante: ${estudiante.nombre}`);
    doc.text(`Periodo: ${periodo.nombre}`);
    doc.moveDown();

    // Tabla de calificaciones
    doc.fontSize(10);
    calificaciones.forEach((cal) => {
      doc.text(`${cal.materia.nombre}: ${cal.calificacion}`, { indent: 20 });
    });

    doc.moveDown();
    doc.fontSize(12).text(`Promedio General: ${promedio.toFixed(2)}`);

    doc.end();

    return Buffer.concat(buffers);
  }
}
```

#### Sistema de Comunicados

```typescript
// apps/api/src/modules/comunicados/entities/comunicado.entity.ts
export class Comunicado {
  id: string;
  institucionId: string;
  titulo: string;
  contenido: string;
  prioridad: PrioridadComunicado; // BAJA, MEDIA, ALTA, URGENTE
  destinatarios: DestinatarioComunicado[]; // Grupos, estudiantes, apoderados
  publicadoPor: string;
  fechaPublicacion: Date;
  fechaExpiracion?: Date;
  adjuntos?: AdjuntoComunicado[];
  leido: boolean; // Para tracking de lectura
}

enum PrioridadComunicado {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

// Controller
@Controller('comunicados')
export class ComunicadosController {
  @Post()
  @Roles('ADMIN_ESCOLAR', 'EDUCADOR')
  async publicarComunicado(@Body() dto: CreateComunicadoDto) {
    const comunicado = await this.comunicadosService.crear(dto);

    // Enviar notificaciones
    await this.notificacionesService.enviarNotificacionComunicado(comunicado);

    return comunicado;
  }

  @Get('mis-comunicados')
  async obtenerMisComunicados(@User() user: UserPayload) {
    return this.comunicadosService.obtenerParaUsuario(user.id, user.rol);
  }

  @Patch(':id/marcar-leido')
  async marcarComoLeido(@Param('id') id: string, @User() user: UserPayload) {
    return this.comunicadosService.marcarLeido(id, user.id);
  }
}
```

#### Generador de Reportes

```typescript
// apps/api/src/modules/reportes/services/reportes.service.ts
@Injectable()
export class ReportesService {
  /**
   * Reporte de rendimiento académico de un grupo
   */
  async reporteRendimientoGrupo(grupoId: string, periodoId: string) {
    const calificaciones = await this.prisma.calificacionEscolar.findMany({
      where: { grupoId, periodoId },
      include: { estudiante: true, materia: true },
    });

    // Agrupar por estudiante
    const porEstudiante = calificaciones.reduce((acc, cal) => {
      if (!acc[cal.estudianteId]) {
        acc[cal.estudianteId] = {
          estudiante: cal.estudiante.nombre,
          calificaciones: [],
          promedio: 0,
        };
      }

      acc[cal.estudianteId].calificaciones.push({
        materia: cal.materia.nombre,
        calificacion: cal.calificacion,
      });

      return acc;
    }, {});

    // Calcular promedios
    Object.values(porEstudiante).forEach((est) => {
      est.promedio =
        est.calificaciones.reduce((acc, cal) => acc + cal.calificacion, 0) /
        est.calificaciones.length;
    });

    return porEstudiante;
  }

  /**
   * Reporte de asistencias de un grupo por mes
   */
  async reporteAsistenciasMensual(grupoId: string, mes: number, año: number) {
    const asistencias = await this.prisma.registroAsistencia.findMany({
      where: {
        grupoId,
        fecha: {
          gte: new Date(año, mes - 1, 1),
          lt: new Date(año, mes, 1),
        },
      },
      include: { estudiante: true },
    });

    // Estadísticas por estudiante
    const stats = asistencias.reduce((acc, asist) => {
      if (!acc[asist.estudianteId]) {
        acc[asist.estudianteId] = {
          estudiante: asist.estudiante.nombre,
          presentes: 0,
          ausentes: 0,
          tardanzas: 0,
          justificados: 0,
          total: 0,
        };
      }

      acc[asist.estudianteId].total++;
      acc[asist.estudianteId][asist.estado.toLowerCase() + 's']++;

      return acc;
    }, {});

    return Object.values(stats);
  }

  /**
   * Exportar a Excel
   */
  async exportarAExcel(data: any[], filename: string): Promise<Buffer> {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}
```

### Entregables

- [x] Dashboard administrativo con resumen de institución
- [x] CRUD de grupos/clases
- [x] Asignación masiva de estudiantes a grupos
- [x] Interfaz de asistencia rápida (< 2 min para 30 estudiantes)
- [x] Sistema de calificaciones por periodos académicos
- [x] Configuración de periodos y escalas de calificación
- [x] Centro de comunicados con notificaciones
- [x] Generador de reportes (asistencia, rendimiento, boletines)
- [x] Exportación a PDF y Excel
- [x] Calendario académico
- [x] Panel de estadísticas para administradores

### Stack Tecnológico Específico

- **Reportes PDF**: PDFKit o Puppeteer
- **Exportación Excel**: xlsx o exceljs
- **Notificaciones**: WebSocket (Socket.io) + Email (Resend)
- **Charts**: Recharts
- **Calendario**: FullCalendar o react-big-calendar
- **Multi-tenancy**: Filtros a nivel de Prisma middleware

### Criterios de Éxito

- ✅ Escuela puede gestionar 500+ estudiantes sin degradación de performance
- ✅ Asistencia de un grupo de 30 estudiantes registrable en < 2 minutos
- ✅ Reportes generables en < 5 segundos para grupos de 100 estudiantes
- ✅ Boletines de calificaciones generables en < 3 segundos
- ✅ Comunicados entregados a destinatarios en < 10 segundos
- ✅ Sistema soporta 5+ instituciones simultáneamente con aislamiento total de datos
- ✅ Exportación Excel de 500+ registros en < 10 segundos

### Consideraciones de Implementación

**Prioridad 1 (Core)**:

- CRUD de grupos y asignación de estudiantes
- Registro de asistencias (estados básicos)
- Sistema de calificaciones por periodo
- Reportes básicos (PDF)

**Prioridad 2 (Importante)**:

- Sistema de comunicados
- Dashboard de estadísticas
- Exportación Excel
- Calendario académico
- Notificaciones en tiempo real

**Prioridad 3 (Futuro)**:

- Integración con sistemas de apoderados (app móvil)
- Reportes avanzados con ML (predicción de deserción escolar)
- Sistema de permisos y licencias
- Integración con sistemas de pago de matrículas
- Geolocalización para registro de asistencia

### Seguridad y Multi-Tenancy

**Aislamiento de datos**:

```typescript
// Prisma middleware para multi-tenancy
prisma.$use(async (params, next) => {
  if (params.model) {
    const institucionId = getInstitucionIdFromContext();

    // Auto-inject institucionId en queries
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args.where = { ...params.args.where, institucionId };
    }

    if (params.action === 'create') {
      params.args.data = { ...params.args.data, institucionId };
    }
  }

  return next(params);
});
```

**Control de acceso basado en roles**:

```typescript
// Roles específicos del módulo escolar
enum RolEscolar {
  ESTUDIANTE = 'ESTUDIANTE',
  EDUCADOR = 'EDUCADOR',
  ADMIN_ESCOLAR = 'ADMIN_ESCOLAR',
  APODERADO = 'APODERADO',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

// Permisos por rol
const permisos = {
  [RolEscolar.ESTUDIANTE]: [
    'ver_propias_calificaciones',
    'ver_propia_asistencia',
  ],
  [RolEscolar.EDUCADOR]: [
    'registrar_asistencia',
    'ingresar_calificaciones',
    'ver_grupos_asignados',
  ],
  [RolEscolar.ADMIN_ESCOLAR]: [
    'gestionar_grupos',
    'gestionar_calificaciones',
    'generar_reportes',
    'publicar_comunicados',
  ],
  [RolEscolar.SUPER_ADMIN]: ['*'],
};
```

---

## Fase 5: Comunidad y Colaboración

**Duración estimada**: 5-6 semanas
**Sprint 15-17**

### Objetivos

Crear espacios vibrantes de interacción, colaboración y aprendizaje social entre estudiantes y educadores, fomentando la construcción de conocimiento colectivo.

### Historias de Usuario

#### Como Estudiante

- Puedo participar en foros de discusión del curso
- Puedo hacer preguntas al educador y a otros estudiantes
- Puedo colaborar con otros estudiantes en proyectos
- Puedo enviar mensajes directos a compañeros
- Puedo unirme a grupos de estudio públicos o privados
- Puedo dar "me gusta" y responder a publicaciones
- Puedo marcar respuestas como útiles
- Puedo recibir notificaciones de nuevas respuestas a mis preguntas
- Puedo seguir a otros usuarios interesantes

#### Como Educador

- Puedo moderar foros de mis cursos
- Puedo marcar respuestas como "solución oficial"
- Puedo recibir notificaciones de preguntas sin responder
- Puedo crear anuncios importantes en foros
- Puedo gestionar reportes de contenido inapropiado
- Puedo ver estadísticas de participación en foros

### Funcionalidades Técnicas

#### Sistema de Foros por Curso

```typescript
// apps/api/src/modules/foros/entities/foro.entity.ts
export class ForoPost {
  id: string;
  cursoId: string;
  autorId: string;
  tipo: TipoPost; // PREGUNTA, DISCUSION, ANUNCIO
  titulo: string;
  contenido: string;
  etiquetas: string[]; // ["javascript", "async-await"]
  esDestacado: boolean;
  cerrado: boolean; // Los educadores pueden cerrar threads
  vistas: number;
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  autor: Usuario;
  respuestas: ForoRespuesta[];
  reacciones: Reaccion[];
}

export class ForoRespuesta {
  id: string;
  postId: string;
  autorId: string;
  contenido: string;
  esSolucion: boolean; // Marcada por el educador o autor del post
  esUtil: number; // Contador de "útil"
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  autor: Usuario;
  reacciones: Reaccion[];
  respuestas: ForoRespuesta[]; // Respuestas a respuestas (threading)
}

enum TipoPost {
  PREGUNTA = 'PREGUNTA',
  DISCUSION = 'DISCUSION',
  ANUNCIO = 'ANUNCIO',
}
```

**API de Foros**:

```typescript
// apps/api/src/modules/foros/controllers/foro.controller.ts
@Controller('cursos/:cursoId/foros')
@UseGuards(JwtAuthGuard)
export class ForoController {
  /**
   * Listar posts de un curso con filtros
   */
  @Get()
  async listarPosts(
    @Param('cursoId') cursoId: string,
    @Query('tipo') tipo?: TipoPost,
    @Query('etiqueta') etiqueta?: string,
    @Query('sinResponder') sinResponder?: boolean,
    @Query('page') page: string = '1'
  ) {
    return this.foroService.listar({
      cursoId,
      tipo,
      etiqueta,
      sinResponder,
      page: parseInt(page),
      limit: 20,
    });
  }

  /**
   * Crear nuevo post
   */
  @Post()
  async crearPost(
    @Param('cursoId') cursoId: string,
    @User() user: UserPayload,
    @Body() dto: CreatePostDto
  ) {
    const post = await this.foroService.crearPost({
      ...dto,
      cursoId,
      autorId: user.id,
    });

    // Notificar a seguidores del curso
    await this.notificacionesService.notificarNuevoPost(post);

    return post;
  }

  /**
   * Agregar respuesta a un post
   */
  @Post(':postId/respuestas')
  async responder(
    @Param('postId') postId: string,
    @User() user: UserPayload,
    @Body() dto: CreateRespuestaDto
  ) {
    const respuesta = await this.foroService.crearRespuesta({
      ...dto,
      postId,
      autorId: user.id,
    });

    // Notificar al autor del post
    await this.notificacionesService.notificarNuevaRespuesta(respuesta);

    return respuesta;
  }

  /**
   * Marcar respuesta como solución (solo educador o autor del post)
   */
  @Patch('respuestas/:respuestaId/marcar-solucion')
  @Roles('EDUCADOR', 'ESTUDIANTE')
  async marcarComoSolucion(
    @Param('respuestaId') respuestaId: string,
    @User() user: UserPayload
  ) {
    return this.foroService.marcarSolucion(respuestaId, user.id);
  }

  /**
   * Marcar respuesta como útil
   */
  @Post('respuestas/:respuestaId/util')
  async marcarUtil(
    @Param('respuestaId') respuestaId: string,
    @User() user: UserPayload
  ) {
    return this.foroService.marcarUtil(respuestaId, user.id);
  }
}
```

**UI de Foros**:

```typescript
// apps/web/src/app/(cursos)/cursos/[id]/foro/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { MessageSquare, CheckCircle, ThumbsUp, Eye } from 'lucide-react';

export default function ForoPage({ params }: { params: { id: string } }) {
  const { data: posts } = useQuery(['foro', params.id]);
  const [filtro, setFiltro] = useState<'todos' | 'preguntas' | 'sin_responder'>('todos');

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Foro del Curso</h1>
        <Button>Nueva Pregunta</Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filtro === 'todos' ? 'default' : 'outline'}
          onClick={() => setFiltro('todos')}
        >
          Todos
        </Button>
        <Button
          variant={filtro === 'preguntas' ? 'default' : 'outline'}
          onClick={() => setFiltro('preguntas')}
        >
          Preguntas
        </Button>
        <Button
          variant={filtro === 'sin_responder' ? 'default' : 'outline'}
          onClick={() => setFiltro('sin_responder')}
        >
          Sin responder
        </Button>
      </div>

      {/* Lista de posts */}
      <div className="space-y-4">
        {posts?.map(post => (
          <div key={post.id} className="border rounded p-4 hover:shadow-md transition">
            <div className="flex gap-4">
              <Avatar>{post.autor.nombre[0]}</Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{post.titulo}</h3>
                    <p className="text-sm text-gray-600">
                      {post.autor.nombre} · {formatDate(post.createdAt)}
                    </p>
                  </div>

                  {post.esSolucionado && (
                    <Badge variant="success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resuelto
                    </Badge>
                  )}
                </div>

                <p className="mt-2 text-gray-700 line-clamp-2">{post.contenido}</p>

                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {post.respuestas.length} respuestas
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.vistas} vistas
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {post.reacciones.length} me gusta
                  </span>
                </div>

                {/* Etiquetas */}
                <div className="flex gap-2 mt-2">
                  {post.etiquetas.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Mensajería Interna

```typescript
// apps/api/src/modules/mensajes/entities/mensaje.entity.ts
export class Conversacion {
  id: string;
  tipo: TipoConversacion; // DIRECTA, GRUPO
  participantes: ConversacionParticipante[];
  ultimoMensaje?: Mensaje;
  createdAt: Date;
  updatedAt: Date;
}

export class Mensaje {
  id: string;
  conversacionId: string;
  remitenteId: string;
  contenido: string;
  tipo: TipoMensaje; // TEXTO, IMAGEN, ARCHIVO
  archivoUrl?: string;
  leido: boolean;
  createdAt: Date;

  // Relaciones
  remitente: Usuario;
}

enum TipoConversacion {
  DIRECTA = 'DIRECTA',
  GRUPO = 'GRUPO',
}

enum TipoMensaje {
  TEXTO = 'TEXTO',
  IMAGEN = 'IMAGEN',
  ARCHIVO = 'ARCHIVO',
}
```

**WebSocket para Chat en Tiempo Real**:

```typescript
// apps/api/src/modules/mensajes/gateways/mensajes.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class MensajesGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('enviar_mensaje')
  async handleEnviarMensaje(
    @MessageBody() data: { conversacionId: string; contenido: string },
    @ConnectedSocket() client: Socket
  ) {
    const userId = client.data.userId;

    // Guardar mensaje en DB
    const mensaje = await this.mensajesService.crear({
      conversacionId: data.conversacionId,
      remitenteId: userId,
      contenido: data.contenido,
    });

    // Emitir a todos los participantes de la conversación
    const conversacion = await this.mensajesService.obtenerConversacion(
      data.conversacionId
    );

    conversacion.participantes.forEach((p) => {
      this.server.to(`user:${p.usuarioId}`).emit('nuevo_mensaje', mensaje);
    });

    return { success: true, mensaje };
  }

  @SubscribeMessage('marcar_leido')
  async handleMarcarLeido(
    @MessageBody() data: { mensajeId: string },
    @ConnectedSocket() client: Socket
  ) {
    await this.mensajesService.marcarLeido(data.mensajeId, client.data.userId);

    return { success: true };
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId;
    client.data.userId = userId;
    client.join(`user:${userId}`);

    console.log(`Usuario ${userId} conectado al chat`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Usuario ${client.data.userId} desconectado del chat`);
  }
}
```

#### Grupos de Estudio

```typescript
// apps/api/src/modules/grupos-estudio/entities/grupo-estudio.entity.ts
export class GrupoEstudio {
  id: string;
  nombre: string;
  descripcion: string;
  cursoId?: string; // Opcional: puede estar asociado a un curso
  privado: boolean;
  codigoInvitacion?: string; // Para grupos privados
  maximoMiembros: number;
  creadorId: string;
  miembros: MiembroGrupoEstudio[];
  sesiones: SesionGrupoEstudio[]; // Sesiones de estudio programadas
  createdAt: Date;
}

export class MiembroGrupoEstudio {
  id: string;
  grupoEstudioId: string;
  usuarioId: string;
  rol: RolMiembroGrupo; // ADMIN, MODERADOR, MIEMBRO
  fechaUnion: Date;

  // Relaciones
  usuario: Usuario;
}

export class SesionGrupoEstudio {
  id: string;
  grupoEstudioId: string;
  titulo: string;
  descripcion?: string;
  fechaInicio: Date;
  duracionMinutos: number;
  enlaceVideoconferencia?: string; // Jitsi, Zoom, etc.
  createdBy: string;
}

enum RolMiembroGrupo {
  ADMIN = 'ADMIN',
  MODERADOR = 'MODERADOR',
  MIEMBRO = 'MIEMBRO',
}
```

#### Sistema de Notificaciones

```typescript
// apps/api/src/modules/notificaciones/entities/notificacion.entity.ts
export class Notificacion {
  id: string;
  usuarioId: string;
  tipo: TipoNotificacion;
  titulo: string;
  contenido: string;
  leida: boolean;
  enlace?: string; // Link a la página relevante
  metadata?: any; // Data adicional en JSON
  createdAt: Date;
}

enum TipoNotificacion {
  NUEVA_RESPUESTA_FORO = 'NUEVA_RESPUESTA_FORO',
  MENSAJE_DIRECTO = 'MENSAJE_DIRECTO',
  SOLUCION_MARCADA = 'SOLUCION_MARCADA',
  NUEVO_COMUNICADO = 'NUEVO_COMUNICADO',
  INVITACION_GRUPO_ESTUDIO = 'INVITACION_GRUPO_ESTUDIO',
  SESION_ESTUDIO_PROGRAMADA = 'SESION_ESTUDIO_PROGRAMADA',
}

// Service
@Injectable()
export class NotificacionesService {
  async crear(dto: CreateNotificacionDto) {
    const notificacion = await this.prisma.notificacion.create({
      data: dto,
    });

    // Enviar vía WebSocket si el usuario está conectado
    this.notificacionesGateway.enviarNotificacion(dto.usuarioId, notificacion);

    // Opcional: enviar email si es urgente
    if (dto.urgente) {
      await this.emailService.enviarNotificacion(notificacion);
    }

    return notificacion;
  }

  async marcarTodasLeidas(usuarioId: string) {
    return this.prisma.notificacion.updateMany({
      where: { usuarioId, leida: false },
      data: { leida: true },
    });
  }
}
```

**WebSocket para Notificaciones**:

```typescript
// apps/api/src/modules/notificaciones/gateways/notificaciones.gateway.ts
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notificaciones',
})
export class NotificacionesGateway {
  @WebSocketServer()
  server: Server;

  enviarNotificacion(usuarioId: string, notificacion: Notificacion) {
    this.server
      .to(`user:${usuarioId}`)
      .emit('nueva_notificacion', notificacion);
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId;
    client.join(`user:${userId}`);
  }
}
```

#### Sistema de Moderación

```typescript
// apps/api/src/modules/moderacion/entities/reporte.entity.ts
export class Reporte {
  id: string;
  reportadoPor: string;
  tipoContenido: TipoContenido; // POST, RESPUESTA, MENSAJE
  contenidoId: string;
  motivo: MotivoReporte;
  descripcion?: string;
  estado: EstadoReporte;
  resueltoP or?: string;
  createdAt: Date;
  updatedAt: Date;
}

enum MotivoReporte {
  SPAM = 'SPAM',
  ACOSO = 'ACOSO',
  CONTENIDO_INAPROPIADO = 'CONTENIDO_INAPROPIADO',
  INFORMACION_INCORRECTA = 'INFORMACION_INCORRECTA',
  OTRO = 'OTRO',
}

enum EstadoReporte {
  PENDIENTE = 'PENDIENTE',
  EN_REVISION = 'EN_REVISION',
  RESUELTO = 'RESUELTO',
  RECHAZADO = 'RECHAZADO',
}

// Controller
@Controller('moderacion/reportes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModeracionController {
  @Post()
  async crearReporte(@User() user: UserPayload, @Body() dto: CreateReporteDto) {
    return this.moderacionService.crearReporte({
      ...dto,
      reportadoPor: user.id,
    });
  }

  @Get()
  @Roles('EDUCADOR', 'ADMIN')
  async listarReportes(@Query('estado') estado?: EstadoReporte) {
    return this.moderacionService.listar({ estado });
  }

  @Patch(':id/resolver')
  @Roles('EDUCADOR', 'ADMIN')
  async resolverReporte(
    @Param('id') id: string,
    @User() user: UserPayload,
    @Body() dto: ResolverReporteDto
  ) {
    return this.moderacionService.resolver(id, user.id, dto);
  }
}
```

### Entregables

- [x] Sistema de foros con threading de respuestas
- [x] Marcado de soluciones y respuestas útiles
- [x] Etiquetas y filtros en foros
- [x] Chat/mensajería directa en tiempo real
- [x] Grupos de estudio públicos y privados
- [x] Sistema de notificaciones en tiempo real
- [x] Panel de moderación para educadores
- [x] Reportes de contenido inapropiado
- [x] Estadísticas de participación en foros
- [x] Búsqueda en foros y mensajes

### Stack Tecnológico Específico

- **WebSockets**: Socket.io (mensajería y notificaciones en tiempo real)
- **Editor de texto rico**: Lexical o TipTap (para posts y respuestas)
- **Markdown**: marked o remark (para renderizar contenido)
- **Sintaxis highlighting**: Prism o highlight.js (para código en foros)
- **Detección de spam**: Akismet o custom ML model
- **Moderación de contenido**: @tensorflow-models/toxicity (opcional)

### Criterios de Éxito

- ✅ Foro soporta 1000+ posts sin degradación de performance
- ✅ Mensajes entregados en tiempo real (< 100ms latency)
- ✅ Notificaciones lleguen en < 1 segundo
- ✅ Búsqueda en foros retorna resultados en < 500ms
- ✅ Sistema de moderación procesa reportes en < 24 horas
- ✅ 80%+ de preguntas reciben respuesta en < 48 horas
- ✅ WebSocket connections soportan 500+ usuarios concurrentes

### Consideraciones de Implementación

**Prioridad 1 (Core)**:

- Foros básicos con posts y respuestas
- Marcado de soluciones
- Notificaciones básicas
- Chat directo 1:1

**Prioridad 2 (Importante)**:

- Threading de respuestas (respuestas a respuestas)
- Grupos de estudio
- WebSocket para tiempo real
- Sistema de reportes básico

**Prioridad 3 (Futuro)**:

- Moderación automática con ML
- Videoconferencia integrada para grupos de estudio
- Gamificación (puntos por respuestas útiles, badges)
- Trending topics en foros
- Menciones de usuarios (@usuario)
- Reacciones con emojis
- Encuestas en foros

### Seguridad y Moderación

**Prevención de spam**:

```typescript
// Rate limiting para posts y mensajes
@Throttle(5, 60) // Max 5 posts por minuto
@Post()
async crearPost(@Body() dto: CreatePostDto) {
  // ...
}

// Detección de contenido duplicado
async verificarDuplicado(contenido: string, usuarioId: string) {
  const hash = crypto.createHash('md5').update(contenido).digest('hex');

  const duplicado = await this.prisma.post.findFirst({
    where: {
      autorId: usuarioId,
      contenidoHash: hash,
      createdAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000), // Última hora
      },
    },
  });

  if (duplicado) {
    throw new Error('Contenido duplicado detectado');
  }
}
```

**Sanitización de contenido**:

```typescript
import sanitizeHtml from 'sanitize-html';

function sanitizarContenidoForo(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'code',
      'pre',
      'a',
      'ul',
      'ol',
      'li',
    ],
    allowedAttributes: {
      a: ['href', 'title'],
      code: ['class'], // Para syntax highlighting
    },
    allowedSchemes: ['http', 'https'],
  });
}
```

---

## Fase 6: Búsqueda y Recomendaciones

**Duración estimada**: 4-5 semanas
**Sprint 18-20**

### Objetivos

Mejorar descubrimiento de contenido.

### Funcionalidades

- Búsqueda full-text avanzada
- Filtros (categoría, nivel, duración, idioma)
- Sistema de recomendaciones basado en historial
- Tags y etiquetas
- Cursos relacionados

### Tecnología

- PostgreSQL Full-Text Search
- Algoritmo de recomendación básico
- Elasticsearch (opcional, futuro)

---

## Fase 7: Multimedia y Contenido Rico

**Duración estimada**: 4-6 semanas
**Sprint 21-23**

### Objetivos

Expandir tipos de contenido soportados.

### Funcionalidades

- Upload y streaming de video optimizado
- Editor de texto rico (Markdown/WYSIWYG)
- Contenido interactivo (H5P)
- Infografías y presentaciones
- Podcasts/audio
- Live streaming (futuro)

### Tecnología

- Transcodificación de video
- CDN para multimedia
- H5P o similar para interactivos

---

## Fase 8: Internacionalización

**Duración estimada**: 3-4 semanas
**Sprint 24-25**

### Objetivos

Soporte multi-idioma completo.

### Funcionalidades

- Interfaz en español, inglés
- Soporte para idiomas originarios (quechua, aymara, guaraní)
- Sistema de traducciones colaborativas
- Contenido multi-idioma

### Tecnología

- next-intl o react-i18next
- Base de datos de traducciones
- Herramientas de colaboración (Crowdin)

---

## Fase 9: Analytics y Reportes Avanzados

**Duración estimada**: 4-5 semanas
**Sprint 26-28**

### Funcionalidades

- Dashboard de analytics para educadores
- Métricas de engagement
- Reportes personalizables
- Exportación de datos
- Visualizaciones avanzadas

### Tecnología

- Charts con Recharts/Chart.js
- Data warehouse opcional
- BI básico

---

## Fase 10: Optimización y Escala

**Duración estimada**: Continua

### Objetivos

- Performance optimization
- Escalabilidad horizontal
- Monitoreo y observabilidad
- Seguridad hardening
- Accesibilidad WCAG 2.1 AA

---

## Backlog Futuro (Post-MVP)

### Funcionalidades Avanzadas

- Gamificación (badges, puntos, leaderboards)
- Integración con LMS externos (Moodle, Canvas)
- API pública para integraciones
- Marketplace de cursos
- Pagos y monetización (opcional)
- Mobile apps nativas
- Videoconferencia integrada
- IA para tutoría personalizada
- Blockchain para certificados verificables

### Infraestructura

- Microservicios
- Kubernetes
- Multi-región
- GraphQL API

---

## Métricas de Progreso

### Por Fase

- Historias de usuario completadas
- Tests passed
- Bugs críticos resueltos
- Performance benchmarks

### Globales

- Cobertura de código
- Tiempo de respuesta API
- Disponibilidad (uptime)
- Usuarios activos

---

## Flexibilidad

Este roadmap es un plan vivo que se ajustará según:

- Feedback de usuarios
- Prioridades de stakeholders
- Restricciones técnicas o de recursos
- Oportunidades emergentes

## Revisión

Revisar roadmap cada 3 sprints (6 semanas) para ajustar prioridades.

---

## Dependencias Externas

- Hosting y dominio
- Servicios de email (SendGrid, AWS SES)
- Almacenamiento multimedia (AWS S3, Cloudflare R2)
- CDN (Cloudflare, AWS CloudFront)

---

**Última actualización**: 2024-12-18
**Próxima revisión**: Sprint 3
