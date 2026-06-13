# Módulo: Uploads

> Sistema de subida de archivos (imágenes, video y audio).

---

## Descripción Funcional

Permite a educadores subir imágenes para portadas de cursos (almacenadas localmente en el servidor) y archivos de video/audio para lecciones de tipo `VIDEO` (almacenados en MinIO, S3-compatible).

### Roles y Permisos

| Acción               | ESTUDIANTE | EDUCADOR | ADMIN_ESCUELA | SUPER_ADMIN |
| -------------------- | ---------- | -------- | ------------- | ----------- |
| Subir imagen         | -          | Sí       | Sí            | Sí          |
| Subir video/audio    | -          | Sí       | Sí            | Sí          |
| Eliminar video/audio | -          | Sí       | Sí            | Sí          |
| Ver imagen           | Público    | Público  | Público       | Público     |
| Ver/reproducir media | Público    | Público  | Público       | Público     |

---

## Archivos del Módulo

### Backend

| Archivo                                         | Propósito                               |
| ----------------------------------------------- | --------------------------------------- |
| `apps/api/src/uploads/uploads.module.ts`        | Módulo NestJS                           |
| `apps/api/src/uploads/uploads.controller.ts`    | Endpoints de upload                     |
| `apps/api/src/uploads/uploads.service.ts`       | Lógica de guardado de imágenes          |
| `apps/api/src/uploads/media-uploads.service.ts` | Lógica de subida de video/audio a MinIO |
| `apps/api/src/config/env.ts`                    | Variables de entorno (incluye MinIO)    |

### Frontend

| Archivo                                               | Propósito                           |
| ----------------------------------------------------- | ----------------------------------- |
| `apps/web/src/app/api/upload/route.ts`                | Proxy de upload de imágenes         |
| `apps/web/src/app/api/image/[...path]/route.ts`       | Proxy de imágenes                   |
| `apps/web/src/app/api/uploads/media/route.ts`         | Proxy de upload/delete de media     |
| `apps/web/src/components/cursos/ImageUploader.tsx`    | Componente de subida de imágenes    |
| `apps/web/src/components/lecciones/MediaUploader.tsx` | Componente de subida de video/audio |

---

## Endpoints API

| Método | Ruta             | Auth | Roles     | Descripción               |
| ------ | ---------------- | ---- | --------- | ------------------------- |
| POST   | `/uploads`       | Sí   | EDUCADOR+ | Subir imagen              |
| POST   | `/uploads/media` | Sí   | EDUCADOR+ | Subir video/audio (MinIO) |
| DELETE | `/uploads/media` | Sí   | EDUCADOR+ | Eliminar video/audio      |

> Nota: las rutas `uploads/(.*)` están excluidas del prefijo global `api/v1` (ver `main.ts`).

### Request - `/uploads`

- **Content-Type**: `multipart/form-data`
- **Campo**: `file` (archivo binario)

### Response - `/uploads`

```json
{
  "url": "/uploads/cursos/abc123.jpg",
  "filename": "abc123.jpg",
  "originalName": "mi-imagen.jpg",
  "size": 245678,
  "mimeType": "image/jpeg"
}
```

### Request - `/uploads/media`

- **Content-Type**: `multipart/form-data`
- **Campo**: `file` (archivo binario)
- **Tipos permitidos**: `video/mp4`, `video/webm`, `audio/mpeg`, `audio/ogg`, `audio/wav`
- **Tamaño máximo**: 500MB (video), 100MB (audio)

### Response - `/uploads/media`

```json
{
  "url": "https://media.amauta.test/amauta-media/lecciones/abc123.mp4",
  "storageKey": "lecciones/abc123.mp4",
  "mimeType": "video/mp4",
  "size": 12345678
}
```

### Request - `DELETE /uploads/media`

```json
{ "storageKey": "lecciones/abc123.mp4" }
```

---

## Variables de Entorno MinIO

```bash
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=amauta-media
MINIO_PUBLIC_URL=http://localhost:9000
```

`MediaUploadsService` usa `@aws-sdk/client-s3` con `forcePathStyle: true` para compatibilidad con MinIO.

