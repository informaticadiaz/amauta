# 🔒 Seguridad y Gestión de Información Sensible

> **Índice maestro** para gestión de información sensible en el proyecto Amauta

---

## ⚠️ Contexto Importante

**Repositorio público**: `informaticadiaz/amauta` es **PÚBLICO**. Toda información commiteada aquí es visible para internet.

**Problema identificado**: El análisis inicial de deployment VPS contenía datos sensibles (IPs, dominios, configuraciones específicas) que NO deben estar en repositorio público.

**Solución implementada**: Sistema dual de documentación (pública sanitizada + privada completa).

---

## 📚 Documentos de Seguridad

### 1. Análisis VPS Sanitizado (Público) ✅

**Ubicación**: `docs/technical/vps-deployment-analysis.md`

**Contenido**:

- Plan de deployment COMPLETO pero con placeholders
- Arquitectura y decisiones técnicas
- Roadmap y recomendaciones
- Templates de configuración
- ⚠️ **NO contiene**: IPs, dominios reales, credenciales

**Uso**: Referencia general, compartible públicamente

### 2. Guía de Almacenamiento Privado

**Ubicación**: `docs/technical/PRIVATE_DATA_STORAGE.md`

**Contenido**:

- 4 opciones para almacenar datos sensibles
- ⭐ Repositorio privado (recomendado)
- Gestor de passwords (complementario)
- Archivo local encriptado
- Checklist de migración de datos
- Plan de respuesta a leaks

**Uso**: Guía para configurar almacenamiento seguro

### 3. Guía de Sanitización

**Ubicación**: `.github/SECURITY_SANITIZATION.md`

**Contenido**:

- Qué datos NUNCA commitear
- Reglas de sanitización por tipo de dato
- Checklist pre-commit
- Plantillas de reemplazo
- Respuesta a leak accidental
- Ejemplos prácticos

**Uso**: Consulta rápida antes de cada commit

---

## 🎯 Estrategia Recomendada (Resumen)

### Opción 1: Repositorio Privado (⭐ Principal)

```bash
# Crear repositorio privado para datos sensibles
gh repo create amauta-deployment-private --private

# Estructura propuesta
amauta-deployment-private/
├── deployment/
│   ├── vps-analysis-FULL.md           # Con datos reales
│   ├── production-configs/
│   │   ├── .env.api.production.local
│   │   ├── .env.web.production.local
│   │   ├── dokploy-configs.md
│   │   └── cloudflare-dns.md
│   ├── credentials/
│   │   ├── database-credentials.md
│   │   ├── secrets.md
│   │   └── ssh-access.md
│   └── runbooks/
│       ├── deployment-checklist.md
│       └── incident-response.md
└── scripts/
    ├── deploy-api.sh
    ├── deploy-web.sh
    └── health-check.sh
```

**Ventajas**:

- ✅ Máxima seguridad
- ✅ Historial con Git
- ✅ Backup automático
- ✅ Sincronización entre máquinas

### Opción 2: Gestor de Passwords (Complementario)

```
1Password/Bitwarden:
├── VPS SSH Access
├── Database Credentials
├── JWT Secrets
└── Secure Notes (análisis completo)
```

**Uso**: Solo para credenciales críticas, no documentos extensos.

---

## 📋 Checklist de Acción Inmediata

### Paso 1: Crear Repositorio Privado

```bash
# Ejecutar comando
gh repo create amauta-deployment-private --private --description "Configuraciones privadas de deployment"

# Clonar
cd ~/
git clone https://github.com/informaticadiaz/amauta-deployment-private.git

# Crear estructura
cd amauta-deployment-private
mkdir -p deployment/production-configs
mkdir -p deployment/credentials
mkdir -p deployment/runbooks
mkdir -p scripts
```

### Paso 2: Migrar Análisis Original

⚠️ **IMPORTANTE**: El análisis original que te proporcioné contenía:

- IP del VPS real
- Dominios de producción
- Nombres de proyectos específicos
- Nombres de contenedores Docker reales

**Acción**:

```bash
# En repo privado
cd ~/amauta-deployment-private/deployment/

# Crear archivo con análisis COMPLETO (con datos reales)
nano vps-analysis-FULL.md
# Pegar el análisis original completo que recibiste

git add vps-analysis-FULL.md
git commit -m "docs: agregar análisis VPS completo con datos reales"
git push
```

### Paso 3: Verificar Repo Público

