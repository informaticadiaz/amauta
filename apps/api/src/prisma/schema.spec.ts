import { readFileSync } from 'fs';
import { join } from 'path';

describe('Prisma schema (evaluaciones)', () => {
  it('incluye modelos base de evaluaciones', () => {
    const schemaPath = join(__dirname, '../../prisma/schema.prisma');
    const schema = readFileSync(schemaPath, 'utf8');

    expect(schema).toContain('model Evaluacion');
    expect(schema).toContain('model Pregunta');
    expect(schema).toContain('model IntentoEvaluacion');
  });

  it('incluye el estado final de promoción por estudiante, grupo y período', () => {
    const schemaPath = join(__dirname, '../../prisma/schema.prisma');
    const schema = readFileSync(schemaPath, 'utf8');

    expect(schema).toContain('model EstadoPromocion');
    expect(schema).toContain('enum EstadoPromocionTipo');
    expect(schema).toContain('PROMOVIDO');
    expect(schema).toContain('REPITENTE');
    expect(schema).toContain('EGRESADO');
    expect(schema).toContain(
      '@@unique([estudianteId, grupoId, periodoAcademicoId])'
    );
    expect(schema).not.toContain('EN_RIESGO');
  });

  it('incluye enum TipoPregunta', () => {
    const schemaPath = join(__dirname, '../../prisma/schema.prisma');
    const schema = readFileSync(schemaPath, 'utf8');

    expect(schema).toContain('enum TipoPregunta');
    expect(schema).toContain('OPCION_MULTIPLE');
    expect(schema).toContain('SELECCION_MULTIPLE');
    expect(schema).toContain('VERDADERO_FALSO');
    expect(schema).toContain('RESPUESTA_CORTA');
    expect(schema).toContain('RESPUESTA_LARGA');
    expect(schema).toContain('EMPAREJAMIENTO');
  });
});
