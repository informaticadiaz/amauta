# Skill: PWA Mobile Design

> Actúa como un ingeniero senior especializado en Progressive Web Apps y diseño
> mobile-first. Analiza, diseña o implementa funcionalidades PWA orientadas a
> dispositivos móviles, con foco en offline-first, instalabilidad, performance
> en redes lentas y experiencia táctil.
>
> **Alcance**: Manifest, Service Worker (Workbox), IndexedDB (Dexie.js),
> Background Sync, Push Notifications, responsive/mobile UI (Next.js/Tailwind),
> Lighthouse PWA score.
>
> **Contexto del proyecto**: Amauta es una app educativa offline-first (Fase 2 del roadmap).
> El target principal son estudiantes con conectividad limitada en dispositivos Android/iOS.

---

## Uso

```
Ejecuta un diseño PWA mobile sobre [scope]
```

**Ejemplos:**

```
Ejecuta un diseño PWA mobile sobre la pantalla de lecciones
Ejecuta un diseño PWA mobile sobre el flujo de descarga offline
Ejecuta un diseño PWA mobile sobre el manifest y los íconos
Ejecuta un diseño PWA mobile completo del proyecto
Ejecuta un diseño PWA mobile sobre el service worker
```

---

## Parámetros

| Parámetro | Descripción                                                                          | Ejemplo                     |
| --------- | ------------------------------------------------------------------------------------ | --------------------------- |
| `scope`   | Qué diseñar/analizar: pantalla, flujo, capa técnica (sw/manifest/sync), o "completo" | `flujo de descarga offline` |

---

## Proceso (Ejecutar en Orden)

### PASO 1 — Delimitar el Scope

Determinar qué archivos leer y qué aspectos analizar según el scope:

| Scope indicado         | Archivos a analizar / implementar                                   |
| ---------------------- | ------------------------------------------------------------------- |
| Manifest / íconos      | `apps/web/public/manifest.json` + `apps/web/next.config.*`          |
| Service Worker         | `apps/web/src/service-worker.ts` + config de next-pwa               |
| IndexedDB / offline DB | `apps/web/src/lib/db/offline-db.ts` + stores relacionadas           |
| Background Sync        | `apps/web/src/lib/sync/` + service worker sync handlers             |
| Pantalla/componente UI | `apps/web/src/app/[ruta]/**/*.tsx` + componentes usados             |
| Flujo completo offline | Todo lo anterior: Manifest → SW → IndexedDB → Sync → UI             |
| Completo del proyecto  | Audit de todo: instalabilidad, offline, sync, UI mobile, Lighthouse |

Antes de comenzar:

- Leer `docs/project-management/roadmap.md` sección "Fase 2" para entender los objetivos
- Leer `apps/web/public/manifest.json` si existe
- Leer `apps/web/next.config.*` para ver config actual de PWA
- Si hay componentes: leer `docs/ai-context/frontend/components.md`

---

### PASO 2 — Análisis de Instalabilidad PWA

Verificar los requisitos mínimos para que la app sea instalable:

#### 2.1 Web App Manifest

El `manifest.json` debe tener obligatoriamente:

```json
{
  "name": "Amauta - Plataforma Educativa",
  "short_name": "Amauta",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
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
  ]
}
```

**Verificar:**

- [ ] `display: "standalone"` — elimina la barra del browser al instalar
- [ ] Ícono 192x192 con `purpose: "maskable any"` — obligatorio para Android
- [ ] Ícono 512x512 — obligatorio para splash screen
- [ ] `start_url` apunta a la pantalla principal de la app
- [ ] `lang: "es"` para Amauta (app en español)
- [ ] `orientation: "portrait-primary"` — educación se usa en portrait

**Íconos maskable**: El área segura es el 80% central del ícono. El logo
debe caber sin que las esquinas del círculo de Android lo corten.

#### 2.2 Vinculación del Manifest en Next.js

```typescript
// apps/web/src/app/layout.tsx
export const metadata = {
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Amauta',
  },
  formatDetection: { telephone: false },
};
```

#### 2.3 HTTPS

La app debe servirse sobre HTTPS. En producción (Dokploy) ya está cubierto.
En desarrollo, usar `localhost` (los navegadores lo tratan como contexto seguro).

