# 🔒 Guía de Almacenamiento Seguro de Datos Sensibles

> **Propósito**: Este documento explica cómo manejar información sensible del proyecto Amauta que NO debe estar en el repositorio público.

---

## ⚠️ Problema Identificado

El repositorio `informaticadiaz/amauta` es **PÚBLICO**. Cualquier información sensible commiteada aquí es visible para todo internet, incluyendo:

- ❌ Direcciones IP de servidores
- ❌ Nombres de dominio de producción
- ❌ Credenciales de base de datos
- ❌ Secrets (JWT, API keys, etc.)
- ❌ Nombres de contenedores Docker
- ❌ Información de infraestructura específica

---

## ✅ Soluciones Propuestas

### Opción 1: Repositorio Privado Separado (⭐ RECOMENDADA)

**Ventajas**:

- ✅ Máxima seguridad y control
- ✅ Historial de cambios con Git
- ✅ Fácil colaboración controlada
- ✅ Backup automático en GitHub
- ✅ Sincronización entre máquinas

**Implementación**:

```bash
# 1. Crear repositorio privado en GitHub
gh repo create amauta-deployment-private --private --description "Configuraciones privadas de deployment para Amauta"

# 2. Clonar en tu máquina
cd ~/
git clone https://github.com/informaticadiaz/amauta-deployment-private.git
cd amauta-deployment-private

# 3. Crear estructura
mkdir -p deployment/production-configs
mkdir -p deployment/credentials
mkdir -p scripts

# 4. Agregar README
cat > README.md << 'EOF'
# Amauta - Deployment Privado

⚠️ **REPOSITORIO PRIVADO** - NO hacer público

## Contenido

- `deployment/vps-analysis-FULL.md`: Análisis completo con datos reales
- `deployment/production-configs/`: Configuraciones de producción
- `deployment/credentials/`: Credenciales y secrets
- `scripts/`: Scripts de deployment personalizados

## Seguridad

- Mantener este repo SIEMPRE como privado
- No compartir acceso sin autorización
- Rotar secrets cada 3-6 meses
EOF

# 5. Hacer commit inicial
git add .
git commit -m "chore: configurar repositorio privado de deployment"
git push -u origin main
```

**Estructura propuesta**:

```
amauta-deployment-private/
├── README.md
├── deployment/
│   ├── vps-analysis-FULL.md              # Análisis con datos reales
│   ├── production-configs/
│   │   ├── .env.api.production.local     # Variables API reales
│   │   ├── .env.web.production.local     # Variables Web reales
│   │   ├── dokploy-api-config.md         # Config Dokploy API
│   │   ├── dokploy-web-config.md         # Config Dokploy Web
│   │   └── cloudflare-dns.md             # Registros DNS
│   ├── credentials/
│   │   ├── database-credentials.md       # User, pass, host DB
│   │   ├── secrets.md                    # JWT, session secrets
│   │   └── ssh-access.md                 # IP VPS, credenciales SSH
│   └── runbooks/
│       ├── deployment-checklist.md       # Checklist con comandos reales
│       ├── backup-restore.md             # Procedimientos backup
│       └── incident-response.md          # Respuesta a incidentes
├── scripts/
│   ├── deploy-api.sh                     # Script deployment API
│   ├── deploy-web.sh                     # Script deployment Web
│   ├── backup-production.sh              # Backup completo
│   └── health-check.sh                   # Health check con URLs reales
└── .gitignore
```

---

### Opción 2: Branch Privado (❌ NO POSIBLE)

**Realidad**: GitHub NO permite branches privados en repositorios públicos.

**Explicación**: Si el repo es público, todas sus ramas son públicas. No hay forma de hacer una rama privada.

**Alternativa**: Usar Opción 1 (repositorio separado privado).

---

### Opción 3: Gestor de Passwords (✅ COMPLEMENTARIA)

**Ventajas**:

- ✅ Muy seguro (encriptado end-to-end)
- ✅ Acceso desde múltiples dispositivos
- ✅ Backup automático
- ✅ Búsqueda rápida

