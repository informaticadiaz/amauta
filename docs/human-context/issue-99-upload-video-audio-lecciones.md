# Issue #99 — F7-003: Upload y reproducción de video y audio para lecciones

**Qué podés hacer ahora:** Subir tus propios archivos de video o audio para lecciones de tipo VIDEO (sin depender de YouTube/Vimeo), y los estudiantes los reproducen directamente con un reproductor nativo.

---

## Como EDUCADOR, ahora podés:

### Subir un video o audio propio en una lección VIDEO

1. Entrar a **Dashboard** → seleccionar un **Curso**
2. Hacer clic en **+ Nueva lección** o editar una existente
3. Seleccionar tipo **"Video"**
4. En la sección **Video**, elegir entre dos opciones:
   - **URL externa**: pegar un link de YouTube o Vimeo (como antes)
   - **Subir archivo**: arrastrar o seleccionar un archivo de video/audio propio
5. Al subir un archivo, se muestra una barra de progreso. Al terminar, aparece un preview del video o audio
6. Hacer clic en **Crear lección** o **Guardar cambios**

### Eliminar o reemplazar el archivo subido

1. Editar la lección
2. En la sección **Video** → **Subir archivo**, hacer clic en **Eliminar archivo**
3. Subir un nuevo archivo o cambiar a **URL externa**

### Tipos y tamaños permitidos

| Tipo  | Formatos             | Tamaño máximo |
| ----- | -------------------- | ------------- |
| Video | MP4, WebM            | 500MB         |
| Audio | MP3 (mpeg), OGG, WAV | 100MB         |

---

## Como ESTUDIANTE, ahora ves:

### Reproducir video o audio subido

1. Entrar a un **Curso inscrito**
2. Seleccionar una **Lección de tipo VIDEO**
3. Si el educador subió un archivo de **video**, se muestra un reproductor `<video>` con controles (play/pause, volumen, progreso, pantalla completa)
4. Si el educador subió un archivo de **audio**, se muestra un reproductor `<audio>` con controles básicos

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo?      |
| ------------- | ------------------- |
| ESTUDIANTE    | ✅ (ver/reproducir) |
| EDUCADOR      | ✅ (subir/editar)   |
| ADMIN_ESCUELA | ✅ (subir/editar)   |
| SUPER_ADMIN   | ✅ (subir/editar)   |

---

## Usuarios de prueba para testear

| Email                   | Contraseña  | Rol        |
| ----------------------- | ----------- | ---------- |
| educador1@amauta.test   | password123 | EDUCADOR   |
| estudiante1@amauta.test | password123 | ESTUDIANTE |

---

## Notas técnicas

### Almacenamiento

Los archivos se suben a **MinIO** (storage S3-compatible, self-hosted) vía `POST /uploads/media`. El endpoint valida tipo MIME y tamaño antes de aceptar el archivo.

### Estructura de datos

El contenido de la lección almacena los datos del archivo subido junto a los campos existentes:

```json
{
  "videoUrl": "https://media.amauta.test/amauta-media/lecciones/abc123.mp4",
  "provider": "local",
  "storageKey": "lecciones/abc123.mp4",
  "mimeType": "video/mp4",
  "size": 12345678
}
```

`provider: "local"` con `mimeType` que empieza en `audio/` hace que `LeccionContent` renderice `<audio>` en lugar de `<video>`.

### Sin transcoding

En esta fase no se transcodifica el archivo subido — se reproduce tal cual el formato original (MP4, WebM, MP3, OGG, WAV).

### Librerías utilizadas

- **Storage**: `@aws-sdk/client-s3` (MinIO, `forcePathStyle: true`)
- **Upload backend**: `@fastify/multipart`
- **Upload frontend**: `MediaUploader` (drag & drop + `XMLHttpRequest` con progreso)
- **Testing**: Jest + React Testing Library (frontend), Jest (backend)
