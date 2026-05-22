# Skill: Architecture Expert

> Analiza arquitectura del proyecto (SOLID, hexagonal, acoplamiento, responsabilidades) y propone mejoras. Delega implementación a través de SDD.
>
> **Alcance**: revisar arquitectura general, analizar acoplamiento, proponer refactorizaciones,
> planificar estrategias de modularización.
>
> **Referencia**: `CLAUDE.md`, `docs/ai-context/_patterns.md`, `docs/ai-context/modules/`.

---

## Uso

### Modo Interactivo (Recomendado)

```
Analiza la arquitectura
```

La skill propone opciones de análisis:

```
¿Qué te gustaría analizar?

1. Backend completo — NestJS + modules + services + controllers
2. Frontend completo — Next.js 14 + components + pages + hooks
3. Módulo específico — Elige un módulo (lecciones, cursos, progreso, etc.)
4. Acoplamiento entre módulos — Identifica ciclos y dependencias altas
5. Separación de capas — Verifica controller/service/repository
6. SOLID principles — Audita cada principio (S, O, L, I, D)
7. Arquitectura hexagonal — Propone refactor hacia ports & adapters
```

Tú seleccionas → Skill ejecuta análisis → Actualiza propuesta (documento único)

### Modo Directo (Si sabes qué quieres)

```
Analiza la arquitectura de [scope]
```

**Ejemplos:**

```
Analiza la arquitectura general del backend
Analiza la arquitectura frontend y propone mejoras
Propone una estrategia de modularización para lecciones
Revisa el acoplamiento entre módulos
Analiza separación de responsabilidades en el proyecto
Diseña una refactorización hacia arquitectura hexagonal
```

---

## Parámetros

### Modo Interactivo (Sin parámetros)

```
Analiza la arquitectura
```

La skill pregunta interactivamente qué analizar:

| Opción       | Descripción                                        | Archivo (Único, se Actualiza) |
| ------------ | -------------------------------------------------- | ----------------------------- |
| Backend      | Estructura NestJS completa, servicios, controllers | proposal-backend.md           |
| Frontend     | Next.js 14, componentes, páginas, hooks            | proposal-frontend.md          |
| Módulo       | Módulo específico (lecciones, cursos, etc.)        | proposal-modulo-[nombre].md   |
| Acoplamiento | Imports, ciclos, dependencias altas                | proposal-acoplamiento.md      |
| Capas        | Separación controller/service/repository           | proposal-capas.md             |
| SOLID        | Verifica S, O, L, I, D principles                  | proposal-solid.md             |
| Hexagonal    | Refactor hacia ports & adapters                    | proposal-hexagonal.md         |

### Modo Directo (Con parámetros)

| Parámetro | Descripción                                                                  | Ejemplo                  |
| --------- | ---------------------------------------------------------------------------- | ------------------------ |
| `scope`   | Qué analizar: backend completo, frontend, módulo específico, o área temática | `el módulo de lecciones` |
| `foco`    | Qué aspecto revisar (opcional): SOLID, acoplamiento, capas, modularización   | `acoplamiento`           |

---

## Patrones Críticos a Verificar

### SOLID Principles

| Principio                     | Qué Revisar                                     | Red Flag                                           |
| ----------------------------- | ----------------------------------------------- | -------------------------------------------------- |
| **S** — Single Responsibility | ¿Una clase, una razón para cambiar?             | Clase con 500+ líneas, múltiples responsabilidades |
| **O** — Open/Closed           | ¿Extensible sin modificar código existente?     | Los cambios requieren editar código establecido    |
| **L** — Liskov Substitution   | ¿Subclases son realmente intercambiables?       | Casts forzados, polimorfismo roto                  |
| **I** — Interface Segregation | ¿Interfaces específicas, no "god interfaces"?   | Interfaz con 20+ métodos sin usar                  |
| **D** — Dependency Inversion  | ¿Dependo de abstracciones, no implementaciones? | Imports directos de clases concretas               |

### Acoplamiento Entre Módulos

