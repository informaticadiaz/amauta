import { categoriasData } from '../../prisma/seeds/categorias';
import { cursosData } from '../../prisma/seeds/cursos';

describe('Seed NAP', () => {
  it('debería alinear categorías con las 8 áreas NAP', () => {
    const expectedSlugs = [
      'matematicas',
      'lengua-literatura',
      'ciencias-naturales',
      'ciencias-sociales',
      'educacion-artistica',
      'educacion-tecnologica',
      'educacion-fisica',
      'formacion-etica-ciudadana',
    ].sort();

    const actualSlugs = categoriasData.map((categoria) => categoria.slug).sort();

    expect(actualSlugs).toEqual(expectedSlugs);
    expect(new Set(actualSlugs).size).toBe(expectedSlugs.length);
  });

  it('debería incluir al menos un curso por nivel educativo', () => {
    const niveles = new Set(cursosData.map((curso) => curso.nivelEducativo));

    expect(niveles.has('INICIAL')).toBe(true);
    expect(niveles.has('PRIMARIA')).toBe(true);
    expect(niveles.has('SECUNDARIA')).toBe(true);
  });
});
