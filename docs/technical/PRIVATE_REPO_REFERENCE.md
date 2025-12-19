# 🔗 Referencia a Repositorio Privado

> **Nota**: Este repositorio (amauta) es **PÚBLICO**. Información sensible se mantiene en repositorio **PRIVADO**.

---

## 🔒 Repositorio Privado

**Nombre**: `amauta-deployment-private`
**URL**: https://github.com/informaticadiaz/amauta-deployment-private
**Visibilidad**: **PRIVATE** (solo accesible con autorización)

---

## 📂 Contenido del Repositorio Privado

El repositorio privado contiene:

### Análisis VPS Completo

- `deployment/vps-analysis-FULL.md` - Análisis con datos reales (IP, dominios, configuraciones)

### Credenciales

- `deployment/credentials/ssh-access.md` - IP VPS, usuario, password/key SSH
- `deployment/credentials/database-credentials.md` - Credenciales PostgreSQL, connection strings
- `deployment/credentials/secrets.md` - JWT_SECRET, SESSION_SECRET, API keys

### Configuraciones de Producción

- `deployment/production-configs/.env.api.production.local` - Variables API con valores reales
- `deployment/production-configs/.env.web.production.local` - Variables Web con valores reales
- `deployment/production-configs/dokploy-api-config.md` - Configuración Dokploy API
- `deployment/production-configs/dokploy-web-config.md` - Configuración Dokploy Web
- `deployment/production-configs/cloudflare-dns.md` - Registros DNS

### Scripts de Deployment

- `scripts/deploy-api.sh` - Script de deployment API
- `scripts/deploy-web.sh` - Script de deployment Web
- `scripts/backup-production.sh` - Script de backup
- `scripts/health-check.sh` - Health check con URLs reales

### Runbooks

- `deployment/runbooks/deployment-checklist.md` - Checklist con comandos reales
- `deployment/runbooks/backup-restore.md` - Procedimientos de backup
- `deployment/runbooks/incident-response.md` - Respuesta a incidentes
- `deployment/runbooks/maintenance.md` - Mantenimiento rutinario

---

## 📄 Documentación en Repositorio Público (Este Repo)

Este repositorio contiene documentación **SANITIZADA** (sin datos sensibles):

- `docs/technical/vps-deployment-analysis.md` ✅ - Plan completo con placeholders
- `docs/technical/PRIVATE_DATA_STORAGE.md` ✅ - Guía de almacenamiento seguro
- `docs/technical/SECURITY_README.md` ✅ - Índice de seguridad
- `.github/SECURITY_SANITIZATION.md` ✅ - Guía de sanitización

---

## 🎯 Cuándo Usar Cada Repo

### Usar Repositorio Público (este)

- ✅ Código fuente del proyecto
- ✅ Documentación técnica general
- ✅ Templates y ejemplos
- ✅ Guías con placeholders (`[TU-VPS-IP]`, etc.)
- ✅ Contribuciones de la comunidad

### Usar Repositorio Privado

- 🔒 Datos reales de infraestructura
- 🔒 Credenciales y passwords
- 🔒 IPs y dominios de producción
- 🔒 Secrets (JWT, API keys)
- 🔒 Configuraciones específicas del VPS
- 🔒 Scripts con valores reales

---

## 🚀 Acceso al Repositorio Privado

### Clonar Repositorio Privado

```bash
# Necesitas acceso autorizado
gh repo clone informaticadiaz/amauta-deployment-private

# O con HTTPS
git clone https://github.com/informaticadiaz/amauta-deployment-private.git
```

### Verificar Acceso

```bash
gh repo view informaticadiaz/amauta-deployment-private
```

Si ves "Not Found", no tienes acceso. Contactar al maintainer.

---

## 📋 Workflow de Trabajo

### Al Crear Documentación Nueva

1. **Pregunta**: ¿Contiene datos sensibles?
   - **SÍ** → Crear en repo privado
   - **NO** → Crear en repo público (este)

2. **Si tiene datos sensibles**:

   ```bash
   cd ~/amauta-deployment-private
   nano deployment/[archivo].md
   git add .
   git commit -m "docs: agregar [descripción]"
   git push
   ```

3. **Si es documentación general**:
   ```bash
   cd ~/amauta
   # Usar placeholders: [TU-VPS-IP], [TU-DOMINIO]
   nano docs/technical/[archivo].md
   git add .
   git commit -m "docs: agregar [descripción]"
   git push
   ```

### Al Trabajar con Credenciales

1. **Consultar** repo privado:

   ```bash
   cd ~/amauta-deployment-private
   cat deployment/credentials/ssh-access.md
   ```

2. **Actualizar** cuando cambien:

   ```bash
   nano deployment/credentials/ssh-access.md
   git commit -m "chore: actualizar credenciales SSH"
   git push
   ```

3. **NUNCA** copiar a repo público

---

## 🛡️ Seguridad

### Mantener Repositorio Privado

- ✅ Verificar periódicamente que siga siendo privado
- ✅ No compartir acceso sin autorización
- ✅ Rotar secrets cada 3-6 meses
- ✅ Documentar cambios importantes

### En Caso de Compromiso

Si el repositorio privado se hace público accidentalmente:

1. **Inmediatamente**:
   - Hacer privado nuevamente
   - Rotar TODAS las credenciales
   - Cambiar secrets
   - Revisar logs de acceso

2. **Documentar incidente**:
   - En repo privado: `deployment/runbooks/incident-response.md`
   - Fecha, qué se expuso, acciones tomadas

---

## 🔗 Enlaces Relacionados

### Repositorios

- **Público**: https://github.com/informaticadiaz/amauta
- **Privado**: https://github.com/informaticadiaz/amauta-deployment-private

### Documentación de Seguridad (en este repo)

- [Análisis VPS Sanitizado](vps-deployment-analysis.md)
- [Guía de Almacenamiento Privado](PRIVATE_DATA_STORAGE.md)
- [Índice de Seguridad](SECURITY_README.md)
- [Guía de Sanitización](../../.github/SECURITY_SANITIZATION.md)

---

## 📞 Contacto

**Maintainer**: Ignacio Díaz
**Para solicitar acceso**: Contactar directamente

---

**Última actualización**: 2025-12-19