---

### PASO 3 — Análisis del Service Worker

#### 3.1 Configuración con next-pwa

```typescript
// apps/web/next.config.ts
import withPWA from '@ducanh2912/next-pwa';

const pwaConfig = withPWA({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
});

export default pwaConfig({
  /* next config */
});
```

**Verificar:**

- [ ] SW desactivado en development (evita bugs de caché durante dev)
- [ ] `dest: 'public'` — genera SW en carpeta pública
- [ ] `reloadOnOnline: true` — recarga automática al recuperar conexión

#### 3.2 Estrategias de Caché Recomendadas

| Recurso              | Estrategia             | Razón                                         |
| -------------------- | ---------------------- | --------------------------------------------- |
| Assets estáticos     | `CacheFirst`           | No cambian entre deployments (CSS, JS, fonts) |
| API autenticada      | `NetworkFirst`         | Datos del usuario deben estar frescos         |
| API pública (cursos) | `StaleWhileRevalidate` | Balance entre velocidad y frescura            |
| Imágenes de cursos   | `CacheFirst` (30 días) | Imágenes no cambian frecuentemente            |
| Videos descargados   | `CacheFirst` (60 días) | Contenido offline explícitamente descargado   |

#### 3.3 Manejo del Estado Offline en UI

```typescript
// apps/web/src/hooks/useNetworkStatus.ts
'use client';

import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}
```

**Banner de estado offline** (colocar en layout principal):

```tsx
// apps/web/src/components/OfflineBanner.tsx
'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white
                    text-sm text-center py-2 px-4 flex items-center justify-center gap-2"
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>Sin conexión — usando contenido descargado</span>
    </div>
  );
}
```

---

### PASO 4 — Análisis de Almacenamiento Offline (IndexedDB)

#### 4.1 Schema de Dexie.js

Para Amauta, el schema mínimo para offline-first:

```typescript
// apps/web/src/lib/db/offline-db.ts
import Dexie, { type Table } from 'dexie';

export interface CursoOffline {
  id: string;
  titulo: string;
  descripcion: string;
  slug: string;
  imagenUrl?: string;
  fechaDescarga: Date;
  tamañoBytes: number;
}

export interface LeccionOffline {
  id: string;
  cursoId: string;
  titulo: string;
  contenido: string; // HTML para lecciones de texto
  tipo: 'VIDEO' | 'TEXTO';
  videoUrl?: string;
  videoBlobKey?: string; // Key en Cache API para video descargado
  orden: number;
}

export interface ProgresoOffline {
  leccionId: string;
  cursoId: string;
  completada: boolean;
  timestamp: Date;
  sincronizado: boolean;
}

export interface SyncPendiente {
  id?: number; // autoincrement
  tipo: 'completar-leccion' | 'inscribir' | 'cancelar-inscripcion';
  payload: string; // JSON serializado
  timestamp: Date;
  intentos: number;
}

export class OfflineDB extends Dexie {
  cursos!: Table<CursoOffline>;
  lecciones!: Table<LeccionOffline>;
  progreso!: Table<ProgresoOffline>;
  syncPendiente!: Table<SyncPendiente>;

  constructor() {
    super('AmautaOfflineDB');
    this.version(1).stores({
      cursos: 'id, fechaDescarga',
      lecciones: 'id, cursoId, orden',
      progreso: 'leccionId, cursoId, sincronizado',
      syncPendiente: '++id, tipo, timestamp',
    });
  }
}

export const db = new OfflineDB();
```

**Verificar:**

- [ ] Índices en campos usados en queries (cursoId, sincronizado)
- [ ] `++id` para tablas con autoincrement
- [ ] Videos grandes → usar Cache API (no IndexedDB) para blobs

#### 4.2 Videos: Cache API en lugar de IndexedDB

Los videos no deben guardarse en IndexedDB (límite de tamaño y performance).
Usar la Cache API del Service Worker directamente:

