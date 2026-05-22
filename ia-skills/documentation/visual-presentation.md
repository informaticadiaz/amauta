# Skill: Visual Presentation

> Genera HTML interactivo single-page que sintetiza markdown en mapa visual con navegación, diagramas animados, tabs, árboles de decisión, timelines y mini-quizzes.
> **Referencia viva**: `docs/automata/capacitacion/agentic-loops/presentacion.html`
> es la primera implementación de esta skill y el ejemplo canónico.

---

## Uso

```
Generá una presentación visual de [carpeta]
```

**Ejemplos:**

```
Generá una presentación visual de docs/automata/capacitacion/agentic-loops
Generá un mapa visual del módulo de evaluaciones
Convertí docs/sistema/modulos/cursos en una presentación HTML interactiva
Creá una presentación de docs/ai-context/database
```

---

## Parámetros

| Parámetro    | Descripción                                                       | Ejemplo                                     |
| ------------ | ----------------------------------------------------------------- | ------------------------------------------- |
| `carpeta`    | Ruta de la carpeta con los `.md` fuente                           | `docs/automata/capacitacion/agentic-loops`  |
| `nombre`     | (Opcional) nombre del archivo HTML. Default: `presentacion.html`  | `mapa.html`                                 |
| `tema_color` | (Opcional) paleta. Default: `dark-neon` (violeta/cian sobre azul) | `dark-neon`, `light-academic`, `cyber-mint` |
| `audiencia`  | (Opcional) para quién es la presentación                          | `equipo técnico`, `cliente`, `nuevos devs`  |

---

## Cuándo usar esta skill

✅ **Buen caso de uso**:

- Una carpeta con 5+ documentos markdown que cuentan una idea grande (capacitación,
  arquitectura, decisiones de diseño, runbook complejo).
- El lector se beneficia de ver la estructura completa antes de leer linealmente.
- Hay conceptos que se entienden mejor con diagramas, tablas comparativas o flujos.

❌ **Mal caso de uso**:

- Documentos de referencia que se leen on-demand (no presentación, sino búsqueda).
- Material que cambia muy seguido — el HTML se desincroniza de los `.md`.
- Un solo archivo corto: la presentación agrega ceremonia sin valor.

---

## Proceso (Ejecutar en Orden)

### PASO 0 — Inventario del contenido fuente

Antes de diseñar, leer **todo** el material que va a presentarse.

```bash
find [carpeta] -name "*.md" -type f
```

Para cada archivo, identificar:

- Qué pregunta responde (intro, concepto, paso a paso, caso de uso, advertencia)
- Qué elementos visuales contiene (diagramas ASCII, tablas, listas comparativas, código)
- Qué subtemas o secciones tiene

**Criterio de salida del PASO 0**: tenés en la cabeza el mapa completo del corpus.

---

### PASO 1 — Decidir la narrativa de la presentación

La presentación **no es un índice** de los archivos — es una **reescritura visual**
del conocimiento. Antes de codear, definir 5-9 secciones que el lector recorre en
orden de **escalada conceptual**:

```
Intro         → qué problema resuelve esto
Concepto base → la idea central en una página
Componentes   → 2-4 piezas críticas con cards
Patrón clave  → tabla / comparación / diagrama
Errores       → anti-patrones lado a lado con buenas prácticas
Fases         → timeline si hay implementación incremental
Caso concreto → cómo se aplica en este proyecto
Quiz          → 2-4 preguntas para fijar conceptos
```

No copiar el orden de los archivos del PASO 0. Reorganizar para el lector.

**Criterio de salida del PASO 1**: lista de secciones con un título por cada una.

---

### PASO 2 — Decidir qué componente visual usa cada sección

Cada sección debe tener **un componente visual dominante**. No texto plano. Catálogo
de componentes disponibles (ver implementación de referencia):

