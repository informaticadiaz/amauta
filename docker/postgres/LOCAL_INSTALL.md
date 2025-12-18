# Instalación Local de PostgreSQL (sin Docker)

Esta guía explica cómo instalar y configurar PostgreSQL localmente sin usar Docker.

## Índice

- [Linux (Ubuntu/Debian)](#linux-ubuntudebian)
- [Linux (Fedora/RHEL)](#linux-fedorarhel)
- [macOS](#macos)
- [Windows](#windows)
- [Configuración Post-Instalación](#configuración-post-instalación)

---

## Linux (Ubuntu/Debian)

### 1. Instalar PostgreSQL

```bash
# Actualizar repositorios
sudo apt update

# Instalar PostgreSQL 15
sudo apt install postgresql-15 postgresql-contrib-15

# Verificar instalación
psql --version
```

### 2. Iniciar Servicio

```bash
# Iniciar PostgreSQL
sudo systemctl start postgresql

# Habilitar inicio automático
sudo systemctl enable postgresql

# Verificar estado
sudo systemctl status postgresql
```

### 3. Configurar Usuario y Base de Datos

```bash
# Cambiar a usuario postgres
sudo -i -u postgres

# Entrar a PostgreSQL
psql

# Ejecutar comandos SQL:
```

```sql
-- Crear usuario amauta
CREATE USER amauta WITH PASSWORD 'desarrollo123';

-- Crear base de datos
CREATE DATABASE amauta_dev;

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE amauta_dev TO amauta;

-- Hacer al usuario propietario
ALTER DATABASE amauta_dev OWNER TO amauta;

-- Salir
\q
```

### 4. Configurar Acceso Local

Editar `/etc/postgresql/15/main/pg_hba.conf`:

```bash
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

Agregar esta línea (antes de otras reglas locales):

```
# Permitir acceso local con contraseña
local   amauta_dev      amauta                                  md5
host    amauta_dev      amauta          127.0.0.1/32            md5
host    amauta_dev      amauta          ::1/128                 md5
```

Reiniciar PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### 5. Verificar Conexión

```bash
# Probar conexión
psql -U amauta -d amauta_dev -h localhost

# Debería pedirte la contraseña: desarrollo123
```

---

## Linux (Fedora/RHEL)

### 1. Instalar PostgreSQL

```bash
# Fedora
sudo dnf install postgresql-server postgresql-contrib

# RHEL/CentOS (requiere habilitar repositorio)
sudo yum install postgresql-server postgresql-contrib
```

### 2. Inicializar Base de Datos

```bash
# Inicializar cluster de base de datos
sudo postgresql-setup --initdb
```

### 3. Iniciar Servicio

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 4. Configurar Usuario y Base de Datos

```bash
sudo -i -u postgres
psql
```

```sql
CREATE USER amauta WITH PASSWORD 'desarrollo123';
CREATE DATABASE amauta_dev;
GRANT ALL PRIVILEGES ON DATABASE amauta_dev TO amauta;
ALTER DATABASE amauta_dev OWNER TO amauta;
\q
```

### 5. Configurar Acceso

Editar `/var/lib/pgsql/data/pg_hba.conf`:

```bash
sudo nano /var/lib/pgsql/data/pg_hba.conf
```

Agregar:

```
local   amauta_dev      amauta                                  md5
host    amauta_dev      amauta          127.0.0.1/32            md5
host    amauta_dev      amauta          ::1/128                 md5
```

Reiniciar:

```bash
sudo systemctl restart postgresql
```

---

## macOS

### 1. Instalar PostgreSQL

#### Opción A: Homebrew (Recomendado)

```bash
# Instalar Homebrew si no lo tienes
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar PostgreSQL
brew install postgresql@15

# Agregar al PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Opción B: Postgres.app

1. Descargar desde [https://postgresapp.com/](https://postgresapp.com/)
2. Arrastrar a Applications
3. Abrir y hacer clic en "Initialize"

### 2. Iniciar Servicio

```bash
# Homebrew
brew services start postgresql@15

# Verificar
brew services list
```

### 3. Configurar Usuario y Base de Datos

```bash
# Entrar a PostgreSQL (usuario por defecto es tu usuario de macOS)
psql postgres
```

```sql
CREATE USER amauta WITH PASSWORD 'desarrollo123';
CREATE DATABASE amauta_dev;
GRANT ALL PRIVILEGES ON DATABASE amauta_dev TO amauta;
ALTER DATABASE amauta_dev OWNER TO amauta;
\q
```

### 4. Verificar Conexión

```bash
psql -U amauta -d amauta_dev -h localhost
```

---

## Windows

### 1. Descargar Instalador

1. Ir a [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Descargar PostgreSQL 15
3. Ejecutar el instalador

### 2. Proceso de Instalación

1. **Installation Directory**: Dejar por defecto
2. **Components**: Seleccionar PostgreSQL Server, pgAdmin 4, Command Line Tools
3. **Data Directory**: Dejar por defecto
4. **Password**: Establecer contraseña para usuario `postgres` (ejemplo: `admin123`)
5. **Port**: 5432 (por defecto)
6. **Locale**: Spanish, Spain o dejar por defecto

### 3. Configurar Usuario y Base de Datos

Abrir **SQL Shell (psql)** desde el menú de inicio:

```
Server [localhost]:          (Enter - dejar por defecto)
Database [postgres]:         (Enter - dejar por defecto)
Port [5432]:                 (Enter - dejar por defecto)
Username [postgres]:         (Enter - dejar por defecto)
Password for user postgres:  (Introducir contraseña que estableciste)
```

Ejecutar comandos SQL:

```sql
CREATE USER amauta WITH PASSWORD 'desarrollo123';
CREATE DATABASE amauta_dev;
GRANT ALL PRIVILEGES ON DATABASE amauta_dev TO amauta;
ALTER DATABASE amauta_dev OWNER TO amauta;
\q
```

### 4. Agregar psql al PATH (Opcional)

Para usar `psql` desde cualquier terminal:

1. Buscar "Variables de entorno" en el menú de inicio
2. Click en "Variables de entorno"
3. En "Variables del sistema", seleccionar "Path" y hacer click en "Editar"
4. Agregar: `C:\Program Files\PostgreSQL\15\bin`
5. Click en "Aceptar"

### 5. Verificar Conexión

Abrir PowerShell o CMD:

```powershell
psql -U amauta -d amauta_dev -h localhost
```

---

## Configuración Post-Instalación

### 1. Habilitar Extensiones

Conectarse a la base de datos:

```bash
psql -U amauta -d amauta_dev -h localhost
```

Ejecutar:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Verificar extensiones instaladas
\dx
```

### 2. Configurar Zona Horaria

```sql
ALTER DATABASE amauta_dev SET timezone TO 'America/Lima';
```

### 3. Configurar DATABASE_URL

En tu archivo `apps/api/.env.local`:

```env
DATABASE_URL=postgresql://amauta:desarrollo123@localhost:5432/amauta_dev
```

### 4. Verificar Conexión desde Amauta

```bash
# Desde el directorio raíz del proyecto
cd apps/api

# Si tuvieras Prisma instalado, podrías verificar con:
# npx prisma db execute --stdin <<< "SELECT version();"
```

---

## Comandos Útiles

### Gestión del Servicio

```bash
# Linux
sudo systemctl start postgresql    # Iniciar
sudo systemctl stop postgresql     # Detener
sudo systemctl restart postgresql  # Reiniciar
sudo systemctl status postgresql   # Ver estado

# macOS (Homebrew)
brew services start postgresql@15
brew services stop postgresql@15
brew services restart postgresql@15

# Windows (PowerShell como Administrador)
net start postgresql-x64-15       # Iniciar
net stop postgresql-x64-15        # Detener
```

### Conexión a Base de Datos

```bash
# Conectar como usuario específico
psql -U amauta -d amauta_dev -h localhost

# Conectar como postgres (superusuario)
sudo -u postgres psql              # Linux/macOS
psql -U postgres                   # Windows
```

### Comandos Dentro de psql

```sql
\l                  -- Listar bases de datos
\du                 -- Listar usuarios
\c amauta_dev       -- Conectar a base de datos
\dt                 -- Listar tablas
\d nombre_tabla     -- Describir tabla
\q                  -- Salir
```

### Backup y Restore

```bash
# Backup
pg_dump -U amauta -d amauta_dev > backup.sql

# Restore
psql -U amauta -d amauta_dev < backup.sql
```

---

## Troubleshooting

### Error: "role does not exist"

```bash
# Linux/macOS
sudo -u postgres createuser amauta

# Windows
psql -U postgres
CREATE USER amauta WITH PASSWORD 'desarrollo123';
```

### Error: "database does not exist"

```bash
# Linux/macOS
sudo -u postgres createdb amauta_dev

# Windows
psql -U postgres
CREATE DATABASE amauta_dev;
```

### Error: "connection refused"

1. Verificar que PostgreSQL esté corriendo
2. Verificar el puerto en `pg_hba.conf`
3. Verificar firewall

### Error: "authentication failed"

1. Verificar contraseña
2. Revisar `pg_hba.conf` (debe usar `md5` o `scram-sha-256`)
3. Reiniciar PostgreSQL después de cambios

---

## Recursos

- [PostgreSQL Documentation](https://www.postgresql.org/docs/15/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)

---

## Volver a Docker

Si decides usar Docker en lugar de instalación local:

1. Detener PostgreSQL local
2. Desinstalar si lo deseas (opcional)
3. Seguir las instrucciones en el `README.md` principal