```typescript
// apps/web/src/lib/db/video-cache.ts
const VIDEO_CACHE = 'amauta-videos-v1';

export async function cacheVideo(
  leccionId: string,
  videoUrl: string
): Promise<void> {
  const cache = await caches.open(VIDEO_CACHE);
  const cacheKey = `/offline/video/${leccionId}`;

  const response = await fetch(videoUrl);
  await cache.put(cacheKey, response);
}

export async function getVideoOfflineUrl(
  leccionId: string
): Promise<string | null> {
  const cache = await caches.open(VIDEO_CACHE);
  const response = await cache.match(`/offline/video/${leccionId}`);

  if (!response) return null;

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function deleteVideoCache(leccionId: string): Promise<void> {
  const cache = await caches.open(VIDEO_CACHE);
  await cache.delete(`/offline/video/${leccionId}`);
}
```

---

### PASO 5 — Análisis de Sincronización

#### 5.1 Background Sync

```typescript
// apps/web/src/lib/sync/sync-manager.ts
export async function encolarSync(
  tipo: SyncPendiente['tipo'],
  payload: object
): Promise<void> {
  // Guardar en cola local
  await db.syncPendiente.add({
    tipo,
    payload: JSON.stringify(payload),
    timestamp: new Date(),
    intentos: 0,
  });

  // Registrar Background Sync si disponible
  if (
    'serviceWorker' in navigator &&
    'sync' in ServiceWorkerRegistration.prototype
  ) {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register('amauta-sync');
  } else {
    // Fallback: intentar sincronizar ahora si hay conexión
    if (navigator.onLine) {
      await procesarColaSinc();
    }
  }
}

export async function procesarColaSinc(): Promise<void> {
  const pendientes = await db.syncPendiente.orderBy('timestamp').toArray();

  for (const item of pendientes) {
    try {
      await ejecutarSync(item);
      await db.syncPendiente.delete(item.id!);
    } catch (error) {
      await db.syncPendiente.update(item.id!, {
        intentos: item.intentos + 1,
      });
      // Dejar de intentar después de 5 fallos
      if (item.intentos >= 4) {
        await db.syncPendiente.delete(item.id!);
      }
    }
  }
}
```

#### 5.2 Resolución de Conflictos (Last-Write-Wins)

```typescript
// apps/web/src/lib/sync/conflict-resolution.ts
export async function resolveProgresoConflict(
  local: ProgresoOffline,
  remote: { completada: boolean; timestamp: string }
): Promise<ProgresoOffline> {
  const remoteDate = new Date(remote.timestamp);

  // Regla: siempre preferir "completada = true" (el progreso no retrocede)
  if (local.completada || remote.completada) {
    return { ...local, completada: true };
  }

  // Si ninguno está completado, gana el más reciente
  return local.timestamp > remoteDate
    ? local
    : { ...local, completada: remote.completada };
}
```

---

### PASO 6 — Análisis de UI Mobile-First

#### 6.1 Touch Targets

Los elementos táctiles deben tener mínimo **44x44px** (iOS) / **48x48dp** (Android):

```tsx
// ❌ Target muy pequeño
<button className="p-1 text-sm">Completar</button>

// ✅ Target adecuado para móvil
<button className="p-3 min-h-[44px] min-w-[44px] text-sm">Completar</button>
```

**Verificar en componentes de lecciones:**

- [ ] Botón "Completar lección" → mínimo 44px de alto
- [ ] Items del sidebar de lecciones → mínimo 44px de alto
- [ ] Botones anterior/siguiente → mínimo 44px
- [ ] Botón de descarga → mínimo 44px

#### 6.2 Tipografía Legible en Mobile

```tsx
// Tamaños mínimos de fuente para mobile
// ❌ Muy pequeño para leer en móvil
<p className="text-xs">Descripción del curso</p>

// ✅ Legible en pantallas pequeñas
<p className="text-sm sm:text-base">Descripción del curso</p>
```

**Regla**: Nunca usar `text-xs` para contenido principal en mobile.
`text-xs` solo para metadatos secundarios (fechas, contadores).

#### 6.3 Espaciado y Densidad

En mobile, el contenido necesita más espacio vertical entre elementos:

```tsx
// ❌ Lista demasiado densa en mobile
<ul className="space-y-1">

// ✅ Espaciado cómodo para touch
<ul className="space-y-3 sm:space-y-2">
```

#### 6.4 Bottom Navigation vs Sidebar