```bash
# En repo público (amauta)
cd ~/amauta

# Buscar posibles leaks en historial
git log --all -p | grep -E "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}" | head -20

# Si encuentra algo, ver PRIVATE_DATA_STORAGE.md sección "Plan de Respuesta"
```

### Paso 4: Configurar Gestor de Passwords (Opcional)

```
Crear vault "Amauta Production" con:
├── 🔐 VPS SSH (IP, user, password)
├── 🔐 Database amauta_prod (host, user, password)
├── 🔐 JWT Secrets (JWT_SECRET, SESSION_SECRET, NEXTAUTH_SECRET)
└── 📄 Nota Segura: Referencia a repo privado
```

---

## 🛡️ Mejores Prácticas Diarias

### Antes de Cada Commit

```bash
# 1. Revisar cambios
git diff --staged

# 2. Buscar IPs
git diff --staged | grep -E "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}"

# 3. Buscar dominios
git diff --staged | grep -i "diazignacio.ar"

# 4. Buscar passwords/secrets
git diff --staged | grep -iE "(password|secret).*=.*[^example]"

# Si encuentra algo: sanitizar antes de commit
```

### Al Crear Documentación Nueva

1. **Preguntarte**: ¿Este documento contendrá datos sensibles?
   - **SÍ**: Crear en repo privado desde el inicio
   - **NO**: Crear en repo público, pero usar placeholders genéricos

2. **Usar templates**:

   ```markdown
   VPS IP: [TU-VPS-IP]
   Domain: [TU-DOMINIO]
   DB: postgresql://[user]:[pass]@[host]:5432/[db]
   ```

3. **Marcar claramente**:
   ```markdown
   # ⚠️ VERSIÓN PÚBLICA - Sin datos sensibles

   # 🔒 VERSIÓN PRIVADA - Ver repo privado
   ```

### Variables de Entorno

1. **SIEMPRE usar `.env.local` para valores reales**:

   ```bash
   cp .env.example .env.local
   # Editar .env.local (ya protegido por .gitignore)
   ```

2. **NUNCA commitear `.env.local`**:

   ```bash
   git status | grep ".env.local"  # No debe aparecer nada
   ```

3. **En Dokploy, usar UI para variables**:
   - NO crear archivos .env en VPS commiteados
   - Configurar en Dokploy → Environment Variables
   - Documentar LISTA de variables (no valores) en repo privado

---

## 🚨 Plan de Respuesta a Incidentes

### Nivel 1: Leak Detectado ANTES de Push

```bash
# Reset y corregir
git reset --soft HEAD~1
nano [archivo-con-leak]  # Sanitizar
git add .
git commit -m "docs: sanitizar información sensible"
```

### Nivel 2: Leak Detectado DESPUÉS de Push (< 5 min)

```bash
# Force reset (rápido)
git reset --hard HEAD~1
git push --force

# Rotar secrets expuestos
```

### Nivel 3: Leak Detectado DESPUÉS de Push (> 5 min)

⚠️ **ASUMIR QUE FUE INDEXADO**

```bash
# 1. NO forzar, hacer commit sanitizador
git add .
git commit -m "security: sanitizar datos expuestos"
git push

# 2. ROTACIÓN INMEDIATA:
# - Cambiar passwords DB
# - Regenerar JWT_SECRET, SESSION_SECRET
# - Cambiar IP VPS (si crítico y posible)
# - Revisar logs de acceso

# 3. Documentar incidente en repo privado
# 4. Considerar repo privado temporal
```

---

## 📊 Estructura Completa de Archivos

### Repositorio Público (informaticadiaz/amauta)

```
amauta/
├── docs/
│   └── technical/
│       ├── vps-deployment-analysis.md        ✅ SANITIZADO
│       ├── PRIVATE_DATA_STORAGE.md           ✅ Guía almacenamiento
│       ├── SECURITY_README.md                ✅ Este archivo
│       ├── environment-variables.md          ✅ Estrategia variables
│       ├── architecture.md                   ✅ Arquitectura
│       └── setup.md                          ✅ Setup local
├── .github/
│   └── SECURITY_SANITIZATION.md              ✅ Guía sanitización
├── apps/
│   ├── api/
│   │   ├── .env.example                      ✅ Template público
│   │   ├── .env.production.example           ✅ Template público
│   │   └── .env.local                        🔒 Gitignored
│   └── web/
│       ├── .env.example                      ✅ Template público
│       ├── .env.production.example           ✅ Template público
│       └── .env.local                        🔒 Gitignored
└── .gitignore                                ✅ Protección

NUNCA en repo público:
❌ IPs reales
❌ Dominios de producción sin sanitizar
❌ Credenciales
❌ Secrets
❌ Configuraciones específicas de VPS
```

