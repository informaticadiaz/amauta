# 🛡️ Guía de Sanitización de Información Sensible

> **Para**: Desarrolladores y colaboradores de Amauta
> **Propósito**: Prevenir leaks de información sensible en repositorio público

---

## ⚠️ Datos que NUNCA deben commitearse

### 🚨 Críticos (Impacto Alto)

- **IPs de servidores**: `72.60.144.210`, `192.168.1.100`, etc.
- **Credenciales de DB**: usuarios, passwords, connection strings completos
- **Secrets**: JWT_SECRET, SESSION_SECRET, API_KEYS, etc.
- **Contraseñas SSH**: passwords, private keys
- **Tokens de API**: GitHub, Cloudflare, servicios externos

### ⚠️ Sensibles (Impacto Medio)

- **Dominios de producción**: URLs completas con subdominios
- **Nombres de contenedores Docker**: nombres específicos de producción
- **Configuraciones específicas**: paths absolutos del VPS
- **Nombres de proyectos reales**: en producción
- **Información de infraestructura**: arquitectura detallada

### ℹ️ Preferible Ocultar (Impacto Bajo)

- **Nombres de usuarios no públicos**: usuarios de sistema
- **Emails privados**: direcciones no públicas
- **Números de versión específicos**: de servicios internos

---

## ✅ Reglas de Sanitización

### 1. IPs de Servidores

```markdown
# ❌ MAL - Expone IP real

VPS IP: 72.60.144.210
ssh root@72.60.144.210

# ✅ BIEN - Usa placeholder

VPS IP: [TU-VPS-IP]
ssh root@[TU-VPS-IP]

# ✅ ALTERNATIVA - Usa ejemplo genérico

VPS IP: 192.0.2.100 (ejemplo)
ssh root@[YOUR-SERVER-IP]
```

### 2. Dominios y URLs

```markdown
# ❌ MAL

https://amauta.diazignacio.ar
https://amauta-api.diazignacio.ar
supabase.diazignacio.ar

# ✅ BIEN

https://amauta.[TU-DOMINIO]
https://amauta-api.[TU-DOMINIO]
[subdomain].[TU-DOMINIO]

# ✅ ALTERNATIVA

https://amauta.example.com
https://amauta-api.example.com
```

### 3. Credenciales de Base de Datos

```markdown
# ❌ MAL

DATABASE_URL=postgresql://amauta_user:MySecretPass123@72.60.144.210:5432/amauta_prod

# ✅ BIEN

DATABASE_URL=postgresql://[USUARIO]:[PASSWORD]@[HOST]:5432/amauta_prod

# ✅ ALTERNATIVA

DATABASE_URL=postgresql://user:password@localhost:5432/amauta_prod
```

### 4. Secrets (JWT, API Keys)

```markdown
# ❌ MAL

JWT_SECRET=kX9mP2vL8qR4sT7wY3nA6bE1cF5gH0jK
NEXTAUTH_SECRET=9f8e7d6c5b4a3210fedcba9876543210

# ✅ BIEN

JWT_SECRET=[GENERAR CON: openssl rand -base64 32]
NEXTAUTH_SECRET=[TU-SECRET-GENERADO]

# ✅ ALTERNATIVA

JWT_SECRET=your-super-secret-jwt-key-change-in-production
NEXTAUTH_SECRET=change-this-to-a-secure-random-string
```

### 5. Nombres de Contenedores Docker

```markdown
# ❌ MAL

docker logs supabase-ec2f-edge-functions
docker exec -it gymsoft-postgres psql

# ✅ BIEN

docker logs [edge-functions-container]
docker exec -it [postgres-container] psql

# ✅ ALTERNATIVA

docker logs amauta-edge-functions # Nombre genérico del proyecto
```

### 6. Comandos SSH

```markdown
# ❌ MAL

ssh root@72.60.144.210
scp file.txt root@72.60.144.210:/root/app/

# ✅ BIEN

ssh root@[TU-VPS-IP]
scp file.txt root@[TU-VPS-IP]:/root/app/

# ✅ ALTERNATIVA

ssh root@[YOUR-SERVER]
```

