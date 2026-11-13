# Tests unitarios y pruebas contra una base de datos

## Objetivo

Este documento explica por qué Amauta necesita tanto tests unitarios (`.spec.ts` o `.test.ts`) como pruebas de integración contra una base de datos local. No son alternativas excluyentes: cada tipo de prueba verifica una parte diferente del sistema.

---

## La pregunta central

Una duda frecuente es:

> ¿Por qué preparar una base de datos local si ya existen tests unitarios `.spec.ts`?

La respuesta corta es:

- Los **tests unitarios** prueban la lógica de una pieza de código de forma aislada.
- Las **pruebas contra la base de datos** prueban que esa pieza funciona conectada al schema, las migraciones, las relaciones y los datos reales.

Un test unitario puede pasar y, aun así, existir un error en la consulta Prisma o en la migración. Por eso se necesitan ambos niveles.

---

## Qué es un test unitario

Un test unitario prueba una unidad pequeña del sistema, normalmente una función, un servicio o un componente, sin depender de servicios externos.

En Amauta, los tests del backend usan Jest y suelen ubicarse junto al código que prueban:

```text
apps/api/src/historial/
├── historial.service.ts
├── historial.service.spec.ts
├── historial.controller.ts
└── historial.controller.spec.ts
```

### Ejemplo del historial académico

En `apps/api/src/historial/historial.service.spec.ts` se crea un Prisma simulado:

```ts
const prisma = {
  calificacion: { findMany: jest.fn() },
  // ...
};
```

El test puede indicarle al mock qué datos debe devolver:

```ts
prisma.calificacion.findMany.mockResolvedValue([
  {
    nota: 8,
    materia: { id: 'math', nombre: 'Matemática' },
    periodoAcademico: {
      id: 'p1',
      nombre: 'Primer período',
      orden: 1,
    },
    grupo: { nombre: '1°A' },
  },
]);
```

Luego verifica que el servicio:

- agrupe las calificaciones por período y materia;
- calcule los promedios;
- ordene la evolución correctamente;
- devuelva una estructura vacía si no hay calificaciones;
- rechace accesos administrativos incorrectos.

Estos tests son rápidos y permiten detectar errores en la lógica del servicio.

---

## Qué no puede comprobar un test unitario con mocks

Cuando Prisma está simulado, el test no consulta PostgreSQL. Por lo tanto, no confirma que:

- el modelo exista realmente en `schema.prisma`;
- la migración haya creado la tabla o columna correcta;
- las relaciones entre modelos sean válidas;
- el nombre de una relación Prisma esté bien escrito;
- una columna obligatoria tenga un valor válido;
- una restricción única funcione;
- la consulta real pueda ejecutarse contra PostgreSQL;
- el seed pueda insertar los datos.

Por ejemplo, este mock puede pasar:

```ts
prisma.calificacion.findMany.mockResolvedValue([...]);
```

aunque la consulta real use una relación inexistente o una columna que no existe. El mock no tiene forma de detectar ese error porque no consulta el schema real.

---

## Qué es una prueba de integración contra la base

Una prueba de integración conecta varias piezas reales:

```text
Código de la aplicación
        ↓
Prisma real
        ↓
Migraciones reales
        ↓
PostgreSQL local
        ↓
Datos reales o de prueba
```

En Amauta, la base local permite verificar que funcionan juntas:

- el schema de Prisma;
- las migraciones versionadas;
- las claves foráneas;
- las relaciones entre materias, grupos y períodos;
- los datos del seed;
- las consultas reales del historial académico;
- los endpoints que dependen de esos datos.

Por eso se creó `scripts/prepare-local-db.sh`. Ese script no reemplaza los tests unitarios: prepara el entorno para las pruebas que necesitan Prisma y PostgreSQL reales.

---

## Qué ocurrió con Amauta

Durante el trabajo de F4c-001 y F4c-003 se modificó el modelo académico. En particular, se pasó de referencias textuales a relaciones estructuradas:

- `materia` → `materiaId`;
- `periodo` → `periodoAcademicoId`.

Ese tipo de cambio no se puede verificar completamente con mocks. Es necesario comprobar que:

1. la migración se aplica;
2. las tablas y relaciones existen;
3. el seed utiliza los campos actuales;
4. las consultas reales pueden recuperar las calificaciones;
5. el historial funciona con datos persistidos.

Durante la verificación anterior, el seed falló inicialmente porque todavía utilizaba los nombres antiguos. Los tests unitarios no detectaron ese problema porque no ejecutaban el seed ni consultaban la base real. Luego se corrigió el seed y se verificó con PostgreSQL local.

---

## Qué hace `prepare-local-db.sh`

El script `scripts/prepare-local-db.sh` fue creado para preparar una base local reproducible. Su flujo es:

1. iniciar el servicio Docker;
2. esperar a que el daemon responda;
3. iniciar el contenedor local de PostgreSQL;
4. esperar a que quede `healthy`;
5. ejecutar las migraciones locales;
6. ejecutar el seed local.