En mobile (< 768px), la navegación debe estar en la parte inferior, no en sidebar lateral:

```tsx
// Estructura recomendada para Amauta en mobile:
// - Sidebar colapsable (ya implementado como MobileSidebarSheet)
// - Bottom nav para secciones principales si se añade en Fase 2
// - FAB (Floating Action Button) para acciones primarias

// Ejemplo de FAB para "Descargar curso":
<button
  className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full
             bg-blue-600 text-white shadow-lg flex items-center justify-center
             active:scale-95 transition-transform"
  aria-label="Descargar curso para offline"
>
  <Download className="h-6 w-6" />
</button>
```

#### 6.5 Evitar Hover-only Interactions

En mobile no hay hover. Toda funcionalidad debe ser accesible sin hover:

```tsx
// ❌ Solo visible en hover (no funciona en mobile)
<div className="group">
  <button className="opacity-0 group-hover:opacity-100">Editar</button>
</div>

// ✅ Siempre visible o accesible por tap
<div className="flex items-center justify-between">
  <span>{titulo}</span>
  <button className="text-gray-500">Editar</button>
</div>
```

#### 6.6 Formularios en Mobile

```tsx
// Atributos importantes para teclado mobile:
<input
  type="email"
  inputMode="email"        // Muestra teclado de email en iOS/Android
  autoComplete="email"     // Sugiere emails guardados
  autoCapitalize="none"    // No capitaliza automáticamente emails
/>

<input
  type="search"
  inputMode="search"
  enterKeyHint="search"    // Muestra "Buscar" en lugar de "Enter" en el teclado
/>

// Evitar zoom automático en iOS (font-size mínimo 16px en inputs):
<input className="text-base" />  // 16px evita el zoom en iOS
```

#### 6.7 Safe Area Insets (Notch / Home Indicator)

Para iPhones con notch y Android con gesture navigation:

```css
/* apps/web/src/app/globals.css */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-top {
  padding-top: env(safe-area-inset-top);
}
```

```tsx
// En el layout principal:
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t
                pb-[env(safe-area-inset-bottom)]">
```

#### 6.8 Scroll y Overflow

```tsx
// ❌ Scroll horizontal en mobile = UX pésima
<div className="flex gap-4">

// ✅ Scroll horizontal controlado con snap
<div className="flex gap-4 overflow-x-auto snap-x snap-mandatory
                scrollbar-hide pb-2">
  <div className="snap-start shrink-0 w-64">...</div>
</div>

// ✅ O wrapping en mobile
<div className="flex flex-wrap gap-4">
```

---

### PASO 7 — Análisis de Performance en Mobile

Mobile tiene CPU/RAM limitados y redes lentas (3G/4G). Prioridades:

#### 7.1 Lazy Loading de Imágenes

```tsx
// ❌ Carga todas las imágenes al abrir la página
<img src={imagenUrl} />

// ✅ Solo carga cuando entra al viewport
<Image
  src={imagenUrl}
  width={400}
  height={225}
  alt={titulo}
  loading="lazy"          // Para imágenes fuera del fold
  placeholder="blur"      // Blur placeholder mientras carga
  blurDataURL="data:..."  // Base64 tiny image
/>
```

#### 7.2 Skeleton Screens en lugar de Spinners

En redes lentas, los skeleton screens dan mejor percepción de velocidad:

```tsx
// apps/web/src/components/ui/SkeletonCursoCard.tsx
export function SkeletonCursoCard() {
  return (
    <div className="animate-pulse rounded-lg border bg-white p-4 space-y-3">
      <div className="h-40 bg-gray-200 rounded-md" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  );
}
```

#### 7.3 Optimistic UI para Acciones Offline

Las acciones del usuario deben sentirse instantáneas, incluso sin conexión:

```tsx
// Patrón para "completar lección" offline:
// 1. Actualizar UI inmediatamente (optimistic)
// 2. Guardar en IndexedDB
// 3. Encolar sync para cuando haya conexión
// 4. Si falla el sync, mostrar indicador discreto (no revertir el UI)
```

#### 7.4 Code Splitting por Ruta

Next.js hace code splitting automático por página, pero verificar que componentes
pesados usen `dynamic import`:

```typescript
// Para el visualizador de video (pesado, solo en página de lección):
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(
  () => import('@/components/leccion/VideoPlayer'),
  { loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded" /> }
);
```

---

### PASO 8 — Generar el Informe / Plan de Implementación

Si el scope es **análisis**: producir un informe con hallazgos y recomendaciones.
Si el scope es **implementación**: producir el código listo para usar.

#### Formato del Informe de Análisis

---

## 📱 Informe PWA Mobile — [Scope analizado]

**Fecha:** [fecha actual]
**Archivos analizados:** [lista]
**Lighthouse PWA score estimado:** [0-100]

---

### Resumen Ejecutivo

[2-3 oraciones: estado actual de la PWA, qué funciona, qué falta crítico]

---

### Instalabilidad

| Requisito                 | Estado   | Detalle         |
| ------------------------- | -------- | --------------- |
| Manifest.json             | ✅/❌/⚠️ | [detalle]       |
| Service Worker registrado | ✅/❌/⚠️ | [detalle]       |
| HTTPS                     | ✅       | Dokploy con SSL |
| Ícono 192x192 maskable    | ✅/❌/⚠️ | [detalle]       |
| Ícono 512x512             | ✅/❌/⚠️ | [detalle]       |

---

### Hallazgos

> Ordenados por impacto: Crítico → Alto → Medio → Bajo

#### 🔴 CRÍTICO — [Nombre del hallazgo]

**Archivo:** `ruta/al/archivo.tsx` línea X
**Impacto en mobile:** [Descripción del impacto en el usuario mobile]

**Situación actual:**

```tsx
// código problemático
```

**Por qué es un problema en mobile:**
[Explicación: teclado que tapa, target pequeño, sin feedback offline, etc.]

**Solución recomendada:**

```tsx
// código corregido
```

**Esfuerzo:** [Bajo / Medio / Alto]

---

#### 🟠 ALTO — [Nombre del hallazgo]

[mismo formato]

---

### Plan de Implementación PWA (si aplica)

Ordenado por dependencias técnicas:

1. **Manifest + íconos** → Prerequisito para instalabilidad
2. **Service Worker básico** → Cache assets estáticos
3. **Hook `useNetworkStatus`** → UI aware del estado de conexión
4. **Banner offline** → Feedback visual al usuario
5. **IndexedDB schema** → Base para almacenamiento local
6. **Flujo de descarga** → Descargar curso/lecciones
7. **Cola de sync** → Encolar acciones offline
8. **Background Sync** → Sincronizar al reconectar

---

### Checklist Lighthouse PWA

- [ ] Manifest válido con todos los campos requeridos
- [ ] Service Worker instalado y activo
- [ ] Funciona offline (al menos muestra página de fallback)
- [ ] Íconos 192x192 y 512x512 presentes
- [ ] `start_url` responde offline
- [ ] `theme-color` meta tag presente
- [ ] `viewport` meta tag con `width=device-width`
- [ ] HTTPS en producción

---

### Lo que está bien ✅

[Lista de aspectos PWA/mobile ya correctamente implementados]

---

## Notas para el Análisis

- **Prioridad del proyecto**: Offline-first para estudiantes con conectividad limitada
- **Target primario**: Android con Chrome. iOS tiene restricciones adicionales (no Background Sync, SW limitado)
- **iOS consideraciones**: `apple-mobile-web-app-capable`, `apple-touch-icon`, no hay Background Sync nativo
- **No sobreoptimizar**: Un SW básico con caché de assets ya mejora enormemente la experiencia
- **Dexie.js vs raw IndexedDB**: Siempre usar Dexie.js — la API raw de IndexedDB es innecesariamente compleja
- **Videos**: No guardar blobs de video en IndexedDB — usar Cache API
- **Testing offline**: Chrome DevTools → Network → "Offline" para simular sin conexión
- **Lighthouse PWA**: Chrome DevTools → Lighthouse → "Progressive Web App" category

## Recursos del Proyecto

- Roadmap Fase 2: `docs/project-management/roadmap.md` → sección "Fase 2: Offline-First & PWA"
- Patrones frontend: `docs/ai-context/frontend/components.md`
- Stack definido: Workbox 7+, Dexie.js, @ducanh2912/next-pwa