### 7. Configuraciones de Servicios

```markdown
# ❌ MAL

curl https://supabase.diazignacio.ar/functions/v1/check-payment
Host: supabase.diazignacio.ar

# ✅ BIEN

curl https://[TU-SUPABASE-URL]/functions/v1/check-payment
Host: [TU-SUPABASE-URL]

# ✅ ALTERNATIVA

curl https://your-supabase.example.com/functions/v1/check-payment
```

---

## 🔍 Checklist Pre-Commit

Antes de cada commit, ejecutar:

```bash
# 1. Ver cambios staged
git diff --staged

# 2. Buscar IPs
git diff --staged | grep -E "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}"

# 3. Buscar dominios específicos
git diff --staged | grep -i "diazignacio.ar"

# 4. Buscar passwords
git diff --staged | grep -iE "password.*=.*[^(example|cambiar)]"

# 5. Buscar secrets
git diff --staged | grep -iE "(secret|api[_-]?key).*=.*[^(ejemplo|example)]"

# Si alguno encuentra coincidencias, revisar y sanitizar
```

---

## 🤖 Automatización (Futuro)

### Pre-commit Hook

Crear `.husky/pre-commit-security`:

```bash
#!/bin/sh

# Buscar datos sensibles
if git diff --cached | grep -qE "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}"; then
  echo "⚠️  WARNING: Posible IP detectada en el commit"
  echo "Por favor revisa los cambios antes de continuar"
  git diff --cached | grep -E "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}"
  read -p "¿Continuar de todos modos? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi
```

### GitHub Secret Scanning

GitHub detecta automáticamente algunos patrones. Para proyectos públicos, estos están habilitados por defecto:

- API keys conocidas (AWS, Google, etc.)
- Tokens de OAuth
- Private keys

**Nota**: GitHub NO detecta:

- IPs personalizadas
- Dominios propios
- Secrets personalizados (JWT_SECRET, etc.)

---

## 📝 Plantillas de Reemplazo

### Para Documentación

```markdown
# Template para análisis/guías

VPS IP: [TU-VPS-IP]
Dominio: [TU-DOMINIO]
API URL: https://api.[TU-DOMINIO]
DB Host: [DB-HOST]
DB User: [DB-USER]
DB Password: [DB-PASSWORD]
Container: [NOMBRE-CONTAINER]
```

### Para Variables de Entorno

```env
# Template .env.example
DATABASE_URL=postgresql://usuario:password@localhost:5432/dbname
API_URL=http://localhost:3001
JWT_SECRET=genera-uno-seguro-con-openssl-rand
```

### Para Scripts

```bash
#!/bin/bash
# Template script deployment
VPS_IP="[TU-VPS-IP]"
DOMAIN="[TU-DOMINIO]"
DB_PASSWORD="[TU-PASSWORD]"

# Usar variables
ssh root@$VPS_IP "docker ps"
```

---

## 🚨 Respuesta a Leak Accidental

### Si detectas ANTES de push:

```bash
# 1. Reset del último commit
git reset --soft HEAD~1

# 2. Editar archivos y sanitizar
nano archivo-con-leak.md

# 3. Volver a commitear
git add .
git commit -m "docs: sanitizar información sensible"
```

### Si detectas DESPUÉS de push (< 5 min):

```bash
# 1. Force reset (PELIGROSO, úsalo rápido)
git reset --hard HEAD~1
git push --force

# 2. Rotar TODOS los secrets expuestos
# 3. Documentar incidente
```

### Si detectas DESPUÉS de push (> 5 min):

```bash
# Asumir que fue indexado por GitHub/bots

# 1. NO forzar push, hacer commit sanitizador
git add .
git commit -m "security: sanitizar datos expuestos accidentalmente"
git push

# 2. ROTAR INMEDIATAMENTE:
#    - Cambiar passwords de DB
#    - Regenerar JWT_SECRET, SESSION_SECRET
#    - Cambiar IP del VPS (si es crítico y posible)
#    - Revisar logs de acceso no autorizado

# 3. Documentar en repo privado
# 4. Considerar hacer repo privado temporalmente

# 5. Contactar GitHub Support si es muy crítico
```

