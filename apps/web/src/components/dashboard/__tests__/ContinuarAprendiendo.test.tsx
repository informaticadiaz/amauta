/**
 * Tests para ContinuarAprendiendo
 * Verifica la sección de cursos en progreso del dashboard
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ContinuarAprendiendo } from '../ContinuarAprendiendo';

const mockInscripciones = [
  {
    id: 'ins-1',
    estado: 'ACTIVO' as const,
    progreso: 45,
    inscritoEn: '2024-01-01T00:00:00.000Z',
    curso: {
      id: 'cur-1',
      titulo: 'Introducción a Python',
      slug: 'intro-python',
      imagen: null,
      nivel: 'PRINCIPIANTE' as const,
      educador: { nombre: 'Ana', apellido: 'García' },
      _count: { lecciones: 10 },
    },
  },
  {
    id: 'ins-2',
    estado: 'ACTIVO' as const,
    progreso: 20,
    inscritoEn: '2024-01-05T00:00:00.000Z',
    curso: {
      id: 'cur-2',
      titulo: 'Diseño UX/UI',
      slug: 'diseno-ux-ui',
      imagen: null,
      nivel: 'INTERMEDIO' as const,
      educador: { nombre: 'Carlos', apellido: 'López' },
      _count: { lecciones: 8 },
    },
  },
];

describe('ContinuarAprendiendo', () => {
  it('debería mostrar el título de la sección', () => {
    render(<ContinuarAprendiendo inscripciones={mockInscripciones} />);
    expect(screen.getByText(/continuar aprendiendo/i)).toBeInTheDocument();
  });

  it('debería mostrar los cursos en progreso', () => {
    render(<ContinuarAprendiendo inscripciones={mockInscripciones} />);
    expect(screen.getByText('Introducción a Python')).toBeInTheDocument();
    expect(screen.getByText('Diseño UX/UI')).toBeInTheDocument();
  });

  it('debería mostrar el porcentaje de progreso de cada curso', () => {
    render(<ContinuarAprendiendo inscripciones={mockInscripciones} />);
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('debería mostrar botón "Continuar" con enlace al curso', () => {
    render(<ContinuarAprendiendo inscripciones={mockInscripciones} />);
    const links = screen.getAllByRole('link', { name: /continuar/i });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute('href', '/cursos/intro-python');
  });

  it('debería mostrar mensaje vacío cuando no hay cursos en progreso', () => {
    render(<ContinuarAprendiendo inscripciones={[]} />);
    expect(
      screen.getByText(/no tenés cursos en progreso/i)
    ).toBeInTheDocument();
  });

  it('debería mostrar máximo 3 cursos', () => {
    const muchosCursos = [
      ...mockInscripciones,
      {
        id: 'ins-3',
        estado: 'ACTIVO' as const,
        progreso: 10,
        inscritoEn: '2024-01-10T00:00:00.000Z',
        curso: {
          id: 'cur-3',
          titulo: 'JavaScript Avanzado',
          slug: 'js-avanzado',
          imagen: null,
          nivel: 'AVANZADO' as const,
          educador: { nombre: 'Luis', apellido: 'Martínez' },
          _count: { lecciones: 15 },
        },
      },
      {
        id: 'ins-4',
        estado: 'ACTIVO' as const,
        progreso: 5,
        inscritoEn: '2024-01-15T00:00:00.000Z',
        curso: {
          id: 'cur-4',
          titulo: 'CSS Moderno',
          slug: 'css-moderno',
          imagen: null,
          nivel: 'PRINCIPIANTE' as const,
          educador: { nombre: 'María', apellido: 'Pérez' },
          _count: { lecciones: 6 },
        },
      },
    ];
    render(<ContinuarAprendiendo inscripciones={muchosCursos} />);
    const links = screen.getAllByRole('link', { name: /continuar/i });
    expect(links.length).toBeLessThanOrEqual(3);
  });

  it('debería mostrar el nombre del educador', () => {
    render(<ContinuarAprendiendo inscripciones={mockInscripciones} />);
    expect(screen.getByText('Ana García')).toBeInTheDocument();
  });
});
