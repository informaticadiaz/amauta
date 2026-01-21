# 📚 NotebookLM - Fuentes de Estudio Amauta

> **Propósito**: Esta carpeta contiene documentación estructurada para ser usada con Google NotebookLM como fuente de aprendizaje y referencia técnica.

## ✨ Qué es NotebookLM

[NotebookLM de Google](https://notebooklm.google.com/) es una herramienta de IA que te permite:

- Subir documentos como "fuentes"
- Hacer preguntas sobre el contenido
- Generar resúmenes y guías de estudio
- Crear conexiones entre conceptos

## 📁 Estructura de Documentos

### 1. Análisis y Decisiones Arquitectónicas

| Documento                                     | Tema                         | Contenido                                            |
| --------------------------------------------- | ---------------------------- | ---------------------------------------------------- |
| `001-analisis-networking-frontend-backend.md` | **Networking en Amauta**     | Análisis completo de comunicación Frontend ↔ Backend |
| `002-perspectiva-seguridad.md`                | **Seguridad**                | Análisis desde perspectiva de seguridad OWASP        |
| `003-perspectiva-arquitectura.md`             | **Arquitectura de Software** | Patrones, SOLID, acoplamiento, cohesión              |
| `004-perspectiva-contexto-amauta.md`          | **Contexto Específico**      | Educación, Offline-First, PWA, costos                |
| `005-decision-final-y-recomendacion.md`       | **Decisión y ADR**           | Recomendación fundamentada y plan de acción          |

### 2. Conceptos Clave (Futuro)

> Nota: Estos documentos se crearán conforme avance el proyecto

- `conceptos-docker-networking.md` - Docker networking explicado
- `conceptos-service-mesh-vs-api-gateway.md` - Patrones de comunicación
- `conceptos-solid-en-arquitectura.md` - SOLID aplicado a arquitectura
- `conceptos-owasp-top-10.md` - Vulnerabilidades y mitigaciones

## 🎯 Cómo Usar con NotebookLM

### Paso 1: Subir Fuentes

1. Ve a [NotebookLM](https://notebooklm.google.com/)
2. Crea un nuevo cuaderno: "Amauta - Decisiones Arquitectónicas"
3. Sube estos archivos como fuentes:
   - `001-analisis-networking-frontend-backend.md`
   - `002-perspectiva-seguridad.md`
   - `003-perspectiva-arquitectura.md`
   - `004-perspectiva-contexto-amauta.md`
   - `005-decision-final-y-recomendacion.md`

### Paso 2: Preguntas de Estudio

Algunas preguntas que podés hacer a NotebookLM:

**Conceptuales:**

- ¿Qué es el Dependency Inversion Principle y cómo se aplica en Amauta?
- ¿Por qué la defensa en profundidad es importante para Amauta?
- ¿Qué diferencia hay entre Service Mesh y API Gateway?

**Aplicadas:**

- ¿Por qué usar URL pública es mejor para el contexto de Amauta?
- ¿Cómo afecta la decisión de networking a la Fase 2 (PWA Offline-First)?
- ¿Cuál es el TCO de cada opción y por qué importa?

**Comparativas:**

- Compará URL interna vs URL pública desde seguridad
- ¿Cuáles son los trade-offs de latencia vs arquitectura?
- ¿Qué vulnerabilidades OWASP mitiga cada opción?

### Paso 3: Generar Material de Estudio

NotebookLM puede generar:

- ✅ Guías de estudio resumidas
- ✅ Preguntas de repaso
- ✅ Flashcards para memorización
- ✅ Podcast de audio explicando el tema (Audio Overview)

## 🗺️ Roadmap de Documentación

### ✅ Completado (2026-01-21)

- [x] Análisis de networking Frontend-Backend
- [x] Perspectiva de seguridad
- [x] Perspectiva de arquitectura
- [x] Contexto específico de Amauta
- [x] Decisión final y recomendación

### 📋 Próximos Documentos

- [ ] Docker Networking Fundamentals
- [ ] Service Mesh vs API Gateway Pattern
- [ ] SOLID Principles en Arquitectura de Software
- [ ] OWASP Top 10 - Guía Práctica
- [ ] PWA Offline-First Architecture
- [ ] Clean Architecture en Next.js + NestJS

## 📖 Referencias Cruzadas

Estos documentos complementan:

### Documentación Técnica

- `docs/technical/architecture.md` - Arquitectura general del sistema
- `docs/technical/security-guide.md` - Guía de seguridad
- `docs/technical/adr/005-deployment-dokploy.md` - ADR de deployment
- `docs/technical/adr/006-url-publica-frontend-backend.md` - ADR de networking (nuevo)

### Documentación de Proyecto

- `README.md` - Filosofía y visión de Amauta
- `docs/project-management/roadmap.md` - Roadmap completo

## 💡 Tips para Estudiar

1. **Lee los documentos en orden** (001 → 005) para entender el razonamiento completo
2. **Tomá notas** de conceptos que no entiendas y preguntale a NotebookLM
3. **Hacé conexiones** entre seguridad, arquitectura y el contexto de Amauta
4. **Aplicá los conceptos** a otros problemas similares en el proyecto
5. **Revisá periódicamente** para reforzar el aprendizaje

## 🎓 Objetivos de Aprendizaje

Al estudiar estos documentos, deberías poder:

- ✅ Explicar por qué URL pública es mejor para Amauta
- ✅ Identificar vulnerabilidades OWASP en arquitecturas de networking
- ✅ Aplicar principios SOLID a decisiones de infraestructura
- ✅ Evaluar trade-offs entre latencia, seguridad y mantenibilidad
- ✅ Justificar decisiones arquitectónicas con datos concretos
- ✅ Entender el impacto de decisiones actuales en el roadmap futuro

## 📚 Recursos Adicionales

### Libros

- "Building Microservices" - Sam Newman (Ch. 11 Security)
- "Clean Architecture" - Robert C. Martin
- "Designing Data-Intensive Applications" - Martin Kleppmann

### Artículos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Docker Networking](https://docs.docker.com/network/)

### Videos

- [Service Mesh vs API Gateway - ByteByteGo](https://www.youtube.com/watch?v=Xw8Cjb8sQjU)
- [SOLID Principles - Uncle Bob](https://www.youtube.com/watch?v=zHiWqnTWsn4)

---

**Última actualización**: 2026-01-21

**Autor**: Análisis arquitectónico y de seguridad para Amauta

**Versión**: 1.0
