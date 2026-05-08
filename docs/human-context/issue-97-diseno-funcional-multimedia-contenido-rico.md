# Issue #97 — F7-001: Diseño funcional de multimedia y contenido rico

**Qué podés hacer ahora:** Tenés un blueprint completo para implementar los tres tipos de contenido multimedia en Amauta — texto enriquecido, video/audio y contenido interactivo H5P.

---

## Decisiones tomadas (fuente de verdad para F7-002, F7-003, F7-004)

### Editor de texto (lecciones TEXTO)

- **Librería elegida**: TipTap (`@tiptap/react`)
- **Formato**: HTML guardado en `contenido.html`
- **Sanitización**: DOMPurify en el frontend antes de renderizar

### Video y audio (lecciones VIDEO)

- **Storage**: Cloudflare R2 (sin costos de egress, API S3-compatible)
- **Audio**: usa el mismo tipo `VIDEO`, se diferencia por `mimeType` en `contenido`
- **Transcodificación**: NO en esta fase — archivos servidos directamente desde R2
- **Límites**: video hasta 500 MB (MP4/WebM), audio hasta 100 MB (MP3/OGG/WAV)

### Contenido interactivo (lecciones INTERACTIVO)

- **Estrategia**: embed desde URL externa (H5P.org o Lumi) via iframe
- **Sin self-hosting** de H5P en esta fase
- **Dominios permitidos**: `h5p.org`, `lumi.education`

### Schema de base de datos

- **Sin migración necesaria**: el campo `contenido Json` ya existente soporta todo

---

## Quién puede usarlo

| Rol           | Crear lecciones multimedia | Ver lecciones multimedia |
| ------------- | -------------------------- | ------------------------ |
| ESTUDIANTE    | ❌                         | ✅                       |
| EDUCADOR      | ✅                         | ✅                       |
| ADMIN_ESCUELA | ✅                         | ✅                       |
| SUPER_ADMIN   | ✅                         | ✅                       |

---

## Qué viene en los próximos issues

| Issue  | Qué implementa                                        |
| ------ | ----------------------------------------------------- |
| F7-002 | Editor TipTap integrado en crear/editar lección TEXTO |
| F7-003 | Upload a Cloudflare R2 + player video/audio           |
| F7-004 | Embed H5P via iframe en lecciones INTERACTIVO         |

Los tres pueden desarrollarse en paralelo.

---

## Nota técnica

Ver el documento completo de diseño funcional en:
`docs/project-management/fase-7-diseno-funcional-multimedia.md`

Contiene: estructuras JSON exactas de `contenido` por tipo, variables de entorno de R2,
whitelist H5P, paquetes NPM a instalar por issue, y validaciones de backend.