**Desventajas**:

- ❌ No tiene historial de versiones
- ❌ Difícil editar documentos largos
- ❌ No permite colaboración con Git

**Uso recomendado**: Para credenciales individuales, NO para documentos completos.

**Implementación (1Password)**:

```
Vault: Amauta Production
├── 🔐 VPS SSH Access
│   ├── IP: [tu-ip]
│   ├── User: root
│   └── Password/Key: [tu-clave]
├── 🔐 Database amauta_prod
│   ├── Host: localhost
│   ├── Port: 5432
│   ├── User: amauta_user
│   └── Password: [tu-password]
├── 🔐 JWT Secrets
│   ├── JWT_SECRET: [generado]
│   ├── SESSION_SECRET: [generado]
│   └── NEXTAUTH_SECRET: [generado]
└── 📄 Secure Notes
    └── VPS Analysis Complete (como documento)
```

**Implementación (Bitwarden)**:

```
Folder: Amauta/Production
├── Login: VPS SSH
├── Login: PostgreSQL amauta_prod
├── Secure Note: JWT Secrets
└── Secure Note: VPS Analysis Full
```

---

### Opción 4: Archivo Local Encriptado (✅ SIMPLE)

**Ventajas**:

- ✅ Control total
- ✅ No depende de servicios externos
- ✅ Fácil de implementar

**Desventajas**:

- ❌ No hay backup automático
- ❌ No sincroniza entre máquinas
- ❌ Riesgo de pérdida si el disco falla

**Implementación**:

```bash
# 1. Crear directorio seguro
mkdir -p ~/.amauta-secrets
chmod 700 ~/.amauta-secrets

# 2. Guardar análisis completo
cat > ~/.amauta-secrets/vps-analysis-FULL.md << 'EOF'
# Análisis VPS Completo (CON DATOS REALES)

[Aquí pegar todo el análisis con datos sin sanitizar]
EOF

# 3. (Opcional) Encriptar con GPG
gpg --symmetric --cipher-algo AES256 ~/.amauta-secrets/vps-analysis-FULL.md
# Esto crea: vps-analysis-FULL.md.gpg

# 4. Eliminar versión sin encriptar
rm ~/.amauta-secrets/vps-analysis-FULL.md

# Para desencriptar cuando necesites:
gpg --decrypt ~/.amauta-secrets/vps-analysis-FULL.md.gpg > vps-analysis-temp.md
# Leer el archivo
# Eliminar después: rm vps-analysis-temp.md
```

**Backup**:

```bash
# Backup periódico a USB externo o cloud encriptado
cp -r ~/.amauta-secrets /media/usb-backup/
# O encriptar y subir a Dropbox/Google Drive
tar czf amauta-secrets-backup.tar.gz ~/.amauta-secrets
gpg --symmetric --cipher-algo AES256 amauta-secrets-backup.tar.gz
```

---

## 🎯 Estrategia Recomendada (Híbrida)

Combinar múltiples opciones para máxima seguridad:

### 1. Repositorio Privado (Principal)

```
amauta-deployment-private/
└── deployment/
    ├── vps-analysis-FULL.md          # Documento maestro
    ├── production-configs/           # Configuraciones
    └── credentials/                  # Credenciales
```

**Uso**: Documentación completa, scripts, configuraciones.

### 2. Gestor de Passwords (Credenciales)

```
1Password Vault: Amauta
├── VPS SSH
├── Database Credentials
└── JWT/API Secrets
```

**Uso**: Solo credenciales críticas de acceso directo.

### 3. Local (Respaldo)

```
~/.amauta-secrets/
└── vps-analysis-FULL.md.gpg          # Copia encriptada local
```

**Uso**: Backup offline, acceso sin internet.

---

## 📋 Checklist de Migración de Datos

### Paso 1: Identificar Información Sensible