---

## Configuración de Fastify

```typescript
// apps/api/src/main.ts
import fastifyMultipart from '@fastify/multipart';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });
}
```

---

## Ejemplos de Código

### Controller

```typescript
import { Controller, Post, Req, BadRequestException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { UploadsService, UploadResult } from './uploads.service';
import { Roles } from '../common/decorators';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async upload(@Req() request: FastifyRequest): Promise<UploadResult> {
    const data = await request.file();

    if (!data) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    return this.uploadsService.saveFile(data);
  }
}
```

### Service

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { MultipartFile } from '@fastify/multipart';

export interface UploadResult {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
}

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const UPLOAD_DIR = join(process.cwd(), 'uploads', 'cursos');

@Injectable()
export class UploadsService {
  constructor() {
    // Crear directorio si no existe
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  async saveFile(file: MultipartFile): Promise<UploadResult> {
    // Validar tipo MIME
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de archivo no permitido. Use JPG, PNG, WEBP o GIF'
      );
    }

    // Generar nombre único
    const ext = file.filename.split('.').pop() || 'jpg';
    const filename = `${randomUUID()}.${ext}`;
    const filepath = join(UPLOAD_DIR, filename);

    // Guardar archivo
    const buffer = await file.toBuffer();
    const writeStream = createWriteStream(filepath);
    writeStream.write(buffer);
    writeStream.end();

    return {
      url: `/uploads/cursos/${filename}`,
      filename,
      originalName: file.filename,
      size: buffer.length,
      mimeType: file.mimetype,
    };
  }
}
```

### Componente ImageUploader

```typescript
'use client';

import { useState, useCallback } from 'react';

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export function ImageUploader({ value, onChange, disabled }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(async (file: File) => {
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al subir imagen');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  return (
    <div>
      {value && (
        <img src={value} alt="Preview" className="w-full max-w-xs rounded" />
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={disabled || uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      {uploading && <span>Subiendo...</span>}
      {error && <span className="text-red-500">{error}</span>}
    </div>
  );
}
```

### Proxy de Imágenes (Frontend)

```typescript
// apps/web/src/app/api/image/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const imagePath = path.join('/');

  const response = await fetch(`${API_URL}/uploads/${imagePath}`);

  if (!response.ok) {
    return new NextResponse('Not found', { status: 404 });
  }

  const blob = await response.blob();
  return new NextResponse(blob, {
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}
```

---

## Estructura de Archivos en Servidor

```
apps/api/
└── uploads/
    └── cursos/
        ├── abc123.jpg
        ├── def456.png
        └── ...
```

---

## Servir Archivos Estáticos

```typescript
// apps/api/src/main.ts
import { join } from 'path';

async function bootstrap() {
  // ...

  // Servir uploads como archivos estáticos
  app.useStaticAssets({
    root: join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
  });
}
```

---

## Dependencias

### Módulos que dependen de este

- **Cursos**: Imagen de portada
- **Lecciones**: Video/audio de tipo VIDEO (F7-003)

---

## Notas para IA

1. **Fastify Multipart**: Usar `@fastify/multipart` no multer
2. **Validación MIME**: Solo permitir tipos de imagen (uploads) o video/mp4, video/webm, audio/mpeg, audio/ogg, audio/wav (uploads/media)
3. **Nombres únicos**: Usar `crypto.randomUUID()` para evitar colisiones (NO usar el paquete `uuid`, es ESM-only y rompe bajo `@swc/jest`)
4. **Límite de tamaño**: 5MB por defecto (imágenes), 500MB video / 100MB audio (media)
5. **Proxy de imágenes/media**: El frontend proxea imágenes y media para evitar CORS
6. **Cache**: Las imágenes se cachean 1 año (inmutables por UUID)
7. **MinIO**: `media-uploads.service.ts` usa `@aws-sdk/client-s3` con `forcePathStyle: true`. En specs que importan `../config/env` (directa o transitivamente), mockear con `jest.mock('../config/env', ...)` para evitar `process.exit(1)` por validación de env
