# Etapa 1: Usuarios y Perfiles

> **Estado**: ✅ Completado
> **Fecha**: 2025-12-30
> **Issue**: [#23](https://github.com/informaticadiaz/amauta/issues/23)

## Resumen

Esta etapa establece la base del sistema creando los usuarios de prueba con todos los roles disponibles. Cada usuario tiene un perfil completo con información realista.

## ¿Qué se logró?

### Usuarios Creados

Se crearon **10 usuarios** que representan todos los roles del sistema:

| Usuario         | Rol                 | Propósito                          |
| --------------- | ------------------- | ---------------------------------- |
| Admin Sistema   | Super Administrador | Probar acceso total                |
| María García    | Admin de Escuela    | Probar gestión de institución      |
| Carlos López    | Admin de Escuela    | Probar segunda institución         |
| Ana Martínez    | Educadora           | Probar creación de cursos          |
| Pedro Sánchez   | Educador            | Probar segundo educador            |
| Laura Fernández | Educadora           | Probar tercera educadora           |
| Juan Pérez      | Estudiante          | Probar flujo de estudiante         |
| Sofía Rodríguez | Estudiante          | Probar segunda estudiante          |
| Mateo González  | Estudiante          | Probar estudiante otra institución |
| Valentina Díaz  | Estudiante          | Probar cuarta estudiante           |

### Perfiles Completos

Cada usuario tiene información de perfil:

**Administradores y Educadores**:

- Biografía profesional
- Teléfono de contacto
- Ciudad (Buenos Aires, Córdoba)
- Institución donde trabajan
- Especialidades (solo educadores)
- Años de experiencia (solo educadores)

**Estudiantes**:

- Ciudad
- Institución
- Número de matrícula
- Grado/curso asignado

## Credenciales de Acceso

Todos los usuarios usan la misma contraseña para facilitar pruebas:

```
Contraseña: password123
```

### Super Administrador

| Campo  | Valor                  |
| ------ | ---------------------- |
| Email  | superadmin@amauta.test |
| Nombre | Admin Sistema          |
| Acceso | Total al sistema       |

**Puede hacer**: Todo. Gestionar usuarios, instituciones, cursos, configuraciones.

### Administradores de Escuela

| Email              | Nombre       | Institución                   |
| ------------------ | ------------ | ----------------------------- |
| admin1@amauta.test | María García | Escuela Primaria Belgrano     |
| admin2@amauta.test | Carlos López | Colegio Secundario San Martín |

**Pueden hacer**: Gestionar su institución, crear grupos, publicar comunicados.

### Educadores

| Email                 | Nombre          | Especialidad                    |
| --------------------- | --------------- | ------------------------------- |
| educador1@amauta.test | Ana Martínez    | Matemáticas, Álgebra, Geometría |
| educador2@amauta.test | Pedro Sánchez   | Lengua, Literatura, Redacción   |
| educador3@amauta.test | Laura Fernández | Biología, Física, Química       |

**Pueden hacer**: Crear cursos, agregar lecciones, ver progreso de estudiantes.

### Estudiantes

| Email                   | Nombre          | Grado | Institución |
| ----------------------- | --------------- | ----- | ----------- |
| estudiante1@amauta.test | Juan Pérez      | 4°A   | Belgrano    |
| estudiante2@amauta.test | Sofía Rodríguez | 4°A   | Belgrano    |
| estudiante3@amauta.test | Mateo González  | 1°A   | San Martín  |
| estudiante4@amauta.test | Valentina Díaz  | 1°A   | San Martín  |

**Pueden hacer**: Inscribirse a cursos, completar lecciones, ver calificaciones.

## Distribución por Institución

```
Escuela Primaria Belgrano (Buenos Aires)
├── Admin: María García
├── Educadores: Ana Martínez, Pedro Sánchez
└── Estudiantes: Juan Pérez, Sofía Rodríguez

Colegio Secundario San Martín (Córdoba)
├── Admin: Carlos López
├── Educadores: Laura Fernández
└── Estudiantes: Mateo González, Valentina Díaz
```

## Cómo Verificar

### En la Base de Datos

```sql
-- Ver todos los usuarios
SELECT email, nombre, apellido, rol FROM usuarios ORDER BY rol;

-- Ver perfiles
SELECT u.email, p.ciudad, p.institucion
FROM usuarios u
JOIN perfiles p ON u.id = p.usuario_id;
```

### En la API

```bash
# Health check
curl https://amauta-api.diazignacio.ar/health
```

## Notas Técnicas

- **Contraseñas**: Hasheadas con bcrypt (10 rounds)
- **Emails verificados**: Todos marcados como verificados
- **Dominio**: Se usa `@amauta.test` (dominio reservado para testing)
- **Idempotencia**: El seed puede re-ejecutarse sin duplicar datos

## Próxima Etapa

**Etapa 2**: [Categorías e Instituciones](etapa-2-categorias.md)

- Crear 6 categorías de cursos
- Crear 2 instituciones formalmente
- Crear 4 grupos (clases)
- Asignar estudiantes a grupos

---

**Implementado por**: Claude Code
**Commit**: `51503c4`