```typescript
// ❌ MAL: Acoplamiento directo
import { ProgresosService } from '../progresos/progresos.service';
export class LeccionesService {
  constructor(private progresosService: ProgresosService) {}
  async eliminar(id: string) {
    await this.progresosService.eliminarProgresos(id);
  }
}

// ✅ BIEN: Desacoplamiento vía eventos
export class LeccionesService {
  constructor(private eventBus: EventBus) {}
  async eliminar(id: string) {
    await this.prisma.leccion.update({
      where: { id },
      data: { estado: 'ARCHIVADO' },
    });
    this.eventBus.emit('leccion.eliminada', { id });
  }
}
```

### Separación de Capas

```typescript
// ❌ MAL: Lógica de negocio en controller
@Post()
async crear(@Body() dto: CreateDto) {
  const orden = await this.prisma.count() + 1; // ← Lógica aquí
  return this.prisma.create({ data: { ...dto, orden } });
}

// ✅ BIEN: Controller delega al service
@Post()
async crear(@Body() dto: CreateDto) {
  return this.service.crear(dto);
}

@Injectable()
export class Service {
  async crear(dto: CreateDto) {
    const orden = await this.obtenerSiguienteOrden();
    return this.prisma.create({ data: { ...dto, orden } });
  }
}
```

---

## Proceso de Análisis (Ejecutar en Orden)

### PASO 1 — Mapear Arquitectura Actual

1. Listar estructura del proyecto
2. Identificar capas (controller, service, repository, etc.)
3. Identificar módulos y dependencias entre ellos
4. Crear diagrama textual de estado actual

### PASO 2 — Auditar Contra SOLID

Para cada módulo/componente:

- ¿Tiene una sola responsabilidad?
- ¿Es cerrado para modificación, abierto para extensión?
- ¿Respeta substitución de Liskov?
- ¿Las interfaces son segregadas?
- ¿Invierte dependencias correctamente?

### PASO 3 — Analizar Acoplamiento

Contar:

- Imports entre módulos (qué módulo importa de cuáles)
- Ciclos de dependencia (A → B → A)
- Profundidad de importación (`src/modulo/service` vs `src/modulo/internal/service`)

Rojo: Un módulo importa de 5+ módulos → posible violación de SRP.

### PASO 4 — Verificar Separación de Capas

- Controller: Sólo HTTP concerns (parse params, headers, response format)
- Service: Lógica de negocio pura
- Repository: Data access layer
- DTO: Validación y transformación de datos

Rojo: Lógica de negocio en controller, queries Prisma en componentes, etc.

### PASO 5 — Generar Hallazgos

Documentar:

- Qué está bien (fortalezas)
- Qué necesita mejora (hallazgos)
- Propuesta arquitectónica concreta
- Plan de implementación por fases

### PASO 6 — Generar Propuesta Consolidada y Guardarla

1. **Consolidar análisis completo** en un archivo Markdown
2. **Guardar en carpeta exclusiva**: `docs/architecture/proposals/`
3. **Nombre del archivo**: `proposal-[scope]-[fecha].md`
4. **Contenido**: Estado actual + Hallazgos + Propuesta + Plan
5. **Resultado**: Archivo listo para delegación a `/sdd-apply` o uso manual

---

## Estructura de Carpeta para la Skill

```
docs/architecture/
├── SKILL.md                    (Este archivo — documentación)
└── proposals/                  (Documentos únicos, se actualizan)
    ├── proposal-backend.md        (se actualiza con cada análisis)
    ├── proposal-frontend.md       (se actualiza con cada análisis)
    ├── proposal-modulo-lecciones.md
    ├── proposal-acoplamiento.md
    ├── proposal-capas.md
    ├── proposal-solid.md
    └── proposal-hexagonal.md

Nota: Cada propuesta es UN documento que evoluciona en el tiempo.
```

---

## Plantilla de Propuesta Consolidada

Cada opción genera un documento específico. Guardar como: `docs/architecture/proposals/proposal-[tipo]-[fecha].md`

### Encabezado Estándar (Todas las Propuestas)

