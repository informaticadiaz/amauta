# Estrategia de Variables de Entorno - Amauta

## 🔒 Filosofía de Seguridad

**Principio fundamental**: **NUNCA** commitear información sensible al repositorio público.

Toda información sensible (contraseñas, API keys, secrets, IPs de producción) debe vivir **exclusivamente en archivos `.local`** que están protegidos por `.gitignore`.

---

## 📂 Estructura de Archivos

### **Archivos que SÍ se suben al repo (públicos)**

```
apps/api/
  ├── .env.example              ✅ Template para desarrollo local
  └── .env.production.example   ✅ Template para producción

apps/web/
  ├── .env.example              ✅ Template para desarrollo local
  └── .env.production.example   ✅ Template para producción
```

Estos archivos contienen:

- 📋 Lista completa de variables necesarias
- 📝 Documentación de cada variable
- 🎯 Valores de ejemplo (NO reales)
- ⚠️ Advertencias de seguridad

### **Archivos que NUNCA se suben (privados)**

```
apps/api/
  ├── .env.local                🔒 Desarrollo local (valores reales)
  └── .env.production.local     🔒 Producción (valores reales)

apps/web/
  ├── .env.local                🔒 Desarrollo local (valores reales)
  └── .env.production.local     🔒 Producción (valores reales)
```

Estos archivos contienen:

- 🔑 Passwords reales
- 🔐 API keys reales
- 🌐 URLs de producción
- 💳 Credenciales de servicios

**Protección**: Están en `.gitignore` y **nunca deben commitearse**.

---

## 🚀 Workflow de Desarrollo

### **1. Desarrollador nuevo clona el proyecto**

```bash
# 1. Clonar repo
git clone https://github.com/tu-org/amauta.git
cd amauta

# 2. Crear archivos locales desde ejemplos
cd apps/api
cp .env.example .env.local

cd ../web
cp .env.example .env.local

# 3. Editar .env.local con valores reales de desarrollo
# (Base de datos local, secrets generados, etc.)

# 4. Nunca commitear estos archivos
git status  # No deben aparecer .env.local
```

### **2. Durante el desarrollo**

```bash
# Leer variables
# Backend (apps/api/src/config/env.ts)
import { env } from './config/env';
console.log(env.DATABASE_URL);  // Valor de .env.local

# Frontend (apps/web/src/config/env.ts)
import { env, clientEnv } from '@/config/env';
console.log(env.API_URL);                      // Server-side
console.log(clientEnv.NEXT_PUBLIC_API_URL);    // Client-side
```

### **3. Agregar nueva variable**

```bash
# 1. Agregar a .env.example (con valor de ejemplo)
echo "NEW_API_KEY=ejemplo-api-key-cambiar-en-local" >> apps/api/.env.example

# 2. Agregar a .env.local (con valor real)
echo "NEW_API_KEY=mi-api-key-real-secreta" >> apps/api/.env.local

# 3. Agregar validación en src/config/env.ts
# 4. Documentar en este archivo
# 5. Commitear .env.example (NO .env.local)
git add apps/api/.env.example
git commit -m "feat: agregar soporte para NEW_API_KEY"
```

---

## 🏗️ Deployment en Producción

### **Opción A: Dokploy (Recomendado)**

```bash
# 1. En tu máquina local, crear .env.production.local
cd apps/api
cp .env.production.example .env.production.local
# Editar y poner valores REALES de producción

# 2. En Dokploy UI:
# - Ir a aplicación → Environment Variables
# - Copiar/pegar variables de .env.production.local
# - NUNCA commitear este archivo al repo

# 3. Deploy
# - Dokploy hace pull del repo (sin .env.production.local)
# - Inyecta las variables configuradas en UI
# - Build y run con variables de producción
```

**Ventajas Dokploy**:

- ✅ Variables en UI, no en archivos
- ✅ Fácil actualizar sin rebuild
- ✅ Logs no exponen variables
- ✅ Rotación de secrets sin downtime

### **Opción B: Docker Compose en VPS**

```bash
# 1. En el VPS, crear archivos .local
ssh root@tu-vps
cd /root/amauta/apps/api
cp .env.production.example .env.production.local
nano .env.production.local  # Editar valores reales

# 2. En docker-compose.yml (en el VPS, NO en repo)
services:
  api:
    env_file:
      - ./apps/api/.env.production.local  # Archivo local del VPS

# 3. Deploy
docker-compose up -d
```

### **Opción C: GitHub Actions + Secrets**

```yaml
# .github/workflows/deploy.yml (en repo público)
- name: Deploy API
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
  run: |
    # Deploy usando secrets de GitHub
```

Configurar secrets en: **GitHub repo → Settings → Secrets and variables → Actions**

---

## 📋 Checklist de Seguridad

### **Antes de cada commit**

- [ ] Verificar que no hay archivos `.env.local` en staging:

  ```bash
  git status | grep ".env.local"
  # No debe mostrar nada
  ```

