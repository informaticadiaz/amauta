# Skill: Performance Review

> Actúa como un ingeniero senior especializado en performance. Analiza el código
> del proyecto en busca de problemas de rendimiento y genera un informe estructurado
> con hallazgos priorizados y recomendaciones concretas.
>
> **Alcance**: Backend (NestJS/Prisma), Frontend (Next.js/React), Base de datos (PostgreSQL).

---

## Uso

```
Ejecuta un análisis de performance sobre [scope]
```

**Ejemplos:**

```
Ejecuta un análisis de performance sobre el módulo de cursos
Ejecuta un análisis de performance sobre el frontend de mis-cursos
Ejecuta un análisis de performance sobre las queries Prisma del proyecto
Ejecuta un análisis de performance completo del proyecto
```

---

## Parámetros

| Parámetro | Descripción                                                            | Ejemplo                         |
| --------- | ---------------------------------------------------------------------- | ------------------------------- |
| `scope`   | Qué analizar: módulo, página, capa (backend/frontend/db), o "completo" | `módulo de inscripciones`       |

---

## Proceso de Análisis (Ejecutar en Orden)

### PASO 1 — Delimitar el Scope

Determinar qué archivos analizar según el scope indicado:

| Scope indicado         | Archivos a analizar                                                              |
| ---------------------- | -------------------------------------------------------------------------------- |
| Módulo backend         | `apps/api/src/[modulo]/**/*.ts` (service, controller, module)                    |
| Página frontend        | `apps/web/src/app/[ruta]/**/*.tsx` + componentes usados                          |
| Capa de base de datos  | `apps/api/src/**/*.service.ts` + `apps/api/prisma/schema.prisma`                 |
| Completo               | Todo lo anterior en orden: DB → Backend → Frontend                               |

Antes de analizar:
- Leer `apps/api/prisma/schema.prisma` para entender índices y relaciones
- Leer `docs/ai-context/_patterns.md` para conocer los patrones del proyecto
- Si hay módulo específico: leer `docs/ai-context/modules/[modulo].md`

---

### PASO 2 — Análisis de Base de Datos (siempre primero)

Leer todas las queries Prisma en los archivos del scope. Para cada query, evaluar:

#### 2.1 Problema N+1

Buscar patrones donde se hacen consultas dentro de loops:

```typescript
// ❌ PROBLEMA N+1: Una query por elemento
const cursos = await prisma.curso.findMany();
for (const curso of cursos) {
  curso.lecciones = await prisma.leccion.findMany({ where: { cursoId: curso.id } });
}

// ✅ CORRECTO: Una sola query con include
const cursos = await prisma.curso.findMany({
  include: { lecciones: true },
});
```

**Señales de N+1**: `.findMany()` o `.findUnique()` dentro de un `.map()`, `for`, `forEach`, o `Promise.all()` con ids variables.

#### 2.2 Select sin límite

Buscar `findMany()` sin `take` en colecciones potencialmente grandes:

```typescript
// ❌ Sin límite - puede retornar miles de filas
await prisma.curso.findMany({ where: { estado: 'PUBLICADO' } });

// ✅ Con paginación
await prisma.curso.findMany({
  where: { estado: 'PUBLICADO' },
  take: limit,
  skip: (page - 1) * limit,
});
```

#### 2.3 Select de campos innecesarios

Buscar queries que traen toda la entidad cuando solo se necesitan algunos campos:

```typescript
// ❌ Trae todos los campos incluyendo campos pesados
const cursos = await prisma.curso.findMany({ include: { lecciones: true } });
// Solo se usa: curso.id, curso.titulo

// ✅ Select específico
const cursos = await prisma.curso.findMany({
  select: { id: true, titulo: true },
});
```

#### 2.4 Índices faltantes en el schema

Revisar `schema.prisma`. Verificar que los campos usados frecuentemente en `where` tienen `@index` o `@@index`:

```prisma
// Campos que DEBEN tener índice si se usan en WHERE:
// - Estado (estado, estadoCurso, estadoInscripcion)
// - Foreign keys (cursoId, usuarioId, leccionId)
// - Campos de búsqueda (slug, email)
// - Fechas de ordenamiento (createdAt, updatedAt)
```

#### 2.5 Conteos ineficientes

```typescript
// ❌ Trae todos los registros para contar
const lecciones = await prisma.leccion.findMany({ where: { cursoId } });
const total = lecciones.length;

// ✅ Query de conteo directo
const total = await prisma.leccion.count({ where: { cursoId } });
```

