import { render, screen } from '@testing-library/react';
import { CatalogoCursos } from '../CatalogoCursos';

jest.mock('../CursoCardPublic', () => ({
  CursoCardPublic: ({ curso }: { curso: { titulo: string } }) => (
    <article>{curso.titulo}</article>
  ),
}));

jest.mock('../PaginacionCursos', () => ({
  PaginacionCursos: ({
    currentPage,
    totalPages,
  }: {
    currentPage: number;
    totalPages: number;
  }) => (
    <nav aria-label="paginación">
      Página {currentPage} de {totalPages}
    </nav>
  ),
}));

const cursoBase = {
  id: '1',
  titulo: 'Curso de prueba',
  descripcion: 'Descripción',
  slug: 'curso-de-prueba',
  imagen: null,
  nivel: 'PRINCIPIANTE' as const,
  duracion: 60,
  categoria: { id: 'cat1', nombre: 'Programación' },
};

describe('CatalogoCursos', () => {
  it('muestra el error de carga sin presentarlo como catálogo vacío', () => {
    render(
      <CatalogoCursos
        cursosData={{ cursos: [], total: 0, page: 1, limit: 12, totalPages: 0 }}
        error="No se pudo conectar con la API."
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudo cargar el catálogo'
    );
    expect(
      screen.getByText('No se pudo conectar con la API.')
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/no se encontraron cursos/i)
    ).not.toBeInTheDocument();
  });

  it('muestra estado vacío cuando no hay cursos', () => {
    render(
      <CatalogoCursos
        cursosData={{ cursos: [], total: 0, page: 1, limit: 12, totalPages: 0 }}
      />
    );

    expect(screen.getByText(/no se encontraron cursos/i)).toBeInTheDocument();
    expect(screen.getByText(/ajustar tus filtros/i)).toBeInTheDocument();
  });

  it('muestra el contador de resultados cuando hay cursos', () => {
    const cursos = [cursoBase, { ...cursoBase, id: '2', titulo: 'Otro curso' }];
    render(
      <CatalogoCursos
        cursosData={{ cursos, total: 10, page: 1, limit: 12, totalPages: 1 }}
      />
    );

    expect(screen.getByText(/mostrando 2 de 10 cursos/i)).toBeInTheDocument();
  });

  it('muestra paginación cuando hay más de una página', () => {
    render(
      <CatalogoCursos
        cursosData={{
          cursos: [cursoBase],
          total: 25,
          page: 1,
          limit: 12,
          totalPages: 3,
        }}
      />
    );

    expect(
      screen.getByRole('navigation', { name: /paginación/i })
    ).toBeInTheDocument();
  });

  it('no muestra paginación con una sola página', () => {
    render(
      <CatalogoCursos
        cursosData={{
          cursos: [cursoBase],
          total: 1,
          page: 1,
          limit: 12,
          totalPages: 1,
        }}
      />
    );

    expect(
      screen.queryByRole('navigation', { name: /paginación/i })
    ).not.toBeInTheDocument();
  });
});
