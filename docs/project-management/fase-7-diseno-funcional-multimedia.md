# Diseño Funcional — Fase 7: Multimedia y Contenido Rico

**Fecha**: 2026-05-07
**Issues relacionados**: F7-001 (este documento), F7-002, F7-003, F7-004
**Fuente de verdad para**: selección de librerías, storage provider, estructura de datos, estrategia H5P

---

## Resumen de Decisiones

| Tema                               | Decisión                       | Justificación                                               |
| ---------------------------------- | ------------------------------ | ----------------------------------------------------------- |
| Editor WYSIWYG                     | **TipTap**                     | Mejor DX en React, MIT, extensible, mantenimiento activo    |
| Formato de almacenamiento de texto | **HTML**                       | TipTap lo genera nativamente; más fácil de renderizar       |
| Storage video/audio                | **MinIO (self-hosted en VPS)** | Sin dependencias externas, S3-compatible, gratuito          |
| Transcodificación                  | **No en Fase 7**               | Archivos servidos directamente; HLS se evalúa en Fase 8     |
| Player video                       | **HTML5 nativo + estilos**     | Suficiente para MVP; sin dependencias extra                 |
| Player audio                       | **HTML5 nativo + estilos**     | Suficiente para MVP                                         |
| Audio en schema                    | **Tipo VIDEO** (por mimeType)  | No requiere migración; se diferencia por `mimeType`         |
| H5P                                | **Embed externo via iframe**   | Sin self-hosting; el educador provee la URL de H5P.org/Lumi |
| Migración de schema                | **NO requerida**               | `contenido Json` ya existe y es suficientemente flexible    |

---

## 1. Editor de Texto Rico para Lecciones TEXTO (F7-002)

### Decisión: TipTap