---

### PASO 3 — Análisis de Backend (NestJS)

#### 3.1 Caché ausente en endpoints de lectura frecuente

Identificar endpoints GET que:
- No tienen caché (`@CacheInterceptor`, Redis)
- Son llamados frecuentemente (catálogo, detalle de curso, listas públicas)
- Retornan datos que no cambian con frecuencia

```typescript
// Candidatos obvios para caché:
// GET /cursos (catálogo público)
// GET /cursos/:slug (detalle de curso)
// GET /categorias
```

#### 3.2 Operaciones síncronas bloqueantes

Buscar código CPU-intensivo en el hilo principal:
- Ordenamientos y filtros en memoria sobre arrays grandes (debería ser en DB)
- Transformaciones de datos complejas sin streams
- Cálculos matemáticos pesados sin workers

#### 3.3 Await innecesariamente secuencial

```typescript
// ❌ Secuencial cuando son independientes
const curso = await prisma.curso.findUnique({ where: { id } });
const lecciones = await prisma.leccion.findMany({ where: { cursoId: id } });

// ✅ Paralelo
const [curso, lecciones] = await Promise.all([
  prisma.curso.findUnique({ where: { id } }),
  prisma.leccion.findMany({ where: { cursoId: id } }),
]);
```

#### 3.4 Respuestas sin compresión

Verificar que el servidor usa compresión (gzip/brotli) para respuestas grandes.
En NestJS con Fastify: buscar `@fastify/compress` en las dependencias.

#### 3.5 Validación redundante

Buscar validaciones repetidas en controller y service para el mismo dato.

---

### PASO 4 — Análisis de Frontend (Next.js / React)

#### 4.1 Rerenders innecesarios

Buscar componentes que se re-renderizan sin necesidad:
- Funciones creadas inline en JSX sin `useCallback`
- Objetos creados inline como props sin `useMemo`
- Componentes que no usan `memo` pero reciben props estables

```typescript
// ❌ Nueva función en cada render
<Button onClick={() => handleClick(id)} />

// ✅ Memoizada
const handleClick = useCallback(() => doSomething(id), [id]);
<Button onClick={handleClick} />
```

#### 4.2 Fetching en cascada (request waterfall)

Buscar en Server Components o useEffect donde el resultado de un fetch
condiciona el inicio de otro fetch:

```typescript
// ❌ Waterfall: espera curso para pedir lecciones
const curso = await fetchCurso(slug);
const lecciones = await fetchLecciones(curso.id);

// ✅ Paralelo si el id es conocido por otra vía, o combinar en un endpoint
const [curso, lecciones] = await Promise.all([fetchCurso(slug), fetchLecciones(slug)]);
```

#### 4.3 Imágenes sin optimizar

Buscar uso de `<img>` nativo en lugar de `<Image>` de Next.js:
```typescript
// ❌
<img src={curso.imagen} />

// ✅ Con lazy loading, optimización automática y tamaños
<Image src={curso.imagen} width={400} height={225} alt={curso.titulo} />
```

#### 4.4 Datos duplicados en cliente

Buscar patrones donde el mismo dato se fetcha tanto en Server Component como en
Client Component hijo. El dato debería pasarse como prop.

#### 4.5 Bundle innecesariamente grande

Identificar imports que traen librerías pesadas cuando se podría importar
solo la parte necesaria:

```typescript
// ❌ Importa toda la librería
import _ from 'lodash';
_.groupBy(data, 'key');

// ✅ Solo la función necesaria
import groupBy from 'lodash/groupBy';
```

#### 4.6 Ausencia de loading states y Suspense

Buscar páginas o secciones que no tienen `loading.tsx` ni `<Suspense>` alrededor
de componentes que hacen fetch. Sin esto, el usuario espera sin feedback visual.

#### 4.7 useEffect con dependencias mal configuradas

Buscar `useEffect` con array de dependencias vacío `[]` que debería tener
dependencias, o sin array (se ejecuta en cada render):

```typescript
// ❌ Se ejecuta en cada render (falta array de deps)
useEffect(() => { fetchData(cursoId); });

// ❌ Nunca se actualiza cuando cambia cursoId (deps vacías pero usa cursoId)
useEffect(() => { fetchData(cursoId); }, []);

// ✅
useEffect(() => { fetchData(cursoId); }, [cursoId]);
```

---

### PASO 5 — Generar el Informe

