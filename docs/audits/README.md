# Auditorías de Issues

> Registro de auditorías realizadas por el Issue Inspector.
> Cada documento verifica que un issue cumple sus requisitos y funciona en producción.

---

## Índice de Auditorías

| Issue | Título | Fecha | Veredicto |
| ----- | ------ | ----- | --------- |
| —     | —      | —     | —         |

---

## Cómo usar

```
/issue-inspector #45
```

Esto genera un documento `issue-045-{slug}.md` en esta carpeta.

---

## Veredictos

| Veredicto                     | Significado                                          |
| ----------------------------- | ---------------------------------------------------- |
| ✅ APROBADO                   | Cumple todos los requisitos y funciona en producción |
| ⚠️ APROBADO CON OBSERVACIONES | Funciona pero hay mejoras recomendadas               |
| ❌ RECHAZADO                  | No cumple requisitos o falla en producción           |

---

## Estructura de cada auditoría

1. **Requisitos del Issue** — Checklist extraído del issue
2. **Verificación de Código** — Archivos existen y siguen patrones
3. **Tests** — Resultados de tests unitarios
4. **Pruebas en Producción** — Smoke tests contra la API real
5. **Hallazgos** — Problemas encontrados (si hay)
6. **Evidencia** — Logs o capturas relevantes
