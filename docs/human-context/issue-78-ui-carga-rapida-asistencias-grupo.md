# Issue #78 — F4-012: UI Carga rápida de asistencias por grupo

**Qué podés hacer ahora:** tomar asistencia desde una sola pantalla del dashboard, con acciones rápidas y guardado masivo.

---

## Como Administrador de Escuela o Educador, ahora podés:

### Cargar asistencias desde el dashboard

1. Iniciá sesión y entrá a **Asistencias**.
2. Seleccioná un grupo y una fecha.
3. Marcá rápidamente el estado de cada estudiante y guardá todos los cambios juntos.

### Corregir registros existentes

1. Si un estudiante ya tenía asistencia cargada para ese día, podés ajustarla.
2. Cuando modificás una asistencia ya registrada, el sistema te pide una observación.
3. Después de guardar, la pantalla refresca la nómina y muestra feedback inmediato.

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo? |
| ------------- | -------------- |
| ESTUDIANTE    | ❌             |
| EDUCADOR      | ✅             |
| ADMIN_ESCUELA | ✅             |
| SUPER_ADMIN   | ❌             |

---

## Usuarios de prueba para testear

| Email                 | Contraseña  | Rol           |
| --------------------- | ----------- | ------------- |
| admin1@amauta.test    | password123 | ADMIN_ESCUELA |
| educador1@amauta.test | password123 | EDUCADOR      |

---

## Nota

> La pantalla está en `/dashboard/asistencias`. Los admins ven los grupos de su institución y los educadores ven solo los grupos donde están asignados.
