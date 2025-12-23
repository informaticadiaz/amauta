# ADR-002: Backend con NestJS + Fastify

## Estado

Aceptado

## Fecha

2024-12-15

## Contexto

Necesitamos un framework de backend para construir la API de Amauta. La API debe:

- Soportar REST (y posiblemente GraphQL en el futuro)
- Ser type-safe con TypeScript
- Escalar para manejar muchos usuarios concurrentes
- Tener buena estructura para un equipo creciente
- Integrar bien con Prisma

## Opciones Consideradas

### Opción 1: Express.js puro

- **Pros**:
  - Más usado, mucha documentación
  - Muy flexible
  - Ligero
- **Contras**:
  - Sin estructura definida
  - TypeScript como afterthought
  - Fácil escribir código desordenado

### Opción 2: Fastify puro

- **Pros**:
  - Muy rápido (benchmarks)
  - Buen soporte de TypeScript
  - Validación con JSON Schema
- **Contras**:
  - Sin estructura de aplicación
  - Menos ecosistema que Express

### Opción 3: NestJS con Express

- **Pros**:
  - Estructura modular (módulos, servicios, controladores)
  - TypeScript first
  - Inyección de dependencias
  - Decoradores intuitivos
  - Gran ecosistema (auth, swagger, etc.)
- **Contras**:
  - Más pesado que Express/Fastify puros
  - Curva de aprendizaje para decoradores/DI

### Opción 4: NestJS con Fastify (elegida)

- **Pros**:
  - Todos los beneficios de NestJS
  - Performance de Fastify
  - Mejor throughput bajo carga
- **Contras**:
  - Algunos middlewares de Express no funcionan
  - Documentación más enfocada en Express

## Decisión

**Usar NestJS con Fastify** como adaptador HTTP.

### Razones principales

1. **Estructura escalable**: La arquitectura modular de NestJS facilita mantener código ordenado cuando el proyecto crece
2. **TypeScript nativo**: Decoradores y tipos integrados
3. **Performance**: Fastify es ~2x más rápido que Express en benchmarks
4. **Ecosistema**: Módulos oficiales para auth, validación, swagger, etc.
5. **Inyección de dependencias**: Facilita testing y desacoplamiento

## Consecuencias

### Positivas

- Código estructurado y consistente
- Fácil de testear con mocks/stubs
- Documentación automática con Swagger
- Validación de DTOs con class-validator
- Performance superior a Express

### Negativas

- Curva de aprendizaje para devs no familiarizados con NestJS
- Algunos paquetes de Express no son compatibles
- Más boilerplate que Express puro

### Neutras

- Decoradores pueden parecer "mágicos" inicialmente
- Requiere entender inyección de dependencias

## Ejemplo de Estructura

```typescript
// cursos.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [CursosController],
  providers: [CursosService],
})
export class CursosModule {}

// cursos.controller.ts
@Controller('cursos')
export class CursosController {
  constructor(private cursosService: CursosService) {}

  @Get()
  findAll() {
    return this.cursosService.findAll();
  }
}

// cursos.service.ts
@Injectable()
export class CursosService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.curso.findMany();
  }
}
```

## Referencias

- [NestJS Documentation](https://docs.nestjs.com/)
- [NestJS with Fastify](https://docs.nestjs.com/techniques/performance)
- [Fastify Benchmarks](https://fastify.dev/benchmarks/)
