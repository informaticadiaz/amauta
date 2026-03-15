import 'fake-indexeddb/auto';

import {
  db,
  type CursoOffline,
  type LeccionOffline,
  type ProgresoOffline,
} from './offline-db';

if (
  typeof (globalThis as { structuredClone?: unknown }).structuredClone !==
  'function'
) {
  (
    globalThis as { structuredClone: (value: unknown) => unknown }
  ).structuredClone = (value) => JSON.parse(JSON.stringify(value));
}

describe('OfflineDB', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  afterEach(async () => {
    db.close();
  });

  it('deberia crear y leer cursos y lecciones offline', async () => {
    const curso: CursoOffline = {
      id: 'curso-1',
      slug: 'intro-algebra',
      titulo: 'Introduccion al Algebra',
      descripcion: 'Curso base de algebra',
      imagen: null,
      nivel: 'PRINCIPIANTE',
      duracion: 120,
      categoriaId: 'cat-1',
      fechaDescarga: new Date('2026-03-15T00:00:00.000Z'),
      actualizadoEn: new Date('2026-03-15T00:00:00.000Z'),
      tamanoBytes: 2048,
    };

    const leccion: LeccionOffline = {
      id: 'leccion-1',
      cursoId: 'curso-1',
      titulo: 'Variables y constantes',
      contenido: '<p>Contenido</p>',
      tipo: 'TEXTO',
      orden: 1,
      actualizadoEn: new Date('2026-03-15T00:00:00.000Z'),
    };

    await db.cursos.add(curso);
    await db.lecciones.add(leccion);

    const cursoGuardado = await db.cursos.get('curso-1');
    const leccionesCurso = await db.lecciones
      .where('cursoId')
      .equals('curso-1')
      .toArray();

    expect(cursoGuardado).toMatchObject({
      id: 'curso-1',
      slug: 'intro-algebra',
      titulo: 'Introduccion al Algebra',
    });
    expect(leccionesCurso).toHaveLength(1);
    expect(leccionesCurso[0]).toMatchObject({
      id: 'leccion-1',
      cursoId: 'curso-1',
      orden: 1,
    });
  });

  it('deberia consultar progreso pendiente de sincronizacion', async () => {
    const progreso: ProgresoOffline = {
      leccionId: 'leccion-2',
      cursoId: 'curso-1',
      completada: true,
      timestamp: new Date('2026-03-15T01:00:00.000Z'),
      sincronizado: 0,
    };

    await db.progreso.add(progreso);

    const pendientes = await db.progreso
      .where('sincronizado')
      .equals(0)
      .toArray();

    expect(pendientes).toHaveLength(1);
    expect(pendientes[0]).toMatchObject({
      leccionId: 'leccion-2',
      sincronizado: 0,
    });
  });
});