---

## 📚 Ejemplos Reales

### Ejemplo 1: Análisis VPS

**❌ VERSIÓN CON LEAKS**:

```markdown
# Análisis VPS

VPS IP: 72.60.144.210
Dominio: supabase.diazignacio.ar
PostgreSQL: postgresql://gymsoft:MyP@ss2024@72.60.144.210:5432/gymsoft_prod

Comandos:
ssh root@72.60.144.210
docker logs supabase-ec2f-edge-functions
```

**✅ VERSIÓN SANITIZADA**:

```markdown
# Análisis VPS

VPS IP: [TU-VPS-IP]
Dominio: [subdomain].[TU-DOMINIO]
PostgreSQL: postgresql://[user]:[password]@[host]:5432/[database]

Comandos:
ssh root@[TU-VPS-IP]
docker logs [edge-functions-container]
```

### Ejemplo 2: Variables de Entorno

**❌ VERSIÓN CON LEAKS**:

```env
DATABASE_URL=postgresql://amauta:SecureP@ss123@192.168.1.100:5432/amauta_prod
JWT_SECRET=kX9mP2vL8qR4sT7wY3nA6bE1cF5gH0jK
API_URL=https://amauta-api.diazignacio.ar
```

**✅ VERSIÓN SANITIZADA**:

```env
DATABASE_URL=postgresql://[usuario]:[password]@[host]:5432/amauta_prod
JWT_SECRET=[GENERAR CON: openssl rand -base64 32]
API_URL=https://amauta-api.[TU-DOMINIO]
```

### Ejemplo 3: Script de Deployment

**❌ VERSIÓN CON LEAKS**:

```bash
#!/bin/bash
ssh root@72.60.144.210 << 'EOF'
  cd /root/gymsoft
  docker exec gymsoft-db pg_dump -U gymsoft_user gymsoft_prod > backup.sql
  curl https://api.gymsoft.diazignacio.ar/health
EOF
```

**✅ VERSIÓN SANITIZADA**:

```bash
#!/bin/bash
# Variables de configuración (definir en .env local)
VPS_IP="${VPS_IP:-[TU-VPS-IP]}"
APP_DIR="${APP_DIR:-/root/[APP-NAME]}"
DB_CONTAINER="${DB_CONTAINER:-[db-container]}"

ssh root@$VPS_IP << 'EOF'
  cd $APP_DIR
  docker exec $DB_CONTAINER pg_dump -U [db-user] [db-name] > backup.sql
  curl https://api.[TU-DOMINIO]/health
EOF
```

---

## ✅ Verificación Final

Antes de considerar un documento "seguro para repo público":

- [ ] No contiene IPs reales de servidores
- [ ] No contiene dominios de producción sin sanitizar
- [ ] No contiene credenciales (usuarios, passwords)
- [ ] No contiene secrets (JWT, API keys)
- [ ] No contiene nombres específicos de contenedores/proyectos
- [ ] Usa placeholders tipo `[TU-XXX]` o ejemplos genéricos
- [ ] Incluye advertencia: "⚠️ VERSIÓN PÚBLICA - Sin datos sensibles"
- [ ] Referencia a dónde encontrar versión completa (repo privado)

---

## 📞 Recursos

### Documentación Relacionada

- `docs/technical/PRIVATE_DATA_STORAGE.md` - Dónde guardar datos reales
- `docs/technical/environment-variables.md` - Estrategia de variables
- `.gitignore` - Archivos protegidos

### Herramientas de Detección

```bash
# git-secrets
brew install git-secrets
git secrets --install
git secrets --scan

# truffleHog
pip install truffleHog
truffleHog --regex --entropy=False https://github.com/[user]/[repo]
```

### Contacto

- **Emergencia de seguridad**: Crear issue privado en repo privado
- **GitHub Support**: https://support.github.com/

---

**Última actualización**: 2025-12-19

**Versión**: 1.0