### Repositorio Privado (amauta-deployment-private)

```
amauta-deployment-private/
├── deployment/
│   ├── vps-analysis-FULL.md                  🔒 CON DATOS REALES
│   ├── production-configs/
│   │   ├── .env.api.production.local         🔒 Valores reales API
│   │   ├── .env.web.production.local         🔒 Valores reales Web
│   │   ├── dokploy-api-config.md             🔒 Config Dokploy
│   │   ├── dokploy-web-config.md             🔒 Config Dokploy
│   │   └── cloudflare-dns.md                 🔒 DNS records
│   ├── credentials/
│   │   ├── database-credentials.md           🔒 DB user/pass/host
│   │   ├── secrets.md                        🔒 JWT, secrets
│   │   └── ssh-access.md                     🔒 VPS IP, SSH
│   └── runbooks/
│       ├── deployment-checklist.md           🔒 Comandos reales
│       ├── backup-restore.md                 🔒 Procedimientos
│       └── incident-response.md              🔒 Respuesta incidentes
├── scripts/
│   ├── deploy-api.sh                         🔒 Deploy script API
│   ├── deploy-web.sh                         🔒 Deploy script Web
│   ├── backup-production.sh                  🔒 Backup script
│   └── health-check.sh                       🔒 Health check URLs reales
└── README.md                                 🔒 Índice privado
```

### Gestor de Passwords (1Password/Bitwarden)

```
Vault: Amauta Production
├── Login: VPS SSH
│   ├── username: root
│   ├── password/key: [tu-clave]
│   └── server: [tu-ip]
├── Login: PostgreSQL amauta_prod
│   ├── server: [host]
│   ├── database: amauta_prod
│   ├── username: amauta_user
│   └── password: [tu-password]
├── Secure Note: JWT Secrets
│   ├── JWT_SECRET: [generado]
│   ├── SESSION_SECRET: [generado]
│   └── NEXTAUTH_SECRET: [generado]
└── Secure Note: Enlaces
    ├── Repo privado: github.com/.../amauta-deployment-private
    └── Documentación VPS externa
```

---

## 🔗 Enlaces Rápidos

### Documentación en Este Repo (Público)

- [Análisis VPS Sanitizado](vps-deployment-analysis.md) - Plan completo con placeholders
- [Almacenamiento Privado](PRIVATE_DATA_STORAGE.md) - Cómo guardar datos reales
- [Guía de Sanitización](../../.github/SECURITY_SANITIZATION.md) - Checklist de seguridad
- [Variables de Entorno](environment-variables.md) - Estrategia de seguridad

### Repositorios

- **Público**: https://github.com/informaticadiaz/amauta
- **Privado**: https://github.com/informaticadiaz/amauta-deployment-private (crear)

### Herramientas

- **GitHub CLI**: `gh repo create amauta-deployment-private --private`
- **git-secrets**: https://github.com/awslabs/git-secrets
- **truffleHog**: https://github.com/trufflesecurity/trufflehog

---

## ✅ Estado Actual

- [x] Análisis VPS sanitizado creado (`vps-deployment-analysis.md`)
- [x] Guía de almacenamiento privado creada (`PRIVATE_DATA_STORAGE.md`)
- [x] Guía de sanitización creada (`SECURITY_SANITIZATION.md`)
- [x] Este índice maestro creado (`SECURITY_README.md`)
- [ ] Repositorio privado por crear (acción del usuario)
- [ ] Análisis completo por migrar a repo privado (acción del usuario)
- [ ] Configurar gestor de passwords (opcional, acción del usuario)

---

## 📞 Soporte

**En caso de duda**:

1. Consultar esta guía
2. Revisar `PRIVATE_DATA_STORAGE.md` para opciones
3. Usar `SECURITY_SANITIZATION.md` para sanitizar

**En caso de leak accidental**:

1. Seguir "Plan de Respuesta a Incidentes" arriba
2. Documentar en repo privado
3. Actualizar secrets afectados

---

**Última actualización**: 2025-12-19

**Mantenido por**: Equipo Amauta

**Revisión**: Trimestral (próxima: 2025-03-19)
