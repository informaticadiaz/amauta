# GitHub Actions - Workflows de CI/CD

Este directorio contiene los workflows de GitHub Actions para el proyecto Amauta.

## Workflows Disponibles

### 1. CI (Integración Continua) - `ci.yml`

**Triggers:**

- Push a `main`, `master`, o `develop`
- Pull Requests a `main`, `master`, o `develop`

**Jobs:**

#### 1.1 Validate (Validaciones Básicas)

- ✅ Verificar estructura de archivos esenciales
- ✅ Validar que no hay secretos expuestos (.env, credentials, etc.)
- ✅ Validar formato de documentación (archivos .md no vacíos)

#### 1.2 Build (Construcción del Proyecto)

- ✅ Setup de Node.js 20.x
- ✅ Caché de dependencias npm
- 📋 Placeholder para install dependencies (cuando exista package.json)
- 📋 Placeholder para lint (cuando se configure ESLint)
- 📋 Placeholder para type checking (cuando se configure TypeScript)
- 📋 Placeholder para build (cuando exista código fuente)
- 📋 Placeholder para tests (cuando se configure Jest/Vitest)
- 📋 Placeholder para coverage (cuando tengamos tests)

#### 1.3 Summary (Resumen)

- ✅ Resumen de ejecución del CI
- ✅ Próximos pasos documentados

**Características:**

- Cancela workflows anteriores del mismo PR/branch automáticamente
- Matrix strategy para Node.js (actualmente solo 20.x)
- Jobs con dependencias (validate → build → summary)

## Estado Actual

🚧 **Fase 0**: Workflow básico de validaciones

El workflow actual realiza validaciones básicas de la estructura del proyecto. Se irá expandiendo conforme se agreguen features:

- [ ] Issue #4: Monorepo → Agregar validación de estructura de paquetes
- [ ] Issue #5: TypeScript → Agregar type checking real
- [ ] Issue #6: ESLint/Prettier → Agregar lint y format check
- [ ] Issue #7: Variables de entorno → Agregar validación de .env.example
- [x] Issue #13: Tests en CI → Placeholders listos para Jest/Vitest
- [ ] Futuro: Configurar Jest o Vitest
- [ ] Futuro: Tests unitarios y de integración
- [ ] Futuro: Coverage reports (Codecov/Coveralls)

## Expansión Futura

Cuando el proyecto crezca, se agregarán:

### Tests

```yaml
- name: Run tests
  run: npm test

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

### Database

```yaml
- name: Setup PostgreSQL
  uses: ikalnytskyi/action-setup-postgres@v4

- name: Run migrations
  run: npm run db:migrate
```

### Deploy (producción)

```yaml
- name: Deploy to production
  if: github.ref == 'refs/heads/main'
  run: npm run deploy
```

## Monitoreo

Ver el estado del CI en:

- Pestaña "Actions" del repositorio
- Badge en README.md (cuando esté configurado)
- Checks en Pull Requests

## Troubleshooting

### El workflow no se ejecuta

- Verificar que el archivo esté en `.github/workflows/`
- Verificar sintaxis YAML (usar yamllint o editor con validación)
- Revisar triggers (branches correctos)

### El job falla

- Revisar logs en la pestaña "Actions"
- Verificar que las validaciones sean correctas para el estado actual del proyecto
- Consultar documentación de GitHub Actions

## Referencias

- [Documentación de GitHub Actions](https://docs.github.com/en/actions)
- [Marketplace de Actions](https://github.com/marketplace?type=actions)
- [Workflow de ejemplo](./workflows/ci.yml)

---

**Última actualización**: 2025-12-18
**Versión**: 1.0.0 (básico)
