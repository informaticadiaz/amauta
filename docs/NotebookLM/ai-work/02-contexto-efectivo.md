# Contexto Efectivo: La Clave del Éxito con IA

> Cómo proporcionar información a la IA para obtener respuestas precisas y útiles.

---

## El Principio Fundamental

```
LA IA SOLO SABE LO QUE LE DICES

No conoce:
- Tu proyecto específico
- Tus archivos locales
- Tus preferencias
- Tu historial (entre sesiones)
- El estado actual de tu código

Tu trabajo: Proporcionar el contexto necesario
```

---

## Tipos de Contexto

### 1. Contexto de Proyecto

Información sobre tu proyecto en general:

```markdown
## Mi Proyecto

- **Stack**: Next.js 14, TypeScript, Prisma, PostgreSQL
- **Estructura**: Monorepo con Turborepo
- **Convenciones**:
  - Validación con Zod
  - Tests con Vitest
  - Commits en español
- **Estado actual**: MVP en desarrollo
```

**Cuándo incluirlo**: Al inicio de sesiones, para tareas que afectan arquitectura

### 2. Contexto de Código

El código específico relevante para tu pregunta:

```typescript
// Función actual que tiene el bug
export function calcularTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.precio, 0);
}

// Error que veo:
// TypeError: Cannot read property 'precio' of undefined
```

**Cuándo incluirlo**: Siempre que preguntes sobre código específico

### 3. Contexto de Error

Información completa del error:

```
Error: ENOENT: no such file or directory
    at Object.openSync (fs.js:498:3)
    at readFileSync (fs.js:394:35)
    at loadConfig (/app/src/config.ts:15:22)

Ocurre cuando: Ejecuto npm run build
Después de: Actualizar dependencias
```

**Cuándo incluirlo**: Para debugging y solución de problemas

### 4. Contexto de Requisitos

Lo que necesitas lograr:

```markdown
## Requisito

Necesito un endpoint que:

- Reciba un ID de usuario
- Retorne sus últimas 10 compras
- Incluya el total gastado
- Solo accesible para usuarios autenticados
- Respuesta en menos de 200ms
```

**Cuándo incluirlo**: Para tareas de implementación

### 5. Contexto de Restricciones

Limitaciones que debe respetar:

```markdown
## Restricciones

- No usar librerías externas (solo stdlib)
- Compatible con Node.js 18+
- Debe funcionar sin conexión a internet
- Máximo 100 líneas de código
- Sin breaking changes en la API pública
```

**Cuándo incluirlo**: Siempre que haya limitaciones importantes

---

## Estrategias de Carga de Contexto

### Estrategia 1: Contexto Inline

Incluir todo en el mismo mensaje:

````
Tengo este código en TypeScript:

```typescript
// archivo: src/utils/validators.ts
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
````

El problema es que acepta emails como "test@.com" que son inválidos.

Necesito que:

1. Rechace dominios que empiecen con punto
2. Requiera al menos 2 caracteres en el dominio
3. Mantenga la misma firma de función

```

**Ventajas**: Todo en un lugar, fácil de seguir
**Desventajas**: Puede ser largo para contextos grandes

### Estrategia 2: Contexto por Archivos

Pedir a la IA que lea archivos (en herramientas que lo soporten):

```

Lee los archivos:

- src/services/userService.ts
- src/types/user.ts
- prisma/schema.prisma (solo modelo User)

Luego, agrega un método para desactivar usuarios

```

**Ventajas**: Código real y actualizado
**Desventajas**: Requiere herramienta con acceso a archivos

### Estrategia 3: Contexto Incremental

Construir contexto a través de la conversación:

```

Mensaje 1: "Estoy trabajando en una API REST con Express"
Mensaje 2: "Uso TypeScript y Prisma como ORM"
Mensaje 3: "Aquí está mi modelo de Usuario: [código]"
Mensaje 4: "Ahora necesito agregar autenticación JWT"

````

**Ventajas**: Natural, permite ajustar
**Desventajas**: Contexto puede perderse en conversaciones largas

### Estrategia 4: Documentos de Contexto

Crear documentos reutilizables:

```markdown
# Contexto del Proyecto Amauta

## Stack
- Frontend: Next.js 14 (App Router)
- Backend: NestJS + Fastify
- DB: PostgreSQL + Prisma
- Auth: NextAuth.js v5

## Convenciones
- Validación: Zod (no class-validator)
- Idioma: Español en código y docs
- Commits: tipo(scope): descripción

## Estructura
apps/
  web/     # Frontend
  api/     # Backend
packages/
  shared/  # Código compartido
````

**Ventajas**: Reutilizable, consistente
**Desventajas**: Requiere mantenimiento

---

## Técnicas Avanzadas

### 1. Contexto Jerárquico

Organizar de general a específico:

```
NIVEL 1 - PROYECTO
├── Stack: Next.js, TypeScript, Prisma
├── Tipo: E-commerce
└── Estado: Producción

NIVEL 2 - MÓDULO
├── Módulo: Carrito de compras
├── Archivos: cart.service.ts, cart.controller.ts
└── Dependencias: ProductService, UserService

NIVEL 3 - TAREA
├── Función: addToCart()
├── Problema: No valida stock
└── Requisito: Verificar disponibilidad
```

### 2. Contexto Contrastivo

Mostrar lo que quieres vs lo que no quieres:

```
QUIERO:
- Código funcional y tipado
- Manejo de errores explícito
- Funciones puras cuando sea posible

NO QUIERO:
- any en TypeScript
- console.log para debugging
- Callbacks (usar async/await)
- Comentarios obvios
```

### 3. Contexto con Ejemplos

Proporcionar ejemplos del patrón deseado:

````
Así estructuramos los servicios en este proyecto:

```typescript
// Ejemplo existente: ProductService
@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryDto): Promise<PaginatedResult<Product>> {
    const result = querySchema.safeParse(query);
    if (!result.success) {
      throw new BadRequestException(result.error.issues[0]?.message);
    }
    // ... implementación
  }
}
````

Ahora crea CategoryService siguiendo el mismo patrón.

```

### 4. Contexto Negativo

Especificar qué evitar:

```

IMPORTANTE - No hacer:

- No uses lodash (usamos funciones nativas)
- No crees archivos nuevos (modifica los existentes)
- No cambies la firma de funciones públicas
- No agregues dependencias

````

---

## Contexto por Herramienta

### Claude Code (CLI)

```bash
# Cargar archivos explícitamente
"Lee src/services/user.service.ts y explícame qué hace"

# Usar el contexto del proyecto
"Basándote en CLAUDE.md, crea un nuevo endpoint"

# Combinar archivos
"Lee los archivos en src/auth/ y encuentra vulnerabilidades"
````

### Cursor

```
# Referencias con @
@src/components/Button.tsx mejora la accesibilidad

# Composer con contexto
Contexto: @docs/architecture.md @src/types/

Tarea: Implementar nuevo módulo de reportes

# Archivos abiertos
Los archivos abiertos en el editor se incluyen automáticamente
```

### ChatGPT / Claude Web

````
# Pegar código directamente
Aquí está mi código:
```[lenguaje]
[código]
````

# Describir estructura

Mi proyecto tiene esta estructura:

- src/
  - components/ (React components)
  - hooks/ (custom hooks)
  - services/ (API calls)

# Adjuntar archivos (si está disponible)

[Adjuntar archivo y describir qué es]

```

### NotebookLM

```

# Subir documentos como fuentes

1. Subir archivos .md con documentación
2. Subir código como .txt
3. Subir diagramas como imágenes

# Preguntar sobre las fuentes

"Basándote en las fuentes, ¿cómo implemento autenticación?"

# Generar resúmenes

"Resume los patrones de código en las fuentes"

```

---

## Cuánto Contexto es Suficiente

### Regla General

```

MÍNIMO NECESARIO + EJEMPLOS RELEVANTES

Demasiado poco → Respuestas genéricas
Demasiado → Confusión, información perdida
Justo → Respuestas precisas y aplicables

````

### Guía por Tipo de Tarea

| Tarea | Contexto Necesario |
|-------|-------------------|
| Pregunta conceptual | Mínimo (stack, versión) |
| Bug simple | Código + error + stack trace |
| Nueva función | Código relacionado + requisitos + ejemplos |
| Refactoring | Código actual + objetivo + restricciones |
| Arquitectura | Estructura proyecto + requisitos + limitaciones |
| Code review | Código + estándares del proyecto |

### Señales de Contexto Insuficiente

- IA pregunta muchas clarificaciones
- Respuestas muy genéricas
- Código que no sigue tus convenciones
- Sugerencias que ignoran restricciones
- Necesidad de corregir constantemente

### Señales de Contexto Excesivo

- Respuestas que ignoran parte del contexto
- IA se "confunde" con información contradictoria
- Latencia alta en respuestas
- Costo elevado (APIs de pago)

---

## Plantillas de Contexto

### Para Debugging

```markdown
## Problema
[Descripción breve del problema]

## Código Relevante
```[lenguaje]
[código]
````

## Error/Comportamiento

```
[mensaje de error o descripción del comportamiento]
```

## Ya Intenté

- [intento 1]
- [intento 2]

## Entorno

- Node: [versión]
- OS: [sistema]
- [otras dependencias relevantes]

````

### Para Nueva Funcionalidad

```markdown
## Requisito
[Qué necesito implementar]

## Contexto del Proyecto
- Stack: [tecnologías]
- Ubicación: [dónde va el código]

## Código Relacionado
```[lenguaje]
[código existente relevante]
````

## Restricciones

- [restricción 1]
- [restricción 2]

## Resultado Esperado

[Descripción o ejemplo del resultado]

````

### Para Code Review

```markdown
## Código a Revisar
```[lenguaje]
[código]
````

## Contexto

- Propósito: [qué hace este código]
- Autor: [junior/senior/externo]

## Revisar Específicamente

- [ ] Seguridad
- [ ] Performance
- [ ] Legibilidad
- [ ] Tests
- [ ] [otro aspecto]

## Estándares del Proyecto

[link o descripción de estándares]

```

---

## Referencia Rápida

### Checklist de Contexto

```

□ ¿Incluí el stack/tecnologías?
□ ¿Proporcioné el código relevante?
□ ¿Especifiqué el resultado deseado?
□ ¿Mencioné restricciones importantes?
□ ¿Incluí ejemplos si aplica?
□ ¿El contexto es suficiente pero no excesivo?

```

### Fórmula de Contexto Efectivo

```

CONTEXTO =
Tecnologías usadas

- Código relevante (no todo, solo lo necesario)
- Requisito específico
- Restricciones
- Ejemplos (opcional pero útil)

```

```
