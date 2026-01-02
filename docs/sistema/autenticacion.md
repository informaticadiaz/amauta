# Autenticación

> Cómo funciona el inicio de sesión y registro en Amauta.

## Funcionalidades

| Función              | Estado       | Descripción        |
| -------------------- | ------------ | ------------------ |
| Registro             | ✅ Funcional | Crear cuenta nueva |
| Login                | ✅ Funcional | Iniciar sesión     |
| Logout               | ✅ Funcional | Cerrar sesión      |
| Recuperar contraseña | 📋 Pendiente | Por implementar    |

## Registro de Usuario

### ¿Quién puede registrarse?

Cualquier persona puede crear una cuenta. Por defecto, las cuentas nuevas se crean con rol **ESTUDIANTE**.

### Datos requeridos

| Campo      | Obligatorio | Validación            |
| ---------- | ----------- | --------------------- |
| Nombre     | Sí          | Mínimo 2 caracteres   |
| Email      | Sí          | Formato válido, único |
| Contraseña | Sí          | Mínimo 6 caracteres   |

### Proceso

1. Ir a `/register`
2. Completar el formulario
3. Enviar
4. Si es exitoso, redirige al login
5. Iniciar sesión con las credenciales

### Posibles errores

| Error                         | Causa                 | Solución                               |
| ----------------------------- | --------------------- | -------------------------------------- |
| "El email ya está registrado" | Email duplicado       | Usar otro email o recuperar contraseña |
| "La contraseña es muy corta"  | Menos de 6 caracteres | Usar contraseña más larga              |

## Inicio de Sesión

### Proceso

1. Ir a `/login`
2. Ingresar email y contraseña
3. Enviar
4. Si es exitoso, redirige al dashboard

### Posibles errores

| Error                    | Causa                          | Solución            |
| ------------------------ | ------------------------------ | ------------------- |
| "Credenciales inválidas" | Email o contraseña incorrectos | Verificar datos     |
| "Usuario no encontrado"  | Email no registrado            | Registrarse primero |

## Cierre de Sesión

Desde cualquier página autenticada:

1. Click en el avatar/menú de usuario (esquina superior derecha)
2. Click en "Cerrar sesión"
3. Redirige a la página principal

## Sesiones

- La sesión dura **30 días** si no se cierra manualmente
- Al cerrar el navegador, la sesión se mantiene activa
- Para cerrar sesión en todos los dispositivos: cerrar sesión manualmente en cada uno

## Seguridad

- Las contraseñas se almacenan encriptadas (bcrypt)
- Las sesiones usan tokens seguros (JWT)
- El tráfico está protegido con HTTPS

## Páginas

| Página    | URL          | Descripción                    |
| --------- | ------------ | ------------------------------ |
| Login     | `/login`     | Formulario de inicio de sesión |
| Registro  | `/register`  | Formulario de registro         |
| Dashboard | `/dashboard` | Página principal tras login    |

## Usuarios de Prueba

Para probar el sistema sin crear una cuenta:

| Email                   | Contraseña  | Rol           |
| ----------------------- | ----------- | ------------- |
| superadmin@amauta.test  | password123 | SUPER_ADMIN   |
| admin1@amauta.test      | password123 | ADMIN_ESCUELA |
| educador1@amauta.test   | password123 | EDUCADOR      |
| estudiante1@amauta.test | password123 | ESTUDIANTE    |

Ver [seed/etapa-1-usuarios.md](seed/etapa-1-usuarios.md) para lista completa.

---

**Implementado en**: F1-001 (Issue #28)
**Fecha**: 30/12/2024
