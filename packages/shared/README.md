# @amauta/shared

Código y utilidades compartidas entre frontend y backend.

## Propósito

Este package contiene código que se utiliza tanto en `@amauta/web` como en `@amauta/api`:

- Constantes compartidas
- Utilidades comunes
- Helpers de validación
- Funciones de formateo
- Configuraciones compartidas

## Uso

```typescript
// En apps/web o apps/api
import { formatDate, APP_NAME } from '@amauta/shared';
```

## Contenido (Futuro)

```
packages/shared/
├── src/
│   ├── constants/    # Constantes compartidas
│   ├── utils/        # Utilidades comunes
│   ├── validators/   # Validadores compartidos
│   └── index.ts      # Exports principales
└── package.json
```