- [ ] Verificar que .gitignore protege archivos sensibles:

  ```bash
  cat .gitignore | grep ".env"
  # Debe mostrar .env*.local
  ```

- [ ] Buscar secrets accidentales en código:
  ```bash
  git diff | grep -i "password\|secret\|key" | grep -v "example"
  # Verificar que no hay valores reales
  ```

### **Rotación de Secrets (cada 3-6 meses)**

- [ ] Generar nuevos JWT_SECRET y SESSION_SECRET:

  ```bash
  openssl rand -base64 32
  ```

- [ ] Actualizar en .env.production.local (local)
- [ ] Actualizar en Dokploy UI o VPS
- [ ] Restart aplicación
- [ ] Invalidar sesiones antiguas (opcional)

### **En caso de leak de secrets**

1. **Rotación inmediata** de todos los secrets expuestos
2. **Invalidar** sesiones/tokens activos
3. **Cambiar** passwords de base de datos
4. **Revisar** logs por accesos no autorizados
5. **Documentar** incidente (changelog privado)

---

## 🎓 Ejemplos Prácticos

### **Ejemplo 1: Configurar nueva instancia de producción**

```bash
# En tu máquina local (NO en el VPS)
cd ~/amauta

# 1. Crear archivo de producción
cd apps/api
cp .env.production.example .env.production.local

# 2. Editar con valores reales
nano .env.production.local
# Cambiar:
# - DATABASE_URL=postgresql://amauta:REAL_PASSWORD@YOUR_VPS_IP:5432/amauta_prod
# - JWT_SECRET=<resultado de: openssl rand -base64 32>
# - API_URL=https://api.amauta.your-domain.com
# - CORS_ORIGIN=https://amauta.your-domain.com

# 3. Copiar valores a Dokploy
# - Abrir Dokploy UI
# - Ir a aplicación amauta-api → Environment Variables
# - Copiar/pegar variables (sin comillas ni espacios extra)
# - Save

# 4. Deploy
# - Dokploy hace pull del repo
# - Usa las variables configuradas
# - Listo ✅

# 5. NUNCA hacer esto:
git add apps/api/.env.production.local  # ❌ NUNCA
```

### **Ejemplo 2: Compartir configuración con equipo**

```bash
# ❌ NUNCA hacer esto:
# - Enviar .env.local por email
# - Subir .env.local a Slack/Discord
# - Commitear .env.local "solo una vez"

# ✅ Hacer esto:
# 1. Usar gestor de secrets (1Password, Bitwarden)
# 2. Compartir valores individualmente de forma segura
# 3. Cada desarrollador crea su propio .env.local
# 4. Documentar DÓNDE obtener valores (no los valores mismos)
```

### **Ejemplo 3: Variables en CI/CD**

```yaml
# .github/workflows/test.yml (público)
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    env:
      # Valores de prueba (NO producción)
      DATABASE_URL: postgresql://test:test@localhost:5432/test
      JWT_SECRET: test-secret-only-for-ci
    steps:
      - uses: actions/checkout@v3
      - run: npm test
```

---

## 🔗 Referencias

- **Archivos relacionados**:
  - `apps/api/.env.example`
  - `apps/api/.env.production.example`
  - `apps/api/src/config/env.ts`
  - `apps/web/.env.example`
  - `apps/web/.env.production.example`
  - `apps/web/src/config/env.ts`

- **Documentación**:
  - [Setup Guide](./setup.md) - Configuración inicial
  - [Deployment Guide](./deployment.md) - Deploy a producción
  - [Security Best Practices](./security.md) - Mejores prácticas

- **Herramientas útiles**:
  - [1Password](https://1password.com/) - Gestor de passwords
  - [Bitwarden](https://bitwarden.com/) - Open source password manager
  - [dotenv-vault](https://www.dotenv.org/docs/security/vault) - Encrypt .env files

---

## ❓ FAQ

### **¿Puedo compartir mi .env.local con el equipo?**

❌ No. Cada desarrollador debe crear su propio `.env.local` siguiendo `.env.example`.

### **¿Cómo comparto un nuevo secret con el equipo?**

✅ Usa un gestor de passwords seguro, o comunícalo de forma privada (no en chat público).

### **¿Qué hago si accidentalmente commiteé un .env.local?**

1. **NO** hacer `git push` todavía
2. Remover del historial: `git rm --cached apps/api/.env.local`
3. Commit: `git commit -m "remove sensitive file"`
4. Si ya hiciste push: rotar TODOS los secrets inmediatamente

### **¿Puedo usar .env en lugar de .env.local?**

❌ No. `.env` también está en `.gitignore`, pero usamos `.env.local` por convención para distinguir de otros entornos.

### **¿Las variables NEXT*PUBLIC*\* son seguras?**

⚠️ Parcialmente. Se incluyen en el bundle JavaScript y son **visibles en el browser**. Nunca uses `NEXT_PUBLIC_*` para secrets.

---

_Última actualización: 2025-12-18_
