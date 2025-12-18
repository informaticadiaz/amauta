# Guía de Contribución - Proyecto Amauta

¡Gracias por tu interés en contribuir a Amauta! Este documento te guiará a través del proceso de contribución.

## Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Proceso de Contribución](#proceso-de-contribución)
- [Convenciones de Código](#convenciones-de-código)
- [Convenciones de Commits](#convenciones-de-commits)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Proceso de Code Review](#proceso-de-code-review)
- [Setup para Contribuidores](#setup-para-contribuidores)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Mejoras](#sugerir-mejoras)

---

## Código de Conducta

Este proyecto adhiere al [Código de Conducta de Contributor Covenant](./CODE_OF_CONDUCT.md). Al participar, se espera que respetes este código. Por favor, reporta comportamientos inaceptables a través de los canales especificados.

---

## ¿Cómo puedo contribuir?

Hay muchas formas de contribuir a Amauta:

### 1. Reportar Bugs

- Usa la plantilla de issue para bugs
- Describe el problema claramente con pasos para reproducirlo
- Incluye capturas de pantalla si es relevante
- Menciona tu entorno (OS, navegador, versión de Node.js)

### 2. Sugerir Features o Mejoras

- Usa la plantilla de issue para features
- Explica el problema que resuelve tu propuesta
- Describe la solución que imaginas
- Considera alternativas

### 3. Contribuir con Código

- Busca issues etiquetados como `good-first-issue` para empezar
- Lee el [Roadmap](./docs/project-management/roadmap.md) para entender las prioridades
- Consulta [WORKFLOW.md](./WORKFLOW.md) para el proceso de trabajo con issues

### 4. Mejorar Documentación

- Corregir typos, clarificar explicaciones
- Agregar ejemplos o diagramas
- Traducir documentación (futuro)

### 5. Ayudar a la Comunidad

- Responder preguntas en GitHub Discussions
- Revisar Pull Requests de otros contribuidores
- Compartir el proyecto en redes sociales

---

## Proceso de Contribución

### 1. Fork del Repositorio

Haz un fork del repositorio a tu cuenta de GitHub:

```bash
# Haz clic en el botón "Fork" en GitHub
# O usa GitHub CLI:
gh repo fork informaticadiaz/amauta --clone
```

### 2. Clonar tu Fork

```bash
git clone https://github.com/TU-USUARIO/amauta.git
cd amauta
```

### 3. Configurar el Repositorio Upstream

```bash
git remote add upstream https://github.com/informaticadiaz/amauta.git
git remote -v
```

### 4. Mantener tu Fork Actualizado

Antes de empezar a trabajar, sincroniza con el repo principal:

```bash
git fetch upstream
git checkout master
git merge upstream/master
git push origin master
```

### 5. Crear una Rama para tu Contribución

```bash
# Usar prefijo según tipo de cambio:
# - feature/ para nuevas funcionalidades
# - fix/ para correcciones de bugs
# - docs/ para documentación
# - refactor/ para refactorizaciones

git checkout -b feature/nombre-descriptivo

# Ejemplos:
git checkout -b feature/user-authentication
git checkout -b fix/login-bug
git checkout -b docs/update-readme
```

### 6. Hacer tus Cambios

- Escribe código limpio y legible
- Sigue los [Estándares de Código](./docs/technical/coding-standards.md)
- Agrega tests si es aplicable
- Actualiza documentación relevante

### 7. Hacer Commits

Sigue las [Convenciones de Commits](#convenciones-de-commits) (ver abajo).

```bash
git add .
git commit -m "feat: agregar autenticación de usuarios"
```

### 8. Push a tu Fork

```bash
git push origin feature/nombre-descriptivo
```

### 9. Crear Pull Request

Ve a tu fork en GitHub y haz clic en "New Pull Request".

---

## Convenciones de Código

### General

- Usar español para nombres de variables, funciones y comentarios
- Código en inglés solo cuando sea convención establecida (ej: React hooks)
- Nombres descriptivos y claros
- Evitar abreviaciones confusas

### TypeScript

- Usar TypeScript para todo el código
- Evitar `any`, preferir tipos explícitos
- Usar interfaces para objetos complejos
- Documentar funciones públicas con JSDoc

### Estilo

- Usar Prettier para formateo automático
- Seguir las reglas de ESLint configuradas
- Indentación: 2 espacios
- Comillas simples para strings
- Punto y coma al final de sentencias

### Estructura de Archivos

```
apps/
  web/           # Frontend Next.js
  api/           # Backend API
packages/
  shared/        # Código compartido
  types/         # Definiciones de tipos TypeScript
```

Para más detalles, consulta [docs/technical/coding-standards.md](./docs/technical/coding-standards.md).

---

## Convenciones de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/) para mantener un historial claro.

### Formato

```
<tipo>(<ámbito opcional>): <descripción>

<cuerpo opcional>

<footer opcional>
```

### Tipos

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Formateo, punto y coma, etc. (no afecta lógica)
- **refactor**: Refactorización de código
- **test**: Agregar o modificar tests
- **chore**: Tareas de mantenimiento, deps, config

### Ejemplos

```bash
# Feature simple
git commit -m "feat: agregar login con email"

# Fix con descripción
git commit -m "fix: corregir validación de email en formulario de registro"

# Con ámbito
git commit -m "feat(auth): implementar JWT tokens"

# Con cuerpo
git commit -m "refactor: reorganizar estructura de carpetas

- Mover componentes a carpeta components/
- Crear subcarpetas por feature
- Actualizar imports"

# Cerrar issue
git commit -m "feat: agregar dashboard de usuario

Resuelve: #42"
```

### Mensajes en Español

- Primera línea: máximo 72 caracteres
- Usar infinitivo: "agregar" no "agrega" ni "agregado"
- No usar punto final en la primera línea
- Cuerpo: líneas de máximo 80 caracteres
- Ser descriptivo pero conciso

---

## Proceso de Pull Request

### Antes de Crear el PR

**Checklist:**

- [ ] El código sigue los estándares del proyecto
- [ ] Los tests pasan (cuando estén configurados)
- [ ] La documentación está actualizada
- [ ] Los commits siguen las convenciones
- [ ] El branch está actualizado con master
- [ ] No hay conflictos de merge

### Crear el Pull Request

1. **Título descriptivo**:

   ```
   feat: Implementar autenticación de usuarios
   fix: Corregir bug en formulario de login
   docs: Actualizar guía de instalación
   ```

2. **Descripción completa**:

   ```markdown
   ## Descripción

   Breve explicación de los cambios.

   ## Tipo de cambio

   - [ ] Bug fix
   - [ ] Nueva feature
   - [ ] Breaking change
   - [ ] Documentación

   ## ¿Cómo se ha probado?

   Descripción de las pruebas realizadas.

   ## Checklist

   - [ ] Mi código sigue los estándares del proyecto
   - [ ] He actualizado la documentación
   - [ ] Mis cambios no generan warnings
   - [ ] He agregado tests que prueban mi fix/feature
   ```

3. **Vincular Issues relacionados**:
   ```
   Resuelve: #123
   Relacionado: #456
   ```

### Después de Crear el PR

- Responde a comentarios de code review
- Haz commits adicionales si se requieren cambios
- No hagas force push si ya hay reviews
- Mantén la discusión profesional y constructiva

---

## Proceso de Code Review

### Para Revisores

- Ser respetuoso y constructivo
- Explicar el "por qué" de tus sugerencias
- Diferenciar entre cambios requeridos y opcionales
- Aprobar cuando todo esté listo

### Para Autores

- No tomar comentarios personalmente
- Hacer preguntas si algo no está claro
- Implementar feedback o explicar por qué no
- Agradecer el tiempo del revisor

### Qué se Revisa

- **Funcionalidad**: ¿El código hace lo que debe hacer?
- **Calidad**: ¿Es mantenible, legible, eficiente?
- **Tests**: ¿Hay cobertura adecuada?
- **Documentación**: ¿Está actualizada?
- **Seguridad**: ¿Hay vulnerabilidades obvias?
- **Estilo**: ¿Sigue las convenciones?

---

## Setup para Contribuidores

### Requisitos

- Node.js 20+
- npm 10+ (o pnpm 8+)
- Git
- Editor con soporte TypeScript (recomendado: VSCode)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU-USUARIO/amauta.git
cd amauta

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (cuando estén configuradas)
cp .env.example .env.local
# Editar .env.local con tus configuraciones

# 4. Iniciar desarrollo (cuando esté configurado)
npm run dev
```

### Herramientas Recomendadas

#### VSCode Extensions

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- GitLens
- Error Lens

#### Configuración de Git

```bash
# Tu nombre y email
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Editor por defecto
git config --global core.editor "code --wait"

# Aliases útiles
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
```

Para setup detallado, consulta [docs/technical/setup.md](./docs/technical/setup.md).

---

## Reportar Bugs

### Antes de Reportar

1. **Busca si ya existe**: Revisa issues existentes para evitar duplicados
2. **Verifica que sea un bug**: Asegúrate de que no es un problema de configuración
3. **Prueba con la última versión**: Verifica si el bug persiste en master

### Al Reportar

Incluye:

- **Descripción clara** del problema
- **Pasos para reproducir**:
  1. Ir a '...'
  2. Hacer clic en '...'
  3. Ver error
- **Comportamiento esperado** vs **comportamiento actual**
- **Capturas de pantalla** (si aplica)
- **Entorno**:
  - OS: [ej. Ubuntu 22.04]
  - Navegador: [ej. Chrome 120]
  - Node.js: [ej. 20.10.0]
  - Versión del proyecto: [ej. 0.1.0]

---

## Sugerir Mejoras

### Formato de Sugerencia

```markdown
## Problema

Descripción del problema que resuelve tu propuesta.

## Solución Propuesta

Descripción clara de lo que quieres que pase.

## Alternativas Consideradas

Otras soluciones que consideraste.

## Contexto Adicional

Screenshots, mockups, ejemplos de otros proyectos, etc.
```

---

## Recursos Adicionales

- [Roadmap del Proyecto](./docs/project-management/roadmap.md)
- [Metodología de Trabajo](./WORKFLOW.md)
- [Estándares de Código](./docs/technical/coding-standards.md)
- [Arquitectura del Sistema](./docs/technical/architecture.md)
- [Código de Conducta](./CODE_OF_CONDUCT.md)

---

## Preguntas Frecuentes

### ¿Puedo trabajar en un issue sin que esté asignado?

Sí, pero comenta en el issue para evitar trabajo duplicado.

### ¿Cómo elijo qué issue trabajar?

Busca issues con etiqueta `good-first-issue` si eres nuevo. Revisa el roadmap para entender prioridades.

### ¿Puedo proponer grandes cambios?

Sí, pero abre un issue primero para discutir antes de invertir mucho tiempo.

### ¿Debo agregar tests?

Cuando el framework de tests esté configurado, sí. Por ahora, asegúrate de probar manualmente tus cambios.

---

## Agradecimientos

¡Gracias por contribuir a Amauta! Tu tiempo y esfuerzo ayudan a democratizar la educación. 🎓

---

**Última actualización**: 2025-12-18
**Versión**: 1.0.0
