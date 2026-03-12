# Casos de Uso y Patrones Prácticos

> Ejemplos concretos de cómo usar IA en situaciones reales de desarrollo.

---

## Índice de Casos

| #   | Caso                                 | Categoría     |
| --- | ------------------------------------ | ------------- |
| 1   | Implementar feature desde cero       | Desarrollo    |
| 2   | Debugging de error críptico          | Debugging     |
| 3   | Refactorizar código legacy           | Refactoring   |
| 4   | Escribir tests para código existente | Testing       |
| 5   | Code review de PR                    | Review        |
| 6   | Aprender nueva librería              | Aprendizaje   |
| 7   | Migrar de una tecnología a otra      | Migración     |
| 8   | Optimizar performance                | Performance   |
| 9   | Documentar código                    | Documentación |
| 10  | Diseñar API                          | Arquitectura  |

---

## Caso 1: Implementar Feature desde Cero

### Situación

Necesitas implementar un sistema de notificaciones en tu aplicación.

### Proceso

**Paso 1: Exploración**

```
Necesito implementar un sistema de notificaciones para mi app.
Stack: Next.js 14, NestJS, PostgreSQL, Prisma.

Requisitos:
- Notificaciones en tiempo real (WebSocket o SSE)
- Persistencia en DB
- Leídas/no leídas
- Tipos: info, warning, error, success

¿Cómo estructurarías esto? Dame un plan de alto nivel.
```

**Paso 2: Diseño del Schema**

```
Basándote en el plan, diseña el schema de Prisma para las notificaciones.

Consideraciones:
- Debe escalar a miles de usuarios
- Las notificaciones viejas se pueden archivar
- Necesito queries eficientes para "no leídas"
```

**Paso 3: Implementación Backend**

```
Ahora implementa el módulo de NestJS para notificaciones.
Sigue estos patrones del proyecto:

[incluir _patterns.md o ejemplo de módulo existente]

Necesito:
- CRUD básico
- Endpoint para marcar como leídas
- WebSocket gateway para tiempo real
```

**Paso 4: Implementación Frontend**

```
Crea los componentes React para mostrar notificaciones:
- NotificationBell (icono con contador)
- NotificationList (dropdown con lista)
- NotificationItem (cada notificación)

Usa los patrones de componentes del proyecto:
[incluir ejemplo de componente existente]
```

**Paso 5: Testing**

```
Genera tests para:
1. NotificationService (unit tests)
2. NotificationController (integration tests)
3. Componentes React (component tests)

Framework: Vitest + React Testing Library
```

### Resultado

Sistema de notificaciones completo, siguiendo los patrones del proyecto.

---

## Caso 2: Debugging de Error Críptico

### Situación

Error en producción: "Cannot read properties of undefined (reading 'map')"

### Proceso

**Paso 1: Recolectar información**

````
Tengo este error en producción:

