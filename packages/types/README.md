# @amauta/types

Definiciones de tipos TypeScript compartidos para el proyecto Amauta.

## Propósito

Este package contiene todas las definiciones de tipos TypeScript que se comparten entre frontend y backend:

- Interfaces de modelos de datos
- Tipos de request/response de API
- Enums compartidos
- Tipos de utilidades

## Uso

```typescript
// En apps/web o apps/api
import type { User, Course, Lesson } from '@amauta/types';
```

## Contenido (Futuro)

```
packages/types/
├── src/
│   ├── models/       # Tipos de modelos de datos
│   ├── api/          # Tipos de API (request/response)
│   ├── enums/        # Enumeraciones
│   └── index.ts      # Exports principales
└── package.json
```

## Convenciones

- Usar `interface` para objetos
- Usar `type` para unions, intersections, y aliases
- Nombrar interfaces en PascalCase
- Exportar todo desde `index.ts`