- [ ] IPs de servidores VPS
- [ ] Nombres de dominio de producción
- [ ] Nombres de contenedores Docker específicos
- [ ] Credenciales de base de datos (usuario, password, host)
- [ ] JWT_SECRET, SESSION_SECRET, NEXTAUTH_SECRET
- [ ] API keys de servicios externos
- [ ] URLs de producción completas
- [ ] Nombres de proyectos en producción
- [ ] Configuraciones específicas de Dokploy

### Paso 2: Crear Repositorio Privado

```bash
# Ejecutar comandos de Opción 1
gh repo create amauta-deployment-private --private
# ... resto de setup
```

### Paso 3: Copiar Análisis Completo

```bash
cd ~/amauta-deployment-private/deployment/

# Copiar el análisis ORIGINAL que te di (con datos reales)
# Guardarlo como vps-analysis-FULL.md
nano vps-analysis-FULL.md
# Pegar contenido completo, guardar

git add vps-analysis-FULL.md
git commit -m "docs: agregar análisis VPS completo con datos reales"
git push
```

### Paso 4: Verificar Repositorio Público

```bash
cd ~/amauta

# Verificar que NO haya datos sensibles
git log --all -p | grep -i "72.60.144"  # Buscar IP
git log --all -p | grep -i "diazignacio.ar"  # Buscar dominio

# Si encuentra algo, ver docs/technical/environment-variables.md
# sobre cómo sanitizar el historial
```

### Paso 5: Configurar .gitignore Reforzado

```bash
cd ~/amauta

# Verificar que estos patrones estén en .gitignore
cat >> .gitignore << 'EOF'

# Archivos privados (NUNCA commitear)
**/.env.local
**/.env.*.local
**/*-FULL.md
**/*-private.md
**/credentials/
**/secrets/
.amauta-secrets/

EOF

git add .gitignore
git commit -m "chore: reforzar .gitignore para datos sensibles"
git push
```

---

## 🛡️ Mejores Prácticas

### Para Documentación

1. **Siempre usar templates en repo público**:

   ```
   DATABASE_URL=postgresql://[USUARIO]:[PASSWORD]@[HOST]:5432/amauta_prod
   ```

2. **Datos reales solo en repo privado**:

   ```
   DATABASE_URL=postgresql://amauta_user:Xk9mP2...@192.168.1.100:5432/amauta_prod
   ```

3. **Marcar claramente documentos públicos vs privados**:
   ```markdown
   # ⚠️ VERSIÓN PÚBLICA - Sin datos sensibles

   # 🔒 VERSIÓN PRIVADA - Con datos reales
   ```

### Para Commits

1. **Nunca commitear en caliente**:

   ```bash
   git add .
   git diff --staged  # SIEMPRE revisar antes de commit
   git commit -m "..."
   ```

2. **Buscar datos sensibles antes de push**:

   ```bash
   git log -p -1 | grep -E "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}"
   ```

3. **Usar pre-commit hooks** (ya configurados en Amauta):
   ```bash
   # Los hooks de Husky ya previenen algunos leaks
   # Verificar que estén activos
   ls -la .husky/
   ```

### Para Variables de Entorno

1. **NUNCA usar valores reales en `.env.example`**:

   ```env
   # ❌ MAL
   DATABASE_URL=postgresql://real_user:real_pass@72.60.144.210:5432/prod

   # ✅ BIEN
   DATABASE_URL=postgresql://usuario:password@localhost:5432/amauta_dev
   ```

2. **Usar `.env.local` para valores reales** (ya configurado en Amauta):

   ```bash
   cp .env.example .env.local
   # Editar .env.local con valores reales
   # .gitignore ya protege .env.local
   ```

3. **En Dokploy, usar UI para variables** (no archivos):
   - Configurar en Dokploy → App → Environment Variables
   - NUNCA capturar pantallas con secrets visibles
   - Rotar secrets cada 3-6 meses

---

## 🚨 Plan de Respuesta a Leak

Si accidentalmente commiteas datos sensibles:

