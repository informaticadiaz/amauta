# Guía de Debugging - Amauta

## Filosofía

> "Debugging es el doble de difícil que escribir el código. Por lo tanto, si escribís código lo más inteligente posible, por definición no sos lo suficientemente inteligente para debuggearlo." - Brian Kernighan

El debugging efectivo es una habilidad que se desarrolla. Esta guía te ayuda a diagnosticar y resolver problemas de manera sistemática.

---

## Proceso de Debugging

### Método Científico

```
1. OBSERVAR    → ¿Qué está pasando exactamente?
       ↓
2. HIPÓTESIS   → ¿Por qué podría estar pasando?
       ↓
3. PROBAR     → Verificar la hipótesis
       ↓
4. ITERAR      → Si no funciona, nueva hipótesis
       ↓
5. DOCUMENTAR  → Registrar la solución
```

### Preguntas Clave

Antes de empezar a debuggear, respondé:

1. **¿Qué debería pasar?** (comportamiento esperado)
2. **¿Qué está pasando?** (comportamiento actual)
3. **¿Cuándo empezó?** (¿después de qué cambio?)
4. **¿Es reproducible?** (¿siempre o a veces?)
5. **¿Dónde ocurre?** (¿desarrollo, staging, producción?)

---

## Herramientas de Debugging

### Frontend (Next.js / React)

#### Browser DevTools

| Tab             | Uso                          |
| --------------- | ---------------------------- |
| **Console**     | Ver logs, errores, warnings  |
| **Network**     | Inspeccionar requests HTTP   |
| **Elements**    | Inspeccionar DOM y CSS       |
| **Sources**     | Debugger, breakpoints        |
| **Application** | LocalStorage, cookies, cache |
| **Performance** | Profiling de rendimiento     |

#### React DevTools

- Inspeccionar árbol de componentes
- Ver props y state
- Profiler de renders

```bash
# Instalar extensión de Chrome/Firefox
# React Developer Tools
```

#### Console Methods

```typescript
// Básico
console.log('valor:', variable);

// Tabla para arrays/objetos
console.table(usuarios);

// Agrupado
console.group('Proceso de login');
console.log('Paso 1: validar email');
console.log('Paso 2: verificar password');
console.groupEnd();

// Con colores
console.log('%c Error crítico', 'color: red; font-weight: bold');

// Tiempo de ejecución
console.time('operacion');
// ... código ...
console.timeEnd('operacion'); // operacion: 123ms

// Stack trace
console.trace('Llegué aquí');

// Condicionalmente
console.assert(x > 0, 'x debería ser positivo');
```

#### Breakpoints en el Código

```typescript
// Pausar ejecución aquí
debugger;

// Condicional (en DevTools)
// Click derecho en breakpoint → "Edit breakpoint"
// Condición: usuario.rol === 'ADMIN'
```

### Backend (NestJS)

#### Logging con NestJS Logger

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class CursosService {
  private readonly logger = new Logger(CursosService.name);

  async findOne(id: string) {
    this.logger.log(`Buscando curso ${id}`);

    const curso = await this.prisma.curso.findUnique({ where: { id } });

    if (!curso) {
      this.logger.warn(`Curso ${id} no encontrado`);
      throw new NotFoundException();
    }

    this.logger.debug(`Curso encontrado: ${JSON.stringify(curso)}`);
    return curso;
  }
}
```

#### Niveles de Log

| Nivel     | Uso                     | En Producción |
| --------- | ----------------------- | ------------- |
| `error`   | Errores críticos        | ✅ Sí         |
| `warn`    | Advertencias            | ✅ Sí         |
| `log`     | Info general            | ✅ Sí         |
| `debug`   | Detalles para debugging | ❌ No         |
| `verbose` | Muy detallado           | ❌ No         |

#### Debugging con VS Code

1. Crear `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "cwd": "${workspaceFolder}/apps/api",
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

2. Agregar script en `package.json`:

```json
{
  "scripts": {
    "start:debug": "nest start --debug --watch"
  }
}
```

3. Poner breakpoints y presionar F5

### Base de Datos (Prisma)

#### Logging de Queries

```typescript
// prisma/prisma.service.ts
const prisma = new PrismaClient({
  log: [
    { emit: 'stdout', level: 'query' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
    { emit: 'stdout', level: 'error' },
  ],
});

// Ver queries ejecutadas
// prisma:query SELECT * FROM "Usuario" WHERE "id" = $1
```

#### Prisma Studio

```bash
npm run prisma:studio
# Abre http://localhost:5555
```

- Ver datos de todas las tablas
- Editar registros manualmente
- Ver relaciones

#### Query Raw para Debug

```typescript
// Ejecutar SQL directo para debug
const result = await prisma.$queryRaw`
  SELECT * FROM "Curso" WHERE "id" = ${id}
`;
console.log(result);
```

---

## Problemas Comunes y Soluciones

### Frontend

#### "Cannot read property 'X' of undefined"

**Causa**: Acceso a propiedad de objeto que no existe.

```typescript
// ❌ Problema
const nombre = usuario.perfil.nombre; // Si perfil es undefined → crash

// ✅ Solución: Optional chaining
const nombre = usuario?.perfil?.nombre;

// ✅ Solución: Valor por defecto
const nombre = usuario?.perfil?.nombre ?? 'Sin nombre';
```

#### Componente no re-renderiza

**Causas comunes**:

1. **Mutación de estado**:

```typescript
// ❌ Mal: mutar array directamente
const agregarItem = () => {
  items.push(nuevoItem); // No dispara re-render
  setItems(items);
};

// ✅ Bien: crear nuevo array
const agregarItem = () => {
  setItems([...items, nuevoItem]);
};
```

2. **Dependencias de useEffect**:

```typescript
// ❌ Mal: falta dependencia
useEffect(() => {
  fetchData(userId);
}, []); // userId no está en dependencias

// ✅ Bien
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

#### Request CORS bloqueado

**Síntoma**: `Access-Control-Allow-Origin` error en consola.

**Solución en backend** (NestJS):

```typescript
// main.ts
app.enableCors({
  origin: ['http://localhost:3000', 'https://amauta.diazignacio.ar'],
  credentials: true,
});
```

#### Hydration mismatch (Next.js)

**Síntoma**: "Text content does not match server-rendered HTML"

**Causa**: El HTML del servidor difiere del cliente.

```typescript
// ❌ Problema: Date es diferente en servidor vs cliente
function Fecha() {
  return <p>{new Date().toLocaleString()}</p>;
}

// ✅ Solución: Usar useEffect para valores dinámicos
function Fecha() {
  const [fecha, setFecha] = useState<string | null>(null);

  useEffect(() => {
    setFecha(new Date().toLocaleString());
  }, []);

  if (!fecha) return <p>Cargando...</p>;
  return <p>{fecha}</p>;
}
```

### Backend

#### "Cannot find module"

**Causas**:

1. Falta instalar dependencia: `npm install`
2. Path incorrecto en import
3. TypeScript paths no configurados

```bash
# Verificar que existe
ls node_modules/<paquete>

# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### Prisma: "Record not found"

**Diagnóstico**:

```typescript
// Verificar que el ID existe
const exists = await prisma.curso.findUnique({
  where: { id },
  select: { id: true },
});
console.log('Existe:', !!exists);
```

#### Memory Leak

**Síntomas**: La aplicación se vuelve lenta con el tiempo, uso de memoria crece.

**Causas comunes**:

- Event listeners no removidos
- Timers no limpiados
- Referencias a objetos grandes

```typescript
// ❌ Mal: listener nunca se remueve
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []);

// ✅ Bien: cleanup en useEffect
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

### Base de Datos

#### Query N+1

**Síntoma**: Muchas queries pequeñas en lugar de una grande.

**Diagnóstico**: Activar logging de Prisma y contar queries.

```typescript
// ❌ N+1: 1 query para cursos + N queries para educadores
const cursos = await prisma.curso.findMany();
for (const curso of cursos) {
  curso.educador = await prisma.usuario.findUnique({
    where: { id: curso.educadorId },
  });
}