```markdown
# 🏗️ Propuesta Arquitectónica — [Tipo de Análisis]

**Fecha Análisis:** [2026-05-20]
**Última Actualización:** [2026-05-20]
**Auditor:** Architecture Expert
**Stack:** Backend: NestJS + Fastify | Frontend: Next.js 14

---

## 📊 Estado Actual

| Campo                          | Valor                                             |
| ------------------------------ | ------------------------------------------------- |
| **Estado Análisis**            | Completado                                        |
| **Estado Implementación**      | No Iniciado / Implementado Parcial / Implementado |
| **Responsable Implementación** | [nombre o "pendiente"]                            |
| **Urgencia**                   | Baja / Media / Alta / Crítica                     |

---

## 📜 Histórico de Análisis

| Fecha      | Hallazgos Clave                   | Cambios Detectados |
| ---------- | --------------------------------- | ------------------ |
| 2026-05-21 | Soft delete crítico, acoplamiento | 0 módulos nuevos   |
| 2026-05-20 | Arquitectura sólida, 21 módulos   | Inicial            |

---

## 📊 Análisis Actual

### Estructura Identificada
```

[Diagrama de carpetas y módulos]

```

### Capas del Sistema

```

[Descripción de capas: Controller → Service → Repository → Database]

```

### Módulos Principales

| Módulo | Responsabilidad | Estado |
|--------|-----------------|--------|
| [nombre] | [qué hace] | ✅/⚠️/❌ |

---

## 🔍 Hallazgos Clave

### Violaciones SOLID

| Principio | Módulo | Problema | Severidad |
|-----------|--------|----------|-----------|
| S — Single Responsibility | [módulo] | [descripción] | CRÍTICA/MEDIA/BAJA |
| O — Open/Closed | [módulo] | [descripción] | CRÍTICA/MEDIA/BAJA |
| D — Dependency Inversion | [módulo] | [descripción] | CRÍTICA/MEDIA/BAJA |

### Acoplamiento Entre Módulos

```

modulo-a → modulo-b, modulo-c, modulo-d (ALTO)
modulo-b → modulo-a (CICLO DETECTADO ⚠️)
modulo-e → modulo-f (BAJO)

```

**Análisis:**
- [Módulo] tiene 10+ imports — posible violación de SRP
- [Ciclo detectado] — A depende de B y B depende de A
- [Profundidad] — imports muy profundos (`../../../`)

### Separación de Capas

| Capa | Estado | Problemas |
|------|--------|-----------|
| Controllers | ✅/❌ | [lógica de negocio aquí / imports innecesarios] |
| Services | ✅/❌ | [acceso directo a DB / DTOs dispersos] |
| Repositories | ✅/❌ | [lógica de negocio / queries raw] |
| DTOs | ✅/❌ | [esparcidas en múltiples capas / validación débil] |

---

## ✅ Lo Que Está Bien

- [Fortaleza 1]
- [Fortaleza 2]
- [Fortaleza 3]

---

## 🏗️ Propuesta Arquitectónica

### Visión

[Descripción clara de cómo debería ser la arquitectura]

### Diagrama Propuesto

```

[Nueva estructura de carpetas/módulos]

```

### Cambios Principales

1. **Cambio 1**: [Qué, dónde, por qué]
2. **Cambio 2**: [Qué, dónde, por qué]
3. **Cambio 3**: [Qué, dónde, por qué]

### Patrones a Implementar

- [ ] [Patrón 1] — [dónde aplicar]
- [ ] [Patrón 2] — [dónde aplicar]
- [ ] [Patrón 3] — [dónde aplicar]

---

## 📋 Plan de Refactorización

### Fase 1: Preparación (Semana 1)

- [ ] Tarea 1: [descripción]
- [ ] Tarea 2: [descripción]

### Fase 2: Refactor Core (Semana 2-3)

- [ ] Tarea 1: [descripción]
- [ ] Tarea 2: [descripción]

### Fase 3: Integración (Semana 4)

- [ ] Tarea 1: [descripción]
- [ ] Tarea 2: [descripción]

---

## 🎯 Criterios de Éxito

- [ ] Todas las clases respetan Single Responsibility
- [ ] No hay ciclos de dependencia
- [ ] Controllers solo manejan HTTP concerns
- [ ] Services contienen toda la lógica de negocio
- [ ] Todos los imports respetan límites de módulos
- [ ] Tests pasan al 100%

---

## 📌 Notas Importantes

- **Patrones obligatorios**: Leer `CLAUDE.md` antes de implementar
- **Soft delete**: Cualquier cambio en eliminación debe mantener soft delete
- **Tests**: Actualizar tests junto con refactorización
- **Documentación**: Actualizar `docs/ai-context/modules/` después de cambios

---

## Próximos Pasos

1. **Revisar** esta propuesta — ¿qué ajustes hacer?
2. **Aprobar** — si está OK, pasar a `/sdd-apply`
3. **Implementar** — ejecutar plan fase por fase
4. **Verificar** — usar `/sdd-verify` para validar cambios

```

