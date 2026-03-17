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