// ✅ Una sola query con include
const cursos = await prisma.curso.findMany({
  include: { educador: true },
});
```

#### Deadlock

**Síntoma**: Queries que se bloquean indefinidamente.

**Solución**: Usar transacciones correctamente.

```typescript
// Usar transacciones para operaciones que deben ser atómicas
await prisma.$transaction([
  prisma.inscripcion.create({ data: { ... } }),
  prisma.curso.update({ where: { id }, data: { ... } }),
]);
```

---

## Debugging en Producción

### Precauciones

- **Nunca** poner `console.log` con datos sensibles
- **Nunca** exponer stack traces al usuario
- **Siempre** usar niveles de log apropiados

### Logs en Producción

```typescript
// Usar logger estructurado
this.logger.error('Error procesando pago', {
  userId: user.id,
  monto: pago.monto,
  error: error.message,
  // NO incluir: password, tokens, datos de tarjeta
});
```

### Health Checks

```typescript
// Endpoint para verificar estado
@Get('health')
health() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}

// Health check de DB
@Get('health/db')
async healthDb() {
  try {
    await this.prisma.$queryRaw`SELECT 1`;
    return { database: 'ok' };
  } catch (error) {
    return { database: 'error', message: error.message };
  }
}
```

### Reproducir Problemas de Producción

1. **Obtener logs** del momento del error
2. **Identificar** request/usuario/datos involucrados
3. **Recrear** en ambiente local con datos similares
4. **Nunca** usar datos reales de producción en local

---

## Cómo Reportar un Bug

### Template de Bug Report

```markdown
## Descripción

[Qué está pasando]

## Pasos para reproducir

1. Ir a la página X
2. Hacer click en Y
3. Ver el error

## Comportamiento esperado

[Qué debería pasar]

## Comportamiento actual

[Qué está pasando]

## Screenshots/Logs

[Capturas o logs relevantes]

## Ambiente

- Navegador: Chrome 120
- OS: Ubuntu 22.04
- Rama: main
- Commit: abc1234

## Información adicional

[Cualquier contexto extra]
```

### Información Útil para Incluir

- **URL** donde ocurre
- **Console errors** (screenshot)
- **Network tab** (requests fallidos)
- **Pasos exactos** para reproducir
- **Frecuencia**: siempre, a veces, solo una vez

---

## Tips de Debugging

### 1. Rubber Duck Debugging

Explicá el problema en voz alta (a un pato de goma o a vos mismo). Muchas veces al explicar, encontrás la solución.

### 2. Bisección (Git Bisect)

Si algo dejó de funcionar y no sabés cuándo:

```bash
git bisect start
git bisect bad          # El commit actual está mal
git bisect good abc123  # Este commit estaba bien

# Git te va dando commits para probar
# Decís 'good' o 'bad' hasta encontrar el culpable
git bisect good
git bisect bad
# ...
git bisect reset  # Cuando terminás
```

### 3. Simplificar

- Comentar código hasta que funcione
- Agregar de a poco hasta que falle
- El problema está en lo último que agregaste

### 4. Dormir

En serio. A veces alejarse del problema y volver después ayuda a verlo con ojos frescos.

### 5. Pedir Ayuda

Si llevas más de 30 minutos sin avanzar:

- Explicá el problema a un compañero
- Buscá en StackOverflow/Google
- Preguntá en el canal del equipo

---

## Recursos

- [Chrome DevTools Documentation](https://developer.chrome.com/docs/devtools/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [NestJS Debugging](https://docs.nestjs.com/recipes/debugging)
- [Prisma Debugging](https://www.prisma.io/docs/concepts/components/prisma-client/debugging)

---

**Última actualización**: 2025-12-23
**Versión**: 1.0.0