---

## Plantillas Específicas por Tipo de Análisis

Cada opción interactiva genera un documento con estructura y contenido único:

### 1️⃣ Backend Completo (`proposal-backend-[fecha].md`)

**Contenido específico:**

- Estructura NestJS (módulos, servicios, controllers)
- Dependencias entre módulos
- Violaciones SOLID en backend
- Plan de refactorización por módulo

### 2️⃣ Frontend Completo (`proposal-frontend-[fecha].md`)

**Contenido específico:**

- Estructura Next.js 14 (pages, components, hooks)
- Estado de componentes y composición
- Separación de capas (presentación/lógica)
- Plan de mejoras en componentes

### 3️⃣ Módulo Específico (`proposal-modulo-[nombre]-[fecha].md`)

**Contenido específico:**

- Análisis SOLID del módulo
- DTOs y validaciones
- Tests y cobertura
- Comparación con patrón del proyecto
- Propuesta de mejora local

### 4️⃣ Acoplamiento (`proposal-acoplamiento-[fecha].md`)

**Contenido específico:**

- Grafo de dependencias entre módulos
- Ciclos detectados (A→B→C→A)
- Módulos con alto acoplamiento (5+ imports)
- Propuesta de desacoplamiento
- Plan de inversión de dependencias

### 5️⃣ Separación de Capas (`proposal-capas-[fecha].md`)

**Contenido específico:**

- Verificación por capa (controller/service/repository)
- Lógica de negocio mal ubicada
- DTOs dispersos en múltiples capas
- Plan de reorganización
- Validación esperada por capa

### 6️⃣ SOLID Principles (`proposal-solid-[fecha].md`)

**Contenido específico:**

- Análisis detallado de cada principio (S, O, L, I, D)
- Módulos que violan cada principio
- Ejemplos de código problemático
- Refactores propuestos
- Tabla de cumplimiento por principio

### 7️⃣ Arquitectura Hexagonal (`proposal-hexagonal-[fecha].md`)

**Contenido específico:**

- Diagrama actual vs. hexagonal propuesto
- Ports & adapters necesarios
- Boundaries entre capas
- Plan de refactor a hexagonal
- Migración de dependencias

---

## Comandos Útiles

```bash
# Explorar estructura
find apps/api/src -type f -name "*.ts" | head -20

# Contar imports entre módulos
grep -r "from.*src/" apps/api/src --include="*.ts" | grep -v node_modules | sort | uniq -c | sort -rn

# Identificar acoplamiento alto (archivos con muchos imports)
grep -r "^import" apps/api/src --include="*.ts" | cut -d: -f1 | sort | uniq -c | sort -rn | head -20

# Buscar ciclos de dependencia (A → B → A)
# Requiere análisis manual o herramienta especializada

# Contar líneas por archivo (encontrar clases grandes)
find apps -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -15
```

---

## Resultado Esperado

La skill genera un **archivo Markdown consolidado** guardado en:

```
docs/architecture/proposals/proposal-[scope]-[fecha].md
```

**Contenido del archivo:**

1. **Estado actual** — Estructura, capas, módulos identificados
2. **Hallazgos** — Violaciones SOLID, acoplamiento, problemas de capas (tabla)
3. **Propuesta arquitectónica** — Cómo mejorar (diagrama + descripción)
4. **Plan de refactorización** — Qué cambiar, en qué orden, por fases
5. **Criterios de éxito** — Cómo validar que la refactorización funcionó

**Uso:**

- El archivo es **independiente y reutilizable**
- Se puede pasar a `/sdd-apply` como entrada para implementación
- Se puede compartir con el equipo para revisión
- Se mantiene en la carpeta como histórico de análisis

---

## Patrones de Proyecto — Amauta

### Backend (NestJS + Fastify)

Estructura esperada:

```
apps/api/src/
├── [modulo]/
│   ├── [modulo].controller.ts      (HTTP layer — solo routing)
│   ├── [modulo].service.ts         (Business logic)
│   ├── [modulo].module.ts          (NestJS module)
│   ├── dto/
│   │   ├── create-[modulo].dto.ts  (Zod schemas)
│   │   └── update-[modulo].dto.ts
│   └── [modulo].spec.ts            (Tests)
```