El script utiliza esta base:

```text
postgresql://amauta:desarrollo123@localhost:5432/amauta_dev
```

No debe confundirse con `scripts/verify-node22-docker.sh`. Ese segundo script ejecuta verificaciones de Node, tests y builds Docker, pero no inicia Docker automáticamente.

---

## Pirámide de pruebas

Amauta utiliza varios niveles de verificación:

```text
             /\\
            /  \\       E2E: flujo completo de usuario
           /----\\
          /      \\     Integración: API, Prisma y DB
         /--------\\
        /          \\   Unitarios: lógica aislada
       --------------
```

### 1. Tests unitarios

Prueban funciones, servicios o componentes de forma aislada.

**Ventajas:**

- son rápidos;
- son fáciles de repetir;
- localizan bien los errores de lógica;
- no necesitan Docker;
- permiten desarrollar con feedback inmediato.

**Limitación principal:**

- no validan por sí solos la integración con PostgreSQL, Prisma o las migraciones.

### 2. Tests de integración

Prueban la interacción entre módulos reales, por ejemplo:

```text
Controller → Service → Prisma → PostgreSQL
```

**Ventajas:**

- validan consultas y relaciones reales;
- detectan errores de schema y migraciones;
- verifican restricciones de la base.

**Limitaciones:**

- son más lentos;
- requieren un entorno preparado;
- pueden necesitar limpieza o datos de prueba controlados.

### 3. Tests end-to-end

Prueban un flujo completo desde una perspectiva cercana a la persona usuaria, por ejemplo:

```text
Abrir catálogo → buscar curso → abrir resultado → ver detalle
```

Son los más representativos, pero también los más costosos y frágiles. Por eso se usan en menor cantidad.

---

## Aplicación al estado de promoción

Para implementar `EstadoPromocion`, lo correcto sería combinar los niveles.

### Tests unitarios

Probarían la lógica aislada de promoción:

- `PROMOVIDO`;
- `REPITENTE`;
- `EGRESADO`;
- período sin estado;
- estudiante con varios períodos;
- sobrescritura administrativa, si se implementa.

### Pruebas de integración

Probarían que:

- la migración crea la entidad de promoción;
- el enum tiene los valores esperados;
- las claves foráneas apuntan al estudiante, grupo y período correctos;
- la restricción única evita duplicar estudiante + grupo + período;
- el historial recupera el estado persistido;
- un estado de una institución no se expone a otra.

### Tests del controller o API

Probarían:

- identidad autenticada;
- permisos del estudiante;
- permisos del administrador;
- aislamiento institucional;
- códigos HTTP;
- mensajes de error.

---

## ¿Cuándo alcanza con un test unitario?

Un test unitario suele ser suficiente cuando se prueba:

- una función matemática;
- una transformación de datos;
- una regla de presentación;
- una validación aislada;
- una decisión que no depende de persistencia.

Por ejemplo, calcular un promedio a partir de un array de notas puede probarse perfectamente con un test unitario.

## ¿Cuándo hace falta una base real?

Hace falta una base de datos real o un entorno de integración cuando se prueba:

- una migración de schema;
- una nueva tabla o columna;
- una relación entre modelos;
- una clave foránea;
- una restricción única;
- una consulta Prisma compleja;
- un seed;
- una transacción;
- un flujo cuya corrección depende de datos persistidos.

---

## Regla práctica para Amauta

La estrategia recomendada es:

1. escribir tests unitarios para la lógica;
2. ejecutar esos tests sin depender de Docker;
3. preparar PostgreSQL local cuando se cambia Prisma o se necesita una consulta real;
4. ejecutar pruebas de integración contra la base local;
5. ejecutar E2E cuando el flujo completo lo justifique.

La base de datos local no sustituye a los `.spec.ts`. Los `.spec.ts` tampoco sustituyen a una verificación de migraciones y consultas reales.

---

## Resumen

| Pregunta                        | Test unitario         | Prueba contra DB        |
| ------------------------------- | --------------------- | ----------------------- |
| ¿Prueba la lógica del servicio? | Sí                    | Sí, pero indirectamente |
| ¿Necesita Docker?               | No                    | Normalmente sí          |
| ¿Usa Prisma real?               | No, generalmente mock | Sí                      |
| ¿Valida migraciones?            | No                    | Sí                      |
| ¿Valida relaciones SQL?         | No                    | Sí                      |
| ¿Es rápido?                     | Sí                    | Menos                   |
| ¿Detecta errores de schema?     | No                    | Sí                      |
| ¿Debe existir en Amauta?        | Sí                    | Sí                      |

La idea fundamental es que los tests unitarios comprueban si una pieza piensa correctamente, mientras que las pruebas contra la base comprueban si el sistema completo puede ejecutar esa lógica con sus datos y estructuras reales.
