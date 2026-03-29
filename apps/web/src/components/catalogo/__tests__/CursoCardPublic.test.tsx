/**
 * Tests para CursoCardPublic
 */

import { render, screen } from '@testing-library/react';
import { CursoCardPublic } from '../CursoCardPublic';

// Mock de next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('CursoCardPublic', () => {
  const cursoMock = {
    id: '1',
    titulo: 'Introducción a JavaScript',
    descripcion: 'Aprende los fundamentos de JavaScript desde cero',
    slug: 'introduccion-javascript',
    imagen: '/uploads/cursos/test.webp',
    nivel: 'PRINCIPIANTE' as const,
    duracion: 180, // 3 horas
    categoria: {
      id: 'cat1',
      nombre: 'Programación',
    },
    _count: {
      lecciones: 12,
      inscripciones: 45,
    },
  };

  it('renderiza correctamente la información del curso', () => {
    render(<CursoCardPublic curso={cursoMock} />);

    expect(screen.getByText('Introducción a JavaScript')).toBeInTheDocument();
    expect(
      screen.getByText('Aprende los fundamentos de JavaScript desde cero')
    ).toBeInTheDocument();
    expect(screen.getByText('Programación')).toBeInTheDocument();
    expect(screen.getByText('Principiante')).toBeInTheDocument();
  });

  it('muestra las estadísticas correctamente', () => {
    render(<CursoCardPublic curso={cursoMock} />);

    expect(screen.getByText(/12/)).toBeInTheDocument();
    expect(screen.getByText(/lecciones/)).toBeInTheDocument();
    expect(screen.getByText(/3h 0min/)).toBeInTheDocument();
    expect(screen.getByText(/45/)).toBeInTheDocument();
    expect(screen.getByText(/estudiantes/)).toBeInTheDocument();
  });

  it('muestra imagen placeholder cuando no hay imagen', () => {
    const cursoSinImagen = { ...cursoMock, imagen: null };
    render(<CursoCardPublic curso={cursoSinImagen} />);

    // Verifica que se muestre el SVG de placeholder
    const svgElement = screen.getByRole('link').querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('enlaza correctamente a la página de detalle', () => {
    render(<CursoCardPublic curso={cursoMock} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/cursos/introduccion-javascript');
  });

  it('muestra el badge de nivel Principiante', () => {
    render(<CursoCardPublic curso={cursoMock} />);

    expect(screen.getByText('Principiante')).toBeInTheDocument();
  });

  it('muestra el nivel Intermedio correctamente', () => {
    const cursoIntermedio = { ...cursoMock, nivel: 'INTERMEDIO' as const };
    render(<CursoCardPublic curso={cursoIntermedio} />);

    expect(screen.getByText('Intermedio')).toBeInTheDocument();
  });

  it('muestra el nivel Avanzado correctamente', () => {
    const cursoAvanzado = { ...cursoMock, nivel: 'AVANZADO' as const };
    render(<CursoCardPublic curso={cursoAvanzado} />);

    expect(screen.getByText('Avanzado')).toBeInTheDocument();
  });

  it('formatea correctamente la duración', () => {
    const curso90min = { ...cursoMock, duracion: 90 };
    render(<CursoCardPublic curso={curso90min} />);

    expect(screen.getByText(/1h 30min/)).toBeInTheDocument();
  });

  it('no muestra estadísticas si no están disponibles', () => {
    const cursoSinStats = {
      ...cursoMock,
      _count: undefined,
      duracion: null,
    };
    render(<CursoCardPublic curso={cursoSinStats} />);

    expect(screen.queryByText(/lecciones/)).not.toBeInTheDocument();
    expect(screen.queryByText(/estudiantes/)).not.toBeInTheDocument();
  });

  it('muestra singular para 1 lección', () => {
    const cursoUnaLeccion = {
      ...cursoMock,
      _count: { lecciones: 1, inscripciones: 0 },
    };
    render(<CursoCardPublic curso={cursoUnaLeccion} />);

    expect(screen.getByText(/1 lección/)).toBeInTheDocument();
  });

  it('muestra singular para 1 estudiante', () => {
    const cursoUnEstudiante = {
      ...cursoMock,
      _count: { lecciones: 0, inscripciones: 1 },
    };
    render(<CursoCardPublic curso={cursoUnEstudiante} />);

    expect(screen.getByText(/1 estudiante/)).toBeInTheDocument();
  });
});