### 1. NO hagas `git push` todavía

```bash
# Si el commit solo está local
git reset --soft HEAD~1  # Deshacer último commit
# Editar archivos, remover datos sensibles
git add .
git commit -m "fix: remover datos sensibles"
```

### 2. Si ya hiciste push pero detectaste rápido (< 5 min)

```bash
# PELIGROSO: Reescribir historia
git reset --hard HEAD~1
git push --force

# Luego rotar TODOS los secrets expuestos inmediatamente
```

### 3. Si el push tiene > 5 min (asume que fue indexado)

```bash
# NO reescribir historia, GitHub ya lo cacheó

# 1. Rotar INMEDIATAMENTE todos los secrets expuestos
# 2. Cambiar contraseñas de base de datos
# 3. Cambiar IP del VPS (si es factible)
# 4. Revisar logs de acceso no autorizado
# 5. Hacer commit sanitizando datos:
git add .
git commit -m "security: sanitizar datos sensibles expuestos"
git push

# 6. Documentar incidente en repo privado
# 7. Considerar hacer el repo privado temporalmente
```

### 4. Herramientas de detección

```bash
# Buscar IPs en historial completo
git log --all -p | grep -E "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}"

# Buscar passwords
git log --all -p | grep -i "password.*=.*[^example]"

# Buscar API keys
git log --all -p | grep -iE "(api[_-]?key|secret[_-]?key).*=.*[^example]"

# Herramienta automatizada
# git-secrets (https://github.com/awslabs/git-secrets)
git secrets --scan
```

---

## 📊 Comparación de Opciones

| Opción               | Seguridad    | Facilidad  | Backup     | Colaboración | Costo    |
| -------------------- | ------------ | ---------- | ---------- | ------------ | -------- |
| **Repo Privado**     | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐   | Gratis   |
| **Gestor Passwords** | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐       | $2-5/mes |
| **Local Encriptado** | ⭐⭐⭐⭐     | ⭐⭐⭐     | ⭐⭐       | ⭐           | Gratis   |
| **Branch Privado**   | ❌ No existe | -          | -          | -            | -        |

**Recomendación**: Repo Privado + Gestor Passwords (híbrido).

---

## ✅ Próximos Pasos

### Acción Inmediata

1. **Crear repositorio privado**:

   ```bash
   gh repo create amauta-deployment-private --private
   cd ~/
   git clone https://github.com/informaticadiaz/amauta-deployment-private.git
   ```

2. **Migrar análisis completo**:
   - Copiar análisis original (con datos reales) a repo privado
   - Verificar que `vps-deployment-analysis.md` en repo público esté sanitizado ✅

3. **Configurar gestores de passwords**:
   - Agregar credenciales VPS a 1Password/Bitwarden
   - Agregar secrets (JWT, etc.)

### Mantenimiento Continuo

4. **Siempre revisar antes de commit**:

   ```bash
   git diff --staged  # Revisar cambios
   ```

5. **Rotación de secrets trimestral**:
   - Documentar en calendario
   - Proceso documentado en repo privado

6. **Auditoría semestral**:
   - Revisar repo público por leaks
   - Verificar que .gitignore esté actualizado

---

## 📞 Recursos Adicionales

### Documentación Relacionada

- `docs/technical/environment-variables.md` - Estrategia de variables
- `docs/technical/vps-deployment-analysis.md` - Versión sanitizada (pública) ✅
- `.gitignore` - Protección de archivos sensibles

### Herramientas Útiles

- **git-secrets**: https://github.com/awslabs/git-secrets
- **truffleHog**: https://github.com/trufflesecurity/trufflehog
- **GitHub Secret Scanning**: Activo automáticamente en repos

### Contactos de Emergencia

- GitHub Support: https://support.github.com/
- 1Password Support: https://support.1password.com/
- Bitwarden Support: https://bitwarden.com/contact/

---

**Última actualización**: 2025-12-19

**Autor**: Claude Code (por solicitud de seguridad del desarrollador)