Producir el informe en este formato exacto:

---

## 📊 Informe de Performance — [Scope analizado]

**Fecha:** [fecha actual]
**Archivos analizados:** [lista]
**Severidad total:** [🔴 CRÍTICO / 🟡 MODERADO / 🟢 LEVE] ← la más alta encontrada

---

### Resumen Ejecutivo

[2-3 oraciones describiendo el estado general de performance y los problemas principales]

---

### Hallazgos

> Ordenados por impacto: Crítico → Alto → Medio → Bajo

#### 🔴 CRÍTICO — [Nombre del problema]

**Archivo:** `ruta/al/archivo.ts` línea X
**Impacto:** [Descripción del impacto en el usuario: latencia, memoria, CPU, etc.]

**Código actual:**
```typescript
// código problemático con contexto suficiente
```

**Por qué es un problema:**
[Explicación técnica concisa — qué ocurre internamente, a qué escala empeora]

**Solución recomendada:**
```typescript
// código corregido
```

**Esfuerzo estimado:** [Bajo / Medio / Alto]
**Prioridad:** Resolver antes de siguiente release

---

#### 🟠 ALTO — [Nombre del problema]

[mismo formato]

---

#### 🟡 MEDIO — [Nombre del problema]

[mismo formato]

---

#### 🔵 BAJO — [Nombre del problema]

[mismo formato]

---

### Métricas Proyectadas

| Mejora                    | Estado actual (estimado) | Después de correcciones | Ganancia         |
| ------------------------- | ------------------------ | ----------------------- | ---------------- |
| Queries por request       | N                        | M                       | -X%              |
| Tiempo de respuesta avg   | Xms                      | Yms                     | -Z%              |
| Re-renders por interacción | N                        | M                        | -X%             |

> **Nota**: Las métricas son estimaciones basadas en análisis estático.
> Para métricas reales usar: `EXPLAIN ANALYZE` en PostgreSQL, React DevTools Profiler,
> Chrome DevTools Performance tab.

---

### Plan de Acción Sugerido

Ordenado por ratio impacto/esfuerzo (lo más valioso primero):

1. **[Corrección 1]** — Impacto: Alto / Esfuerzo: Bajo → Hacer primero
2. **[Corrección 2]** — Impacto: Alto / Esfuerzo: Medio → Segunda prioridad
3. **[Corrección 3]** — Impacto: Medio / Esfuerzo: Bajo → Fácil de resolver
4. **[Corrección N]** — Impacto: Bajo / Esfuerzo: Alto → Evaluar si vale la pena

---

### Lo que está bien ✅

[Lista de patrones correctos encontrados — reconocer lo que funciona bien]

---

### Herramientas para Medición Real

- **DB**: `EXPLAIN ANALYZE` en psql o Prisma Studio → consultas lentas
- **API**: Logs de Fastify con tiempos de respuesta por endpoint
- **Frontend**: Lighthouse en Chrome → Core Web Vitals (LCP, CLS, FID)
- **React**: React DevTools Profiler → componentes que re-renderizan de más
- **Bundle**: `next build` + `@next/bundle-analyzer` → tamaño de chunks

---

## Niveles de Severidad

| Nivel        | Símbolo | Criterio                                                                         |
| ------------ | ------- | -------------------------------------------------------------------------------- |
| **Crítico**  | 🔴      | Degrada performance O(n) o peor con datos reales — impacta a todos los usuarios  |
| **Alto**     | 🟠      | Latencia perceptible o renders innecesarios — impacta experiencia notablemente   |
| **Medio**    | 🟡      | Ineficiencia que escala mal o desperdicia recursos — visible bajo carga           |
| **Bajo**     | 🔵      | Mejora de calidad / buenas prácticas — impacto menor, pero vale la pena resolver |

## Notas para el Análisis

- **Análisis estático**: Este proceso identifica problemas visibles en el código.
  No reemplaza profiling con datos reales de producción.
- **Contexto es clave**: Un problema N+1 con 10 registros es irrelevante;
  con 10.000 es crítico. Considerar el volumen de datos esperado.
- **No sobreoptimizar**: No reportar como problema algo que no tiene datos suficientes
  para ser un cuello de botella real. Priorizar lo que importa.
- **Prisma**: Verificar siempre el schema antes de sugerir índices —
  algunos ya pueden existir como `@@index` en el schema.
- **Next.js**: Distinguir entre Server Components y Client Components.
  El análisis de re-renders aplica solo a Client Components.
