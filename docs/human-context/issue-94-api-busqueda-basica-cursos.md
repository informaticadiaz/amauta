# Issue #94 — API de búsqueda básica de cursos

**Qué podés hacer ahora:** Buscar cursos del catálogo público por palabra clave, filtrar por categoría, nivel, duración e idioma, y obtener resultados ordenados por relevancia.

---

## Como visitante o usuario autenticado, ahora podés:

### Buscar cursos por texto

1. Hacé una petición `GET /api/v1/cursos/buscar?buscar=python`
2. La API devuelve cursos publicados donde "python" aparece en el título o la descripción
3. Los cursos donde "python" está en el **título** aparecen primero (mayor relevancia)
4. Los cursos donde "python" solo aparece en la descripción aparecen después

### Filtrar resultados

Combiná los filtros como quieras:

```
GET /api/v1/cursos/buscar?buscar=programación&nivel=PRINCIPIANTE&duracion=corta&idioma=es
```

| Filtro        | Valores                            | Ejemplo                 |
| ------------- | ---------------------------------- | ----------------------- |
| `categoriaId` | ID de categoría                    | `categoriaId=clh3zq...` |
| `nivel`       | PRINCIPIANTE, INTERMEDIO, AVANZADO | `nivel=AVANZADO`        |
| `duracion`    | corta, media, larga                | `duracion=corta`        |
| `idioma`      | código de idioma                   | `idioma=es`             |

Rangos de duración:

- `corta`: menos de 60 minutos
- `media`: entre 60 y 180 minutos
- `larga`: más de 180 minutos

### Ordenar resultados

| Valor         | Cuándo usarlo                                         |
| ------------- | ----------------------------------------------------- |
| `relevancia`  | Con término de búsqueda (predeterminado con `buscar`) |
| `publicadoEn` | Más recientes primero (predeterminado sin `buscar`)   |
| `titulo`      | Orden alfabético A-Z                                  |

```
GET /api/v1/cursos/buscar?buscar=python&ordenarPor=titulo&orden=asc
```

### Paginar

```
GET /api/v1/cursos/buscar?buscar=python&page=2&limit=5
```

---

## Formato de respuesta

```json
{
  "cursos": [
    {
      "id": "...",
      "titulo": "Python para todos",
      "descripcion": "...",
      "nivel": "PRINCIPIANTE",
      "idioma": "es",
      "duracion": 45,
      "publicadoEn": "2024-01-15T...",
      "educador": {
        "id": "...",
        "nombre": "Juan",
        "apellido": "Pérez",
        "avatar": null
      },
      "categoria": {
        "id": "...",
        "nombre": "Programación",
        "slug": "programacion"
      },
      "_count": { "lecciones": 10, "inscripciones": 25 }
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo? |
| ------------- | -------------- |
| ESTUDIANTE    | ✅             |
| EDUCADOR      | ✅             |
| ADMIN_ESCUELA | ✅             |
| SUPER_ADMIN   | ✅             |
| Sin sesión    | ✅             |

El endpoint es público, no requiere autenticación.

---

## Usuarios de prueba para testear

| Email                   | Contraseña  | Rol        |
| ----------------------- | ----------- | ---------- |
| estudiante1@amauta.test | password123 | ESTUDIANTE |
| educador1@amauta.test   | password123 | EDUCADOR   |

---

## Nota

Este es un endpoint de backend solamente. La UI se implementará en el issue #95.
Para probar podés usar curl o cualquier cliente HTTP:

```bash
curl "https://amauta-api.diazignacio.ar/api/v1/cursos/buscar?buscar=python&nivel=PRINCIPIANTE"
```