**Librería**: [`@tiptap/react`](https://tiptap.dev/) + `@tiptap/starter-kit`

**Justificación frente a alternativas**:

- **TipTap vs Quill**: Quill usa el formato Delta propietario, menor mantenimiento activo, peor integración con React moderno.
- **TipTap vs react-md-editor**: react-md-editor es solo Markdown; TipTap es WYSIWYG real, extensible a tablas, imágenes, colaboración futura.

**Formato de almacenamiento**: HTML (string en `contenido.html`)

- TipTap exporta HTML nativamente con `editor.getHTML()`
- El render en el cliente usa `dangerouslySetInnerHTML` protegido por DOMPurify

### Estructura del campo `contenido` para TEXTO

```typescript
// TipoLeccion.TEXTO
interface ContenidoTexto {
  html: string;     // HTML generado por TipTap, sanitizado con DOMPurify antes de guardar
  format: "html";   // Para identificar el tipo en el futuro
}

// Ejemplo:
{
  "html": "<h2>Introducción</h2><p>Bienvenidos al curso...</p>",
  "format": "html"
}
```

### Toolbar mínima

| Elemento          | Comportamiento |
| ----------------- | -------------- |
| Negrita           | `Ctrl+B`       |
| Cursiva           | `Ctrl+I`       |
| Encabezado H2/H3  | Dropdown       |
| Lista con viñetas | Botón          |
| Lista numerada    | Botón          |
| Bloque de código  | Botón          |
| Enlace            | Insertar URL   |

### Flujo del educador

1. Entrar a crear/editar lección → seleccionar tipo "TEXTO"
2. El campo de contenido muestra el editor TipTap con toolbar
3. Al guardar: `editor.getHTML()` → sanitizar con DOMPurify → enviar en `contenido.html`
4. API guarda `contenido` como JSON via el campo `contenido Json` de Prisma

### Flujo del estudiante

1. Ver lección de tipo TEXTO
2. El frontend lee `leccion.contenido.html`
3. Renderizar con `dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}`
4. Aplicar clases de tipografía (Tailwind prose o similar)

### Sanitización XSS

**Obligatorio**: usar [`dompurify`](https://github.com/cure53/DOMPurify) en el frontend antes de renderizar.

```typescript
import DOMPurify from 'dompurify';

const safeHtml = DOMPurify.sanitize(leccion.contenido.html, {
  ALLOWED_TAGS: [
    'h2',
    'h3',
    'p',
    'strong',
    'em',
    'ul',
    'ol',
    'li',
    'code',
    'pre',
    'a',
    'blockquote',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
});
```

### Cambios de backend para F7-002

**Ninguno nuevo.** El PATCH de lecciones ya acepta `contenido` como campo JSON.
Verificar en el service que no hay validación que rechace el formato `{html, format}`.

---

## 2. Upload y Reproducción de Video y Audio (F7-003)

### Decisión: MinIO (self-hosted en VPS)

**Provider**: [MinIO](https://min.io/) — servidor de object storage S3-compatible, deployado como contenedor Docker en el mismo VPS via Dokploy.

**Constraint del proyecto**: no se usan servicios de terceros. Todo corre en el VPS propio.

**Justificación**:

- API 100% S3-compatible: el backend usa `@aws-sdk/client-s3` apuntando al endpoint de MinIO. Si en el futuro se migra a otro provider S3-compatible, solo cambia la configuración.
- Gratuito y open source — sin costos de egress ni suscripciones.
- Deployado en Dokploy como servicio Docker adicional, mismo VPS.
- Archivos servidos directamente desde MinIO vía URL pública (bucket con política de lectura pública).

**Deployment en Dokploy**:

- Imagen: `minio/minio:latest`
- Puerto interno API: `9000`
- Puerto interno consola: `9001`
- Exponer vía Nginx reverse proxy: `https://media.amauta.diazignacio.ar` (o subpath)
- Comando: `server /data --console-address ":9001"`

### Alcance de Fase 7 (sin transcodificación)

El video se sube como MP4/WebM y se sirve directamente desde MinIO. No hay HLS, no hay thumbnails automáticos. El navegador lo reproduce nativamente con `<video>`.

**Transcodificación HLS**: se evalúa en Fase 8 si la experiencia de reproducción lo requiere.

### Tipo de lección para audio

**Decisión**: Audio usa el mismo tipo `VIDEO` del enum. Se diferencia por el campo `mimeType` en `contenido`. El frontend renderiza `<video>` o `<audio>` según el mimeType.

**Justificación**: No se agrega `AUDIO` al enum `TipoLeccion` para evitar migración de schema. La distinción vive en los datos, no en el schema.

### Estructura del campo `contenido` para VIDEO/audio

```typescript
// TipoLeccion.VIDEO (video o audio)
interface ContenidoMedia {
  url: string;          // URL pública de R2 (HTTPS)
  storageKey: string;   // Clave en el bucket R2 (para eliminar o reemplazar)
  mimeType: string;     // "video/mp4" | "video/webm" | "audio/mpeg" | "audio/ogg"
  size: number;         // Tamaño en bytes
  duration?: number;    // Duración en segundos (opcional, el educador puede ingresarla manualmente)
}

// Ejemplo video:
{
  "url": "https://pub-xxxxx.r2.dev/lecciones/abc123.mp4",
  "storageKey": "lecciones/abc123.mp4",
  "mimeType": "video/mp4",
  "size": 52428800,
  "duration": 360
}

// Ejemplo audio:
{
  "url": "https://pub-xxxxx.r2.dev/lecciones/audio-abc123.mp3",
  "storageKey": "lecciones/audio-abc123.mp3",
  "mimeType": "audio/mpeg",
  "size": 8388608,
  "duration": 1800
}
```

### Límites de archivo

| Tipo  | Límite | Formatos aceptados |
| ----- | ------ | ------------------ |
| Video | 500 MB | MP4, WebM          |
| Audio | 100 MB | MP3, OGG, WAV      |

### Variables de entorno requeridas

```env
# MinIO (self-hosted en VPS)
MINIO_ENDPOINT=http://minio:9000          # URL interna Docker (API a MinIO)
MINIO_ACCESS_KEY=                          # Configurado en Dokploy
MINIO_SECRET_KEY=                          # Configurado en Dokploy
MINIO_BUCKET=amauta-media
MINIO_PUBLIC_URL=https://media.amauta.diazignacio.ar  # URL pública vía Nginx
```

> **Nota de deployment**: MinIO debe estar deployado en Dokploy ANTES de ejecutar F7-003. El bucket `amauta-media` debe crearse con política de lectura pública para que las URLs funcionen sin autenticación en el frontend.

### Nuevo endpoint de upload

```
POST /api/v1/uploads/media
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
  file: <archivo binario>

Response 201:
{
  url: string,
  storageKey: string,
  mimeType: string,
  size: number
}
```

**Roles autorizados**: EDUCADOR, ADMIN_ESCUELA, SUPER_ADMIN

### Implementación backend

- Nueva clase `MediaUploadsService` (no modificar el `UploadsService` de imágenes)
- Usa `@aws-sdk/client-s3` con `endpoint: MINIO_ENDPOINT` y `forcePathStyle: true` (requerido para MinIO)
- `PutObjectCommand` para subir, `DeleteObjectCommand` para eliminar
- Validación de MIME type antes de subir
- URL pública construida con `MINIO_PUBLIC_URL + "/" + MINIO_BUCKET + "/" + storageKey`

### Flujo del educador

1. Crear/editar lección → seleccionar tipo "VIDEO"
2. Mostrar componente de upload con drag & drop
3. Upload en el cliente: `POST /uploads/media` con el archivo
4. Recibir `{ url, storageKey, mimeType, size }` y mostrar preview
5. Al guardar la lección: incluir `contenido: { url, storageKey, mimeType, size, duration? }`

### Flujo del estudiante

1. Ver lección de tipo VIDEO
2. Leer `leccion.contenido.mimeType`
3. Si `mimeType.startsWith("video/")` → renderizar `<video controls src={url} />`
4. Si `mimeType.startsWith("audio/")` → renderizar `<audio controls src={url} />`
5. Aplicar estilos responsivos

---

## 3. Contenido Interactivo H5P (F7-004)

### Estrategia: Embed desde URL externa

**Implementación**: El educador crea el contenido en H5P.org o Lumi y obtiene la URL de embed. Se guarda como string en `contenido.h5pUrl`. El frontend renderiza un `<iframe>` seguro.

**Sin self-hosting en Fase 7**: montar un servidor H5P propio requiere infraestructura dedicada y está fuera del scope de este sprint.

### Plataformas soportadas para embed

| Plataforma | URL de ejemplo                    | Gratuita     |
| ---------- | --------------------------------- | ------------ |
| H5P.org    | `https://h5p.org/h5p/embed/XXXXX` | Sí (límites) |
| Lumi       | URL de instancia Lumi             | Sí           |

### Whitelist de dominios

El backend valida que la URL provenga de dominios confiables:

```typescript
const H5P_ALLOWED_DOMAINS = ['h5p.org', 'www.h5p.org', 'lumi.education'];
```

### Estructura del campo `contenido` para INTERACTIVO

```typescript
// TipoLeccion.INTERACTIVO
interface ContenidoH5P {
  h5pUrl: string;       // URL de embed de H5P.org o Lumi
  embedType: "iframe";  // Constante para identificar el tipo
  title?: string;       // Título descriptivo opcional
}

// Ejemplo:
{
  "h5pUrl": "https://h5p.org/h5p/embed/123456",
  "embedType": "iframe",
  "title": "Quiz sobre el sistema solar"
}
```

### Atributos del iframe

```html
<iframe
  src="{h5pUrl}"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
  allow="fullscreen"
  loading="lazy"
  style="width: 100%; min-height: 400px; border: none;"
  title="{title}"
/>
```

### Fallback si el contenido no carga

Mostrar un mensaje de error con la URL para acceso directo:

```
⚠ El contenido interactivo no pudo cargarse.
Accedé directamente: [h5pUrl]
```

### Cambios de backend para F7-004

**Ninguno de estructura.** Solo agregar validación de whitelist de dominios en el PATCH de lecciones cuando `tipo === 'INTERACTIVO'`.

---

## 4. Cambios de Schema Prisma

**No se requiere migración.** El campo `contenido Json` en el modelo `Leccion` es suficientemente flexible para almacenar todos los formatos definidos arriba.

| Tipo de lección | Estructura en `contenido`                        | Migración |
| --------------- | ------------------------------------------------ | --------- |
| TEXTO           | `{ html, format }`                               | ❌ No     |
| VIDEO (video)   | `{ url, storageKey, mimeType, size, duration? }` | ❌ No     |
| VIDEO (audio)   | `{ url, storageKey, mimeType, size, duration? }` | ❌ No     |
| INTERACTIVO     | `{ h5pUrl, embedType, title? }`                  | ❌ No     |

---

## 5. Dependencias entre Issues

```
F7-001 (este documento) — FUENTE DE VERDAD
  ├── F7-002: Editor TipTap para TEXTO — sin dependencias adicionales
  ├── F7-003: Upload MinIO para VIDEO/audio — requiere MinIO deployado en Dokploy y vars de entorno configuradas
  └── F7-004: H5P iframe para INTERACTIVO — sin dependencias adicionales
```

**F7-002, F7-003 y F7-004 pueden desarrollarse en paralelo** una vez cerrado F7-001.

---

## 6. Validaciones Backend por Tipo de Lección

Al hacer PATCH de una lección, el service debe validar el `contenido` según el `tipo`:

| `tipo`      | Validación de `contenido`                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| TEXTO       | `contenido.html` es string no vacío; `contenido.format === "html"`                                           |
| VIDEO       | `contenido.url` es URL válida; `contenido.mimeType` está en lista permitida; `contenido.storageKey` presente |
| INTERACTIVO | `contenido.h5pUrl` pasa whitelist de dominios H5P                                                            |
| QUIZ        | Sin cambios (ya implementado)                                                                                |
| DESCARGABLE | Sin cambios                                                                                                  |

---

## 7. Impacto en Módulo de Lecciones Existente

El módulo `lecciones` (`apps/api/src/lecciones/`) actualmente acepta `contenido` como JSON sin validación por tipo. En F7-002, F7-003 y F7-004 se agregará validación por tipo.

No se crea un módulo nuevo. Se extiende el módulo existente con:

- Validación contextual por `TipoLeccion` en el service
- Nuevo `MediaUploadsService` en el módulo `uploads` (solo para F7-003)

---

## 8. Paquetes NPM a Instalar por Issue

### F7-002 (TipTap)

```bash
# Frontend
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link dompurify @types/dompurify -w @amauta/web
```

### F7-003 (MinIO)

```bash
# Backend
npm install @aws-sdk/client-s3 -w @amauta/api
```

### F7-004 (H5P)

```
No requiere paquetes nuevos.
```
