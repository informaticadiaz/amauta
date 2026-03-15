/**
 * Tests para CursosRecomendados
 * Verifica la sección de cursos sugeridos del dashboard
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { CursosRecomendados } from '../CursosRecomendados';

const mockCursos = [
  {
    id: 'cur-1',
    titulo: 'Fundamentos de Álgebra',
    slug: 'algebra-basica',
    imagen: null,
    nivel: 'PRINCIPIANTE' as const,
    descripcion: 'Aprende los fundamentos del álgebra.',
    educador: { nombre: 'Pedro', apellido: 'Sánchez' },
    _count: { lecciones: 12 },
  },
  {
    id: 'cur-2',
    titulo: 'Historia Argentina',
    slug: 'historia-argentina',
    imagen: null,
    nivel: 'INTERMEDIO' as const,
    descripcion: 'Un recorrido por la historia de Argentina.',
    educador: { nombre: 'Julia', apellido: 'Torres' },
    _count: { lecciones: 8 },
  },
];

describe('CursosRecomendados', () => {
  it('debería mostrar el título de la sección', () => {
    render(<CursosRecomendados cursos={mockCursos} />);
    expect(screen.getByText(/cursos recomendados/i)).toBeInTheDocument();
  });

  it('debería mostrar los títulos de los cursos recomendados', () => {
    render(<CursosRecomendados cursos={mockCursos} />);
    expect(screen.getByText('Fundamentos de Álgebra')).toBeInTheDocument();
    expect(screen.getByText('Historia Argentina')).toBeInTheDocument();
  });

  it('debería mostrar enlace a cada curso', () => {
    render(<CursosRecomendados cursos={mockCursos} />);
    const links = screen.getAllByRole('link');
    const cursoLinks = links.filter(
      (l) =>
        l.getAttribute('href')?.includes('/cursos/algebra-basica') ||
        l.getAttribute('href')?.includes('/cursos/historia-argentina')
    );
    expect(cursoLinks.length).toBeGreaterThan(0);
  });

  it('debería mostrar mensaje cuando no hay recomendaciones', () => {
    render(<CursosRecomendados cursos={[]} />);
    expect(screen.getByText(/explorá el catálogo/i)).toBeInTheDocument();
  });

  it('debería mostrar el nivel del curso', () => {
    render(<CursosRecomendados cursos={mockCursos} />);
    expect(screen.getByText(/principiante/i)).toBeInTheDocument();
  });

  it('debería mostrar un enlace para explorar más cursos', () => {
    render(<CursosRecomendados cursos={mockCursos} />);
    const explorarLink = screen.getByRole('link', { name: /ver catálogo/i });
    expect(explorarLink).toHaveAttribute('href', '/cursos');
  });
});