Patrones obligatorios:

- ✅ Usar `safeParse()` de Zod, NUNCA `parse()`
- ✅ Soft delete: `estado: 'ARCHIVADO'`, NUNCA `prisma.delete()`
- ✅ Authorization: @Roles guards en endpoints protegidos
- ✅ Response: `{ [modelo], message }` o `{ [modelos], total }`

### Frontend (Next.js 14)

Estructura esperada:

```
apps/web/src/
├── app/
│   ├── dashboard/     (Admin pages)
│   └── [usuario]/     (User pages)
├── components/
│   ├── [modulo]/      (Feature components)
│   └── ui/            (Primitivos reutilizables)
├── hooks/             (Custom React hooks — auth, roles, etc.)
└── lib/               (Services, utilities)
```

---

## Flujo de Trabajo de la Skill

### Flujo Interactivo (Recomendado)

```
1. Usuario invoca: "Analiza la arquitectura"
                          ↓
2. Skill propone 7 opciones de análisis
                          ↓
3. Usuario elige una opción (ej: Backend completo)
                          ↓
4. Skill verifica si proposal-backend.md existe
   - SI existe → ACTUALIZAR documento existente
   - NO existe → CREAR documento nuevo
                          ↓
5. Skill ejecuta 6 pasos de análisis
                          ↓
6. Skill ACTUALIZA archivo único
   Ubicación: docs/architecture/proposals/
   Nombre: proposal-[tipo].md  (sin fecha)

   Estructura actualizada:
   - Encabezado: Fecha última análisis, estado actual
   - Histórico: Tabla de análisis anteriores
   - Análisis Actual: Estado, hallazgos, propuesta
   - Plan: Fases para implementar
                          ↓
7. Documento listo para:
   - Revisar cambios vs análisis anterior
   - Pasar a /sdd-apply para implementación
   - Ver histórico completo
   - Ejecutar propuesta una o múltiples veces
```

### Flujo Directo (Si sabes qué quieres)

```
1. Usuario invoca: "Analiza la arquitectura de [scope]"
                          ↓
2. Skill ejecuta 6 pasos análisis directamente
                          ↓
3. Skill ACTUALIZA documento único
   (o lo crea si no existe)
                          ↓
4. Documento listo para usar
```

---

## Notas para IA

### Documento Único (IMPORTANTE)

- **NUNCA crear archivos nuevos con fecha**: Los documentos son proposal-[tipo].md sin fecha
- **SIEMPRE actualizar** documento existente si está presente
- **ACTUALIZAR encabezado**: Fecha última análisis, histórico de hallazgos
- **PRESERVAR histórico**: No borrar análisis anteriores, agregar a tabla de histórico

### Comportamiento Interactivo (IMPORTANTE)

- **Si usuario invoca SIN parámetros** (`"Analiza la arquitectura"`): Ofrecer 7 opciones de análisis interactivas y ESPERAR respuesta
- **Si usuario invoca CON scope** (`"Analiza la arquitectura de [scope]"`): Ejecutar directamente sin preguntar

### Ejecución

- **Responsabilidad principal**: Generar archivo Markdown en la carpeta `docs/architecture/proposals/`
- **No delegar directamente**: La skill NO invoca `/sdd-apply`. Genera el archivo y el usuario decide qué hacer
- **Archivo consolidado**: Toda la propuesta debe estar en UN solo archivo Markdown, no dispersa
- **Crear carpeta si no existe**: La carpeta `docs/architecture/proposals/` debe crearse automáticamente al generar el primer análisis

### Análisis

- **Buscar ciclos**: A→B, B→C, C→A es un problema de arquitectura crítico
- **Contar imports**: Un servicio con 10+ imports es sospechoso (posible violación de SRP)
- **Revisar DTOs**: Si hay DTOs esparcidos en múltiples capas, hay fuga de abstracción
- **Verificar patrones**: SIEMPRE leer `CLAUDE.md` y `docs/ai-context/_patterns.md` antes de proponer cambios
- **Soft delete es mandatorio**: Cualquier análisis que proponga cambios de eliminación debe mantener soft delete