Error: Cannot read properties of undefined (reading 'map')
    at UserList (/app/.next/server/chunks/123.js:45:23)
    at renderWithHooks (/app/node_modules/react-dom/...

El componente:
```tsx
function UserList({ users }) {
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
````

Llamada:

```tsx
<UserList users={data?.users} />
```

¿Por qué falla y cómo lo arreglo?

```

**Paso 2: Análisis de la IA**
```

La IA responderá:

El problema es que `data?.users` puede ser `undefined` cuando:

1. La data aún no ha cargado
2. El API retornó un objeto sin la propiedad `users`

Soluciones:

1. Default value: users={data?.users ?? []}
2. Guard clause: if (!users) return null;
3. Optional chaining: users?.map(...)

```

**Paso 3: Verificación**
```

Tu sugerencia es usar default value.
¿Hay algún caso donde esto podría fallar?
¿Debería agregar validación adicional?

```

**Paso 4: Implementación con test**
```

Implementa la solución y genera un test que capture este caso.

Test debe verificar:

1. Render con users válidos
2. Render con users undefined
3. Render con users array vacío

```

---

## Caso 3: Refactorizar Código Legacy

### Situación
Tienes una función de 200 líneas que hace demasiadas cosas.

### Proceso

**Paso 1: Análisis**
```

Analiza esta función y dime:

1. ¿Cuántas responsabilidades tiene?
2. ¿Qué partes se pueden extraer?
3. ¿Qué patrones de refactoring aplicarías?

```javascript
function processOrder(order, user, inventory, paymentGateway) {
  // [200 líneas de código]
}
```

```

**Paso 2: Plan de refactoring**
```

Crea un plan de refactoring paso a paso.

Restricciones:

- No cambiar la API pública (mismos parámetros y retorno)
- Cada paso debe mantener tests pasando
- Priorizar legibilidad sobre "elegancia"

```

**Paso 3: Ejecutar paso a paso**
```

Ejecuta el paso 1 del plan: [extraer validación]

Muéstrame:

1. El código refactorizado
2. Qué tests debo agregar
3. Cómo verificar que no rompí nada

```

**Paso 4: Verificar cada paso**
```

[Ejecutar tests]
[Si pasan, continuar]
[Si fallan, debuggear con IA]

```

---

## Caso 4: Escribir Tests para Código Existente

### Situación
Código sin tests que necesita cobertura antes de modificar.

### Proceso

**Paso 1: Identificar casos**
```

Analiza esta función y lista todos los casos de test que debería cubrir:

```typescript
async function transferMoney(from: Account, to: Account, amount: number) {
  if (amount <= 0) throw new Error('Amount must be positive');
  if (from.balance < amount) throw new Error('Insufficient funds');

  await db.transaction(async (tx) => {
    await tx.account.update({
      where: { id: from.id },
      data: { balance: { decrement: amount } },
    });
    await tx.account.update({
      where: { id: to.id },
      data: { balance: { increment: amount } },
    });
  });

  return { from: from.balance - amount, to: to.balance + amount };
}
```

```

**Paso 2: Generar tests**
```

Genera tests para todos los casos identificados.

Framework: Vitest
Mocking: vi.mock para la base de datos
Estilo: Arrange-Act-Assert con descripciones claras

```

**Paso 3: Agregar edge cases**
```

¿Hay edge cases que no cubrimos?

Considera:

- Concurrencia (dos transfers simultáneos)
- Valores extremos (amount muy grande)
- Errores de DB (rollback)

```

---

## Caso 5: Code Review de PR

### Situación
Revisar un PR de 15 archivos antes de aprobar.

### Proceso

**Paso 1: Overview**
```

Voy a revisar un PR. Primero dame un checklist de qué buscar:

Contexto:

- PR agrega autenticación OAuth
- Modifica: 3 controllers, 2 services, 5 componentes React, 5 tests
- Autor: desarrollador mid-level

```

**Paso 2: Review sistemático**
```

Revisa este archivo enfocándote en seguridad:

```typescript
// auth.controller.ts
[código del archivo]
```

Busca específicamente:

- Exposición de datos sensibles
- Validación de input
- Manejo de tokens
- OWASP Top 10

```

**Paso 3: Consolidar feedback**
```

Basándote en todos los issues encontrados, ayúdame a redactar
el feedback del code review.

Formato:

- Organizado por severidad
- Constructivo y educativo
- Con sugerencias concretas
- Código de ejemplo donde aplique

```

---

## Caso 6: Aprender Nueva Librería

### Situación
Necesitas aprender Zustand para manejo de estado en React.

### Proceso

**Paso 1: Contexto**
```

Necesito aprender Zustand.

Mi background:

- Uso Redux hace 3 años
- Conozco React Context
- TypeScript nivel avanzado

Explícame Zustand comparándolo con lo que ya conozco.

```

**Paso 2: Conceptos clave**
```

¿Cuáles son los 5 conceptos/patrones más importantes de Zustand
que debo dominar?

Para cada uno:

- Qué es
- Cuándo usarlo
- Ejemplo de código
- Equivalente en Redux (si existe)

```

**Paso 3: Práctica guiada**
```

Guíame para convertir este store de Redux a Zustand:

```typescript
// Redux store
const userSlice = createSlice({
  name: 'user',
  initialState: { user: null, loading: false },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});
```

```

**Paso 4: Proyecto mini**
```

Sugiere un mini-proyecto de 1 hora para practicar
los conceptos principales de Zustand.

Debe incluir:

- Crear store
- Múltiples slices
- Acciones async
- Persistencia
- DevTools

```

---

## Caso 7: Migrar de una Tecnología a Otra

### Situación
Migrar de Express a Fastify en una API existente.

### Proceso

**Paso 1: Análisis de impacto**
```

Voy a migrar de Express a Fastify.

Mi app actual:

- 20 rutas
- Middleware: cors, helmet, morgan, express-validator
- Auth con Passport.js
- 50 tests

¿Cuáles son las diferencias principales que afectarán mi migración?
¿Qué partes serán más complicadas?

```

**Paso 2: Plan de migración**
```

Crea un plan de migración paso a paso.

Requisitos:

- Zero downtime (puedo tener ambos corriendo en paralelo)
- Migrar tests también
- Mantener compatibilidad con clientes

```

**Paso 3: Migrar por partes**
```

Migra este middleware de Express a Fastify:

```javascript
// Express
app.use((req, res, next) => {
  req.requestTime = Date.now();
  res.on('finish', () => {
    console.log(
      `${req.method} ${req.path} - ${Date.now() - req.requestTime}ms`
    );
  });
  next();
});
```

```

**Paso 4: Verificación**
```

¿Cómo verifico que la migración es correcta?

Dame:

1. Tests de compatibilidad
2. Checklist de verificación manual
3. Métricas a comparar (antes vs después)

```

---

## Caso 8: Optimizar Performance

### Situación
Una página tarda 5 segundos en cargar, necesita optimización.

### Proceso

**Paso 1: Diagnóstico**
```

Mi página /dashboard tarda 5 segundos en cargar.

Métricas actuales:

- FCP: 3.2s
- LCP: 4.8s
- Bundle size: 2.1MB

Stack: Next.js 14, React, Tailwind

¿Qué debería investigar primero?

```

**Paso 2: Análisis de código**
```

Analiza este componente por problemas de performance:

```tsx
function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div>
      {data.map((item) => (
        <Card key={item.id}>
          <ExpensiveChart data={item.chartData} />
          <DataTable rows={item.rows} />
        </Card>
      ))}
    </div>
  );
}
```

Identifica:

1. Problemas de rendering
2. Problemas de carga de datos
3. Oportunidades de optimización

```

