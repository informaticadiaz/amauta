# Proceso de Releases - Amauta

**Última actualización**: 2024-12-23
**Versión**: 1.0.0

## Versionado Semántico

Amauta sigue [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Cambios incompatibles con versiones anteriores (breaking changes)
- **MINOR**: Nueva funcionalidad compatible hacia atrás
- **PATCH**: Corrección de bugs compatible hacia atrás

### Ejemplos

- `1.0.0` → `2.0.0`: Cambio de API, migración de base de datos requerida
- `1.0.0` → `1.1.0`: Nueva feature de cursos, sin breaking changes
- `1.0.0` → `1.0.1`: Fix de bug en autenticación

---

## Tipos de Release

### 1. Major Release (X.0.0)

**Frecuencia**: Por fase del roadmap (cada 2-3 meses)

**Características**:

- Funcionalidades completas de una fase
- Puede incluir breaking changes
- Requiere migración de datos/API
- Comunicación extensa a usuarios

**Proceso**:

1. Feature freeze 1 semana antes
2. Testing extensivo
3. Documentación de migración
4. Release notes completas
5. Comunicación a stakeholders
6. Deployment gradual (canary)

### 2. Minor Release (x.Y.0)

**Frecuencia**: Cada sprint (cada 2 semanas)

**Características**:

- Nuevas features backward-compatible
- Mejoras de UX
- No requiere migración manual

**Proceso**:

1. QA del sprint completado
2. Release notes
3. Deployment automático a producción

### 3. Patch Release (x.y.Z)

**Frecuencia**: Según necesidad (hotfixes)

**Características**:

- Corrección de bugs críticos
- Fixes de seguridad
- No incluye features nuevas

**Proceso**:

1. Fix desarrollado y testeado
2. Cherry-pick a rama de release
3. Deployment inmediato

---

## Calendario de Releases

### Fase 0: Fundamentos

| Versión | Fecha      | Descripción                     | Estado     |
| ------- | ---------- | ------------------------------- | ---------- |
| 0.1.0   | 01/12/2024 | Estructura inicial del proyecto | Completado |
| 0.2.0   | 10/12/2024 | Infraestructura y base de datos | Completado |
| 0.3.0   | 18/12/2024 | Backend NestJS funcional        | Completado |
| 0.4.0   | 23/12/2024 | Frontend Next.js + Deploy prod  | Completado |
| 0.5.0   | 31/12/2024 | Seed data y CI expandido        | Pendiente  |

### Fase 1: MVP (Planificado)

| Versión | Fecha (Est.) | Descripción                  | Estado      |
| ------- | ------------ | ---------------------------- | ----------- |
| 1.0.0   | Febrero 2025 | MVP completo - Autenticación | Planificado |
| 1.1.0   | Marzo 2025   | Gestión de cursos            | Planificado |
| 1.2.0   | Abril 2025   | Catálogo y navegación        | Planificado |

---

## Flujo de Git para Releases

### Ramas

```
main (producción)
  │
  ├── develop (integración)
  │     │
  │     ├── feature/xxx
  │     ├── feature/yyy
  │     └── bugfix/zzz
  │
  └── release/x.y.z (preparación de release)
        │
        └── hotfix/xxx (fixes urgentes)
```

### Proceso de Feature

```bash
# 1. Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y commitear
git add .
git commit -m "feat: descripción de la feature"

# 3. Push y crear PR
git push origin feature/nueva-funcionalidad
gh pr create --base develop

# 4. Después de merge, eliminar rama
git branch -d feature/nueva-funcionalidad
```

### Proceso de Release

```bash
# 1. Crear rama de release desde develop
git checkout develop
git pull origin develop
git checkout -b release/0.5.0

# 2. Preparar release (versiones, changelog)
npm version 0.5.0 --no-git-tag-version
# Actualizar CHANGELOG.md

# 3. Commit y push
git add .
git commit -m "chore: preparar release 0.5.0"
git push origin release/0.5.0

# 4. Crear PR a main
gh pr create --base main --title "Release 0.5.0"

# 5. Después de merge, crear tag
git checkout main
git pull origin main
git tag -a v0.5.0 -m "Release 0.5.0"
git push origin v0.5.0

# 6. Merge back a develop
git checkout develop
git merge main
git push origin develop
```

### Proceso de Hotfix

```bash
# 1. Crear rama desde main
git checkout main
git pull origin main
git checkout -b hotfix/fix-critico

# 2. Implementar fix
git add .
git commit -m "fix: descripción del fix crítico"

# 3. Crear PR a main
gh pr create --base main --title "Hotfix: descripción"

# 4. Después de merge, tag y merge a develop
git checkout main
git pull origin main
git tag -a v0.4.1 -m "Hotfix 0.4.1"
git push origin v0.4.1

git checkout develop
git merge main
git push origin develop
```

---

## Release Notes

### Template

```markdown
# Release Notes - v0.5.0

**Fecha**: DD/MM/YYYY
**Tipo**: Minor Release

## Resumen

Breve descripción de qué incluye este release.

## Nuevas Funcionalidades

- **Feature 1**: Descripción
- **Feature 2**: Descripción

## Mejoras

- Mejora en performance de X
- Actualización de dependencias

## Correcciones

- Fix #123: Descripción del bug corregido
- Fix #124: Otro bug corregido

## Breaking Changes

- (Si aplica) Descripción del cambio y cómo migrar

## Notas de Migración

1. Paso 1 para actualizar
2. Paso 2 para migrar datos

## Dependencias Actualizadas

- next: 14.0.0 → 14.1.0
- prisma: 5.0.0 → 5.1.0

## Agradecimientos

Gracias a @contributor1, @contributor2 por sus contribuciones.
```

---

## Checklist de Release

### Pre-Release

- [ ] Todas las features del sprint completadas
- [ ] Todos los tests pasando (unit, integration, e2e)
- [ ] Code coverage > 80%
- [ ] No hay vulnerabilidades críticas (npm audit)
- [ ] Documentación actualizada
- [ ] CHANGELOG.md actualizado
- [ ] Version bump en package.json
- [ ] PR de release aprobado

### Durante Release

- [ ] Merge a main completado
- [ ] Tag de versión creado
- [ ] GitHub Release creado con release notes
- [ ] Deployment a producción exitoso
- [ ] Smoke tests en producción pasando
- [ ] Monitoreo activo (primeras 24h)

### Post-Release

- [ ] Merge back a develop
- [ ] Comunicación a stakeholders
- [ ] Actualizar documentación pública
- [ ] Retrospectiva si es major release
- [ ] Cerrar milestone en GitHub

---

## Deployment a Producción

### Infraestructura Actual

| Componente  | Plataforma | URL                               |
| ----------- | ---------- | --------------------------------- |
| Frontend    | Dokploy    | https://amauta.diazignacio.ar     |
| Backend API | Dokploy    | https://amauta-api.diazignacio.ar |
| PostgreSQL  | Docker/VPS | Internal                          |
| Redis       | Docker/VPS | Internal                          |

### Proceso de Deployment

1. **CI/CD Pipeline** (GitHub Actions)
   - Build automático en cada push a main
   - Tests ejecutados
   - Docker image construida

2. **Dokploy Webhook**
   - Trigger automático al push
   - Pull de nueva imagen
   - Restart de containers

3. **Verificación**
   - Health checks automáticos
   - Smoke tests manuales
   - Monitoreo de logs

### Rollback

```bash
# Si hay problemas, hacer rollback rápido
# En Dokploy UI:
# 1. Ir al servicio afectado
# 2. Deployments → Seleccionar versión anterior
# 3. Redeploy

# O via git:
git checkout main
git revert HEAD
git push origin main
# Esto triggerea nuevo deployment
```

---

## Comunicación de Releases

### Canales

| Audiencia        | Canal                 | Timing       |
| ---------------- | --------------------- | ------------ |
| Equipo interno   | GitHub Project        | Pre-release  |
| Contribuidores   | GitHub Releases       | Al publicar  |
| Usuarios finales | README / Landing page | Post-release |
| Comunidad        | GitHub Discussions    | Post-release |

### Templates de Comunicación

**Para Major Release:**

```markdown
🎉 ¡Amauta v1.0.0 está aquí!

Después de X meses de desarrollo, nos complace anunciar
el lanzamiento de Amauta 1.0.

## Destacados

- Feature principal 1
- Feature principal 2

## Cómo actualizar

[Link a guía de migración]

## Próximos pasos

[Link a roadmap]
```

**Para Minor/Patch:**

```markdown
📦 Amauta v0.5.0 disponible

## Nuevas funcionalidades

- Feature 1
- Feature 2

## Correcciones

- Fix importante

Ver release notes completas: [link]
```

---

## Métricas de Release

### KPIs a Monitorear

- **Deployment Frequency**: Releases por semana/mes
- **Lead Time**: Tiempo desde commit hasta producción
- **Change Failure Rate**: % de deployments que causan fallas
- **Mean Time to Recovery**: Tiempo para recuperarse de fallas

### Objetivos

| Métrica               | Objetivo | Actual     |
| --------------------- | -------- | ---------- |
| Deployment Frequency  | 1/semana | ~1/semana  |
| Lead Time             | < 1 día  | < 4 horas  |
| Change Failure Rate   | < 5%     | 0% (nuevo) |
| Mean Time to Recovery | < 1 hora | N/A        |

---

## Historial de Releases

### v0.4.0 (23/12/2024) - Actual

- Frontend Next.js configurado y desplegado
- Backend NestJS + Fastify en producción
- Deployment completo con Dokploy

### v0.3.0 (18/12/2024)

- Servidor HTTP con NestJS + Fastify
- Estructura de API base

### v0.2.0 (10/12/2024)

- PostgreSQL + Redis configurados
- Prisma ORM con schema completo
- Docker Compose para desarrollo

### v0.1.0 (01/12/2024)

- Estructura inicial del monorepo
- CI/CD configurado
- Documentación base

---

**Próxima revisión**: Al completar Sprint 0