| Componente            | Cuándo usarlo                                                           |
| --------------------- | ----------------------------------------------------------------------- |
| **Hero con stats**    | Sección de portada con métricas del contenido (X módulos, Y guardrails) |
| **Cards en grilla**   | 2-4 conceptos del mismo nivel (componentes, principios, tipos)          |
| **Comparación 2 col** | "Buen caso vs mal caso", "Prompt pobre vs rico", anti-patrones          |
| **Tabla persist**     | Listas tipo "qué sí / qué no", comparativas de 2-3 columnas             |
| **Diagrama animado**  | Flujos de proceso secuenciales con resaltado cíclico                    |
| **Tabs**              | Variantes de la misma cosa (Linux/Windows, Antes/Después)               |
| **Árbol de decisión** | Lógica condicional con nodos go/stop                                    |
| **Timeline vertical** | Fases / etapas / pasos con badges de estado                             |
| **Bloques de código** | Cuando el código ES el contenido. Usar coloreado manual con spans.      |
| **Callouts**          | Notas críticas, advertencias, validaciones empíricas                    |
| **Quiz interactivo**  | Final de la presentación, 2-4 preguntas con feedback                    |

**Criterio de salida del PASO 2**: cada sección tiene asignado su componente visual.

---

### PASO 3 — Generar el HTML

Crear el archivo en `[carpeta]/[nombre]` (default: `presentacion.html`).

**Estructura obligatoria**:

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>[Tema] — Mapa Visual</title>
    <style>
      /* CSS embebido completo */
    </style>
  </head>
  <body>
    <div id="progress"></div>
    <!-- Scroll progress bar -->
    <nav class="top">...</nav>
    <!-- Nav sticky con links a secciones -->
    <main>
      <section id="intro" class="hero">...</section>
      <section id="..." class="reveal">...</section>
      <!-- 5-9 secciones más -->
      <section id="quiz" class="reveal">...</section>
    </main>
    <footer>...</footer>
    <script>
      /* JS embebido completo */
    </script>
  </body>
</html>
```

**Requisitos no negociables**:

1. **Single-file**: todo CSS y JS embebido. Sin `<link>` ni `<script src>` externos.
2. **Funciona offline**: abrir con `xdg-open` sin servidor debe funcionar perfecto.
3. **Responsive**: usar `grid-template-columns: repeat(auto-fit, minmax(...))` y
   media queries en compare/tables.
4. **Accesible al teclado**: links de nav navegables con Tab, quiz clickeable.
5. **Variables CSS** para la paleta — fácil de re-tematizar:

```css
:root {
  --bg: #0a0e1a;
  --panel: #161d33;
  --text: #e6ecff;
  --muted: #8a96b8;
  --accent: #7c5cff;
  --accent-2: #00d4ff;
  --good: #2ee6a6;
  --warn: #ffb454;
  --danger: #ff5c7a;
  --border: #243056;
  --radius: 14px;
}
```

6. **JS mínimo y vanilla**: scroll progress, active nav link, tabs, intersection
   observer para reveal, animación de diagramas, quiz feedback. **Sin frameworks**.
7. **Sin emojis decorativos** salvo iconos puntuales de UI (📥 ⏰ 🐙 📄 📜).

---

### PASO 4 — Componentes específicos (copiar de la referencia)

La implementación canónica está en
`docs/automata/capacitacion/agentic-loops/presentacion.html`. Para cada componente
necesario, copiar el bloque CSS + HTML correspondiente y adaptar el contenido.

**Componentes a portar literalmente** (no reinventar):

- `#progress` bar fija arriba con scroll-driven width
- `nav.top` sticky con `backdrop-filter: blur(12px)` y `.brand .dot` pulsante
- `h2 .num` — badge numérico con gradiente
- `.card` con hover translateY(-3px)
- `.compare` con `.no` (rojo) y `.yes` (verde)
- `.diagram-wrap` + `.session-flow` con animación setInterval
- `.tabs` + `.tab-panel` con `data-tabs` / `data-tab` / `data-panel`
- `.timeline` con `::before` línea vertical y `.phase::before` puntos
- `.tree` con `.node.decision`, `.node.stop`, `.node.go`
- `table.persist` con header oscuro
- `.guard` con `border-left: 3px solid var(--accent)`
- `.quiz` con `data-correct="true|false"` en `.option`
- `.callout` y `.callout.info`
- `.reveal` con IntersectionObserver