**Paso 3: Implementar optimizaciones**
```

Implementa estas optimizaciones:

1. Lazy loading de componentes pesados
2. Virtualización de la lista
3. Memoización donde sea necesario

Muéstrame el código optimizado con explicación de cada cambio.

```

---

## Caso 9: Documentar Código

### Situación
Documentar una API interna para el equipo.

### Proceso

**Paso 1: Generar JSDoc**
```

Genera documentación JSDoc para estas funciones.

Incluye:

- Descripción clara
- @param con tipos y descripción
- @returns con tipo y descripción
- @throws si aplica
- @example con uso real

```typescript
async function getUserOrders(
  userId: string,
  options?: {
    limit?: number;
    status?: 'pending' | 'completed' | 'cancelled';
  }
) {
  // implementación
}
```

```

**Paso 2: README del módulo**
```

Crea un README para el módulo de órdenes.

Estructura:

- Descripción
- Instalación/Setup
- API Reference
- Ejemplos de uso
- Troubleshooting común

```

**Paso 3: Diagramas**
```

Describe (en texto) un diagrama de secuencia para el flujo de crear una orden.

Actores:

- Cliente (frontend)
- API Gateway
- OrderService
- PaymentService
- NotificationService
- Database

```

---

## Caso 10: Diseñar API

### Situación
Diseñar una API REST para un nuevo microservicio.

### Proceso

**Paso 1: Requisitos**
```

Necesito diseñar una API para un servicio de reservaciones.

Entidades:

- Reservación (fecha, hora, duración, estado, usuario, recurso)
- Recurso (sala, equipo, etc.)
- Usuario (quien reserva)

Operaciones necesarias:

- CRUD de reservaciones
- Verificar disponibilidad
- Cancelar reservación
- Notificar cambios

¿Cómo estructurarías los endpoints?

```

**Paso 2: Diseño de endpoints**
```

Para cada endpoint que sugeriste, define:

- Método HTTP
- Path
- Request body (si aplica)
- Response body
- Códigos de error posibles
- Autenticación requerida

```

**Paso 3: Validación del diseño**
```

Revisa el diseño de API considerando:

1. ¿Es RESTful?
2. ¿Los nombres son consistentes?
3. ¿Faltan endpoints comunes?
4. ¿La paginación es adecuada?
5. ¿El versionado está considerado?

```

**Paso 4: Documentación OpenAPI**
```

Genera la especificación OpenAPI (Swagger) para los 3 endpoints principales.

Incluye:

- Schemas de request/response
- Ejemplos
- Descripciones claras

```

---

## Patrones Reutilizables

### Patrón: Investigar antes de Implementar

```

1. "¿Cuáles son las opciones para [problema]?"
2. "Compara [opción A] vs [opción B] para mi caso"
3. "¿Cuáles son los riesgos de [opción elegida]?"
4. "Implementemos [opción elegida]"

```

### Patrón: Implementación Incremental

```

1. "Crea la estructura básica"
2. "Agrega [funcionalidad 1]"
3. "Agrega [funcionalidad 2]"
4. "Agrega manejo de errores"
5. "Agrega tests"

```

### Patrón: Verificación Cruzada

```

1. IA genera código
2. Tú lo revisas
3. "¿Hay algún problema con este código?"
4. IA encuentra issues
5. Corrigen juntos

```

### Patrón: Aprendizaje Contextual

```

1. "Explícame [concepto] en el contexto de mi proyecto"
2. "Muéstrame un ejemplo usando mi stack"
3. "¿Cómo aplicaría esto a [mi caso específico]?"

```

---

## Referencia Rápida

### Por Tipo de Tarea

| Tarea | Prompt Inicial |
|-------|----------------|
| Nueva feature | "Necesito implementar X. ¿Cómo lo estructurarías?" |
| Bug | "Este código falla con [error]. ¿Por qué?" |
| Refactor | "¿Cómo mejorarías este código?" |
| Tests | "Genera tests para esta función cubriendo todos los casos" |
| Review | "Revisa este código como un senior developer" |
| Aprender | "Explícame X como si conociera Y" |
| Migración | "¿Cómo migro de X a Y?" |
| Performance | "¿Por qué este código es lento?" |
| Docs | "Documenta esta función/módulo/API" |
| Diseño | "Diseña una API/sistema para X" |
```
