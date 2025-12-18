# Estándares de Código - Amauta

## Principios Generales

### Filosofía de Código

- **Clean Code**: Código legible, mantenible y expresivo
- **DRY** (Don't Repeat Yourself): Evitar duplicación
- **SOLID**: Principios de diseño orientado a objetos
- **KISS** (Keep It Simple): Simplicidad sobre complejidad
- **YAGNI** (You Aren't Gonna Need It): No implementar funcionalidad especulativa

### Valores del Proyecto

- **Accesibilidad primero**: Código que sirve a todos
- **Colaboración**: Código fácil de entender para otros
- **Sostenibilidad**: Pensar en el mantenimiento a largo plazo

## TypeScript

### Configuración

Usar `strict: true` en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### Tipos vs Interfaces

**Usar `interface` para:**

- Definir formas de objetos
- APIs públicas
- Cuando se necesita extensión/merge

```typescript
interface Usuario {
  id: string;
  nombre: string;
  email: string;
}

interface Estudiante extends Usuario {
  matricula: string;
}
```

**Usar `type` para:**

- Uniones y tipos complejos
- Tipos utilitarios
- Primitivos y literales

```typescript
type Rol = 'estudiante' | 'educador' | 'admin';
type EstadoCurso = 'borrador' | 'publicado' | 'archivado';
type NullableString = string | null;
```

### Evitar `any`

```typescript
// ❌ Mal
function procesarDatos(data: any) {
  return data.valor;
}

// ✅ Bien
function procesarDatos(data: unknown) {
  if (typeof data === 'object' && data !== null && 'valor' in data) {
    return (data as { valor: string }).valor;
  }
  throw new Error('Datos inválidos');
}

// ✅ Mejor aún
interface DatosEsperados {
  valor: string;
}

function procesarDatos(data: DatosEsperados) {
  return data.valor;
}
```

## Nomenclatura

### Variables y Funciones

- **camelCase** para variables y funciones
- Nombres descriptivos y expresivos

```typescript
// ❌ Mal
const d = new Date();
const usr = getUsr();

// ✅ Bien
const fechaActual = new Date();
const usuario = obtenerUsuario();
```

### Componentes React

- **PascalCase** para componentes
- Nombres sustantivos, descriptivos de la UI

```typescript
// ❌ Mal
function coursecard() {}
function Course_Card() {}

// ✅ Bien
function CourseCard() {}
function ListaEstudiantes() {}
```

### Archivos

- **kebab-case** para archivos
- Extensión según contenido: `.ts`, `.tsx`, `.test.ts`

```
components/
  ├── course-card.tsx
  ├── student-list.tsx
  └── navigation-menu.tsx

utils/
  ├── format-date.ts
  ├── validate-email.ts
  └── format-date.test.ts
```

### Constantes

- **UPPER_SNAKE_CASE** para constantes globales
- **camelCase** para constantes locales de configuración

```typescript
// Constantes globales
const MAX_FILE_SIZE = 10485760;
const API_BASE_URL = 'https://api.amauta.org';

// Config local
const defaultPaginationSize = 20;
```

### Clases y Tipos

- **PascalCase** para clases, interfaces, types, enums

```typescript
class GestorCursos {}
interface ConfiguracionCurso {}
type EstadoAutenticacion = 'autenticado' | 'no-autenticado';
enum RolUsuario {
  Estudiante = 'ESTUDIANTE',
  Educador = 'EDUCADOR',
  Admin = 'ADMIN',
}
```

## React/Next.js

### Estructura de Componentes

```typescript
// ✅ Orden recomendado
import { useState, useEffect } from 'react';  // 1. Imports externos
import { Button } from '@/components/ui';      // 2. Imports internos
import { formatDate } from '@/lib/utils';      // 3. Utils
import type { Curso } from '@/types';          // 4. Types
import styles from './course-card.module.css'; // 5. Estilos

// 6. Types/Interfaces del componente
interface CourseCardProps {
  curso: Curso;
  onEnroll?: () => void;
}

// 7. Componente principal
export function CourseCard({ curso, onEnroll }: CourseCardProps) {
  // 7a. Hooks de estado
  const [inscrito, setInscrito] = useState(false);

  // 7b. Hooks de efectos
  useEffect(() => {
    // ...
  }, []);

  // 7c. Funciones auxiliares
  const handleEnroll = () => {
    setInscrito(true);
    onEnroll?.();
  };

  // 7d. Early returns
  if (!curso) return null;

  // 7e. Render
  return (
    <div>
      <h3>{curso.titulo}</h3>
      <Button onClick={handleEnroll}>Inscribirse</Button>
    </div>
  );
}

// 8. Componentes auxiliares (si son pequeños y específicos)
function CourseMetadata({ curso }: { curso: Curso }) {
  return <span>{formatDate(curso.fechaCreacion)}</span>;
}
```

### Hooks Personalizados

```typescript
// ✅ Prefijo 'use' obligatorio
// hooks/use-curso.ts
export function useCurso(cursoId: string) {
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    obtenerCurso(cursoId)
      .then(setCurso)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [cursoId]);

  return { curso, loading, error };
}
```

### Componentes Server vs Client

```typescript
// ✅ Explicitar cuando es Client Component
'use client';

import { useState } from 'react';

export function InteractiveComponent() {
  const [count, setCount] = useState(0);
  // ...
}

// ✅ Server Component (por defecto en App Router)
// No necesita directiva 'use server' para componentes
export async function CourseList() {
  const cursos = await obtenerCursos();
  return (
    <div>
      {cursos.map(curso => <CourseCard key={curso.id} curso={curso} />)}
    </div>
  );
}
```

## Backend/API

### Estructura de Controladores

```typescript
// controllers/curso.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CursoService } from '@/services/curso.service';
import { validarCurso } from '@/validators/curso.validator';

export class CursoController {
  constructor(private cursoService: CursoService) {}

  /**
   * Obtiene todos los cursos
   * @route GET /api/cursos
   */
  async obtenerTodos(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const cursos = await this.cursoService.obtenerTodos({
        page: Number(page),
        limit: Number(limit),
      });

      res.json({
        success: true,
        data: cursos,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea un nuevo curso
   * @route POST /api/cursos
   */
  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const datosValidados = validarCurso(req.body);
      const curso = await this.cursoService.crear(datosValidados);

      res.status(201).json({
        success: true,
        data: curso,
      });
    } catch (error) {
      next(error);
    }
  }
}
```

### Servicios (Business Logic)

```typescript
// services/curso.service.ts
import { PrismaClient } from '@prisma/client';
import type { CrearCursoDto, ActualizarCursoDto } from '@/types/dto';

export class CursoService {
  constructor(private prisma: PrismaClient) {}

  async obtenerTodos(options: { page: number; limit: number }) {
    const skip = (options.page - 1) * options.limit;

    const [cursos, total] = await Promise.all([
      this.prisma.curso.findMany({
        skip,
        take: options.limit,
        include: { educador: true },
      }),
      this.prisma.curso.count(),
    ]);

    return {
      cursos,
      total,
      page: options.page,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  async crear(datos: CrearCursoDto) {
    return this.prisma.curso.create({
      data: datos,
      include: { educador: true },
    });
  }
}
```

## Manejo de Errores

### Frontend

```typescript
// ✅ Usar try-catch con manejo específico
async function inscribirseEnCurso(cursoId: string) {
  try {
    const response = await fetch(`/api/cursos/${cursoId}/inscribir`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al inscribirse:', error.message);
      // Mostrar mensaje al usuario
      toast.error('No se pudo completar la inscripción');
    }
    throw error;
  }
}
```

### Backend

```typescript
// middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
  }

  // Error no previsto
  console.error('Error no manejado:', error);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
  });
}
```

## Testing

### Nomenclatura de Tests

```typescript
// course.service.test.ts
describe('CursoService', () => {
  describe('crear', () => {
    it('debería crear un curso con datos válidos', async () => {
      // Arrange
      const datos = { titulo: 'Curso Test', descripcion: 'Test' };

      // Act
      const curso = await cursoService.crear(datos);

      // Assert
      expect(curso).toBeDefined();
      expect(curso.titulo).toBe(datos.titulo);
    });

    it('debería fallar con datos inválidos', async () => {
      // Arrange
      const datosInvalidos = { titulo: '' };

      // Act & Assert
      await expect(cursoService.crear(datosInvalidos)).rejects.toThrow(
        'Título requerido'
      );
    });
  });
});
```

## Comentarios

### Cuándo comentar

```typescript
// ❌ Mal: Comentario obvio
// Incrementa el contador
counter++;

// ✅ Bien: Explica el "por qué"
// Incrementamos antes de enviar porque el backend espera ID 1-indexed
counter++;
await enviarAlBackend(counter);

// ✅ Bien: Documenta complejidad
/**
 * Calcula el progreso del estudiante en el curso
 *
 * Considera:
 * - Lecciones completadas
 * - Evaluaciones aprobadas (peso 2x)
 * - Material descargado (peso 0.5x)
 *
 * @returns Porcentaje de 0 a 100
 */
function calcularProgreso(estudiante: Estudiante, curso: Curso): number {
  // ...
}
```

## Commits

### Convención de Mensajes

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>[scope opcional]: <descripción>

[cuerpo opcional]

[footer opcional]
```

**Tipos:**

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato, punto y coma, etc (no afecta código)
- `refactor`: Refactorización
- `test`: Agregar o corregir tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**

```bash
feat(cursos): agregar filtro por categoría

fix(auth): corregir validación de email vacío

docs(readme): actualizar guía de instalación

refactor(api): simplificar lógica de autenticación

test(cursos): agregar tests para creación de curso

chore(deps): actualizar dependencias a versiones seguras
```

## Herramientas

### ESLint

Configuración base en `.eslintrc.js`

### Prettier

Formateo automático

### Husky

Pre-commit hooks para validar código antes de commit

### TypeScript

Type checking estricto

## Recursos

- [Clean Code by Robert C. Martin](https://www.goodreads.com/book/show/3735293-clean-code)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