---

### PASO 5 — Verificar antes de entregar

```bash
# 1. El archivo existe y se generó completo
ls -la [carpeta]/[nombre]
wc -l [carpeta]/[nombre]   # típicamente 800-1500 líneas

# 2. Es HTML válido (open en navegador, sin errores en consola)
xdg-open [carpeta]/[nombre]

# 3. Self-check de contenido:
grep -c '<section' [carpeta]/[nombre]   # ≥ 5 secciones
grep -c 'class="reveal"' [carpeta]/[nombre]   # animaciones presentes
grep -c '<a href="#' [carpeta]/[nombre]   # nav con anchors
```

**Checklist de calidad**:

- [ ] Cada sección del PASO 1 está presente y numerada
- [ ] Cada sección tiene su componente visual del PASO 2
- [ ] Nav sticky con todas las secciones linkeadas
- [ ] Scroll progress bar funciona
- [ ] Al menos un diagrama animado o árbol de decisión
- [ ] Al menos una tabla comparativa
- [ ] Quiz final con feedback (mínimo 2 preguntas)
- [ ] Callouts para advertencias o validaciones empíricas
- [ ] Footer con link al material fuente (README.md)
- [ ] Sin recursos externos (verificar con `grep -E 'src=|href=' [archivo]`)
- [ ] Funciona abierto con `file://` (sin servidor)

---

## Errores comunes a evitar

❌ **Copiar el contenido de los `.md` literal**: la presentación es una reescritura
condensada. Si una sección tiene 3 párrafos, en HTML son 3 viñetas o una card.

❌ **Demasiado texto sin componente visual**: si una sección no tiene tabla,
diagrama, cards o tabs, no es presentación — es un blog post. Reformular.

❌ **Más de 9 secciones**: el lector se pierde. Si el material lo requiere, partir
en dos presentaciones (`parte-1.html`, `parte-2.html`).

❌ **CSS sin variables**: dificulta re-tematizar. Usar `var(--accent)` siempre.

❌ **Dependencias CDN** (Tailwind via CDN, fuentes de Google Fonts, etc.): rompe el
modo offline. Sistema de tipografía: stack nativo
(`-apple-system, BlinkMacSystemFont, "Segoe UI", ...`).

❌ **Emojis decorativos en cada heading**: pierde aire profesional. Reservar emojis
para iconos puntuales dentro de cards o callouts.

❌ **Frameworks JS**: no agregar React, Vue, Alpine. Vanilla JS alcanza para todo
lo que necesita una presentación de este tipo.

---

## Cuando el material fuente cambia

La presentación HTML es **derivada** del markdown — no es la fuente de verdad.
Cuando el material fuente cambia:

1. Si el cambio es menor (texto, números) → editar el HTML directamente
2. Si el cambio es estructural (nuevas secciones, reorganización) → regenerar
   completo ejecutando esta skill de nuevo

Para evitar drift permanente, dejar al final del `<footer>` la fecha de generación
y el commit del material fuente:

```html
<footer>
  Material basado en <a href="README.md">[carpeta]</a>
  · Generado 2026-05-18 sobre commit a71d792
</footer>
```

---

## Salida esperada

Al ejecutar esta skill, el resultado es:

1. Un único archivo HTML en `[carpeta]/[nombre]` (default `presentacion.html`)
2. Sin modificar ningún `.md` fuente
3. Sin crear archivos adicionales (no CSS aparte, no JS aparte, no imágenes)
4. El archivo abre correctamente con `xdg-open` y muestra el mapa completo

El archivo debe poder commiteorse y servirse como GitHub Pages sin ningún paso
extra de build.
