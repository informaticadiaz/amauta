# Tests unitarios de `MateriasService`

Esta guía explica cómo leer el archivo `materias.service.spec.ts`, una prueba unitaria de un servicio NestJS que usa Prisma.

## ¿Qué diferencia hay entre el servicio y su test?

- `materias.service.ts` contiene la implementación real de la lógica.
- `materias.service.spec.ts` contiene pruebas automatizadas que verifican el comportamiento esperado de esa lógica.

El archivo de test no reemplaza al servicio ni ejecuta necesariamente una base de datos real. En este caso, Prisma se simula para poder controlar las respuestas durante cada prueba.

## Estructura básica de Jest

```ts
describe('MateriasService', () => {
  it('rechaza datos inválidos', async () => {
    // Preparar el escenario y comprobar el resultado esperado.
  });
});
```

- `describe` agrupa pruebas relacionadas; aquí, las de `MateriasService`.
- `it` define una prueba individual y su nombre resume el comportamiento que se verifica.
- `expect` expresa una afirmación que debe cumplirse para que la prueba pase.

## Preparación: `beforeEach` y mocks

El `beforeEach` se ejecuta antes de cada prueba para preparar un entorno limpio. El test crea objetos simulados para las operaciones de Prisma, por ejemplo `prisma.materia.create` o `prisma.grupo.findUnique`.

Un mock (`jest.fn()`) es una función falsa que permite controlar y observar una dependencia sin llamar a la base de datos real. Por ejemplo:

```ts
prisma.materia.create.mockResolvedValue({ id: materiaId });
```

Esto configura la función simulada para que, cuando sea llamada, resuelva con ese objeto.

También se puede simular un error:

```ts
prisma.materia.create.mockRejectedValue({ code: 'P2002' });
```

`P2002` es el código de Prisma comúnmente asociado a una violación de unicidad, como un registro duplicado.

## Cómo leer las expectativas

### La llamada debe fallar con una excepción

```ts
await expect(
  service.crear(institucionId, { nombre: '   ' }, adminId)
).rejects.toThrow(BadRequestException);
```

Se espera que la promesa de `crear` sea rechazada y que el error sea `BadRequestException`. En términos de negocio: un nombre vacío o compuesto solo por espacios no es válido.

### La llamada debe resolverse con cierto resultado

```ts
await expect(
  service.asignarAGrupo(grupoId, materiaId, adminId)
).resolves.toMatchObject({ activo: true });
```

Se espera que la promesa tenga éxito y que el resultado incluya `activo: true`. `toMatchObject` permite que el resultado incluya otras propiedades también.

### Verificar cómo se llamó a una dependencia

```ts
expect(prisma.grupoMateria.upsert).toHaveBeenCalledWith({
  where: { grupoId_materiaId: { grupoId, materiaId } },
  create: { grupoId, materiaId },
  update: { activo: true },
});
```

Esto comprueba que el servicio llamó a Prisma con esos argumentos. `upsert` crea una asignación si no existe o actualiza la existente; aquí, el test espera que una asignación existente se reactive.

### Verificar que algo no ocurrió

```ts
expect(prisma.materia.create).not.toHaveBeenCalled();
```

Esto comprueba que el servicio no intentó crear una materia. Resulta útil para confirmar que una validación o autorización falló antes de acceder a la escritura en la base de datos.

## Excepciones que aparecen en estos tests

Las excepciones de NestJS expresan distintos tipos de error:

- `BadRequestException`: los datos enviados no son válidos.
- `ForbiddenException`: el usuario no tiene permiso para realizar la operación.
- `NotFoundException`: el recurso solicitado no existe.
- `ConflictException`: la operación entra en conflicto con un dato existente, por ejemplo, un nombre duplicado.

El test comprueba el tipo de error esperado; no necesariamente verifica todos los detalles del mensaje HTTP.

## Qué comportamientos comprueba el archivo

1. **Creación y validación:** rechaza nombres vacíos y usuarios sin autorización para la institución.
2. **Duplicados:** convierte un error de unicidad de Prisma en `ConflictException`.
3. **Listado:** devuelve materias activas por defecto y permite pedir también las inactivas.
4. **Activación:** comprueba que desactivar cambia `activo` a `false` y que una actualización puede reactivarla.
5. **Actualización:** rechaza una actualización vacía o de una materia inexistente; también comprueba el caso de nombre duplicado.
6. **Asignación a grupos:** permite asignar una materia activa de la misma institución y volver a activar una asignación previa.
7. **Reglas de institución y existencia:** rechaza materias inexistentes o pertenecientes a otra institución.
8. **Eliminación lógica:** quitar una asignación la marca como inactiva (`activo: false`) en vez de borrarla físicamente.
9. **Acceso de educadores:** permite consultar materias al educador asignado activamente al grupo y deniega el acceso si no lo está.

## Ejemplo: traducir un test a lenguaje cotidiano

```ts
it('rechaza asignar materia inexistente, inactiva o de otra institución', async () => {
  prisma.grupo.findUnique.mockResolvedValue({ id: grupoId, institucionId });
  prisma.materia.findUnique.mockResolvedValue(null);

  await expect(
    service.asignarAGrupo(grupoId, materiaId, adminId)
  ).rejects.toThrow(NotFoundException);
});
```

Lectura paso a paso:

1. El mock simula que el grupo sí existe.
2. El mock simula que la materia no existe (`null`).
3. Se llama al servicio para intentar asignarla.
4. El test espera que el servicio rechace la operación con `NotFoundException`.

El nombre del test menciona varios casos, pero este fragmento concreto configura y comprueba el caso de materia inexistente. Para saber si también prueba los otros casos, hay que revisar el resto del bloque.

## ¿Qué significa que una prueba pase?

Si la prueba pasa, la implementación se comportó como indican sus expectativas en ese escenario. Eso no demuestra que toda la funcionalidad esté libre de errores: solo cubre los casos y las comprobaciones que el test contiene.

Estos tests usan mocks, por lo que validan principalmente la lógica del servicio y sus interacciones con Prisma; no comprueban por sí solos que una base de datos real tenga el esquema o los datos correctos.

## Regla práctica para entender cualquier test

Al leer cada `it(...)`, busca estas tres cosas:

1. **Escenario:** ¿qué datos o respuestas se preparan en los mocks?
2. **Acción:** ¿qué método del servicio se llama?
3. **Resultado:** ¿qué se espera que ocurra o qué interacción se verifica?

En resumen, estas pruebas automatizadas documentan y verifican comportamientos esperados de `MateriasService`, como validaciones, permisos, duplicados y asignaciones, sin sustituir la implementación real.
