/**
 * Tests para LeccionSidebar
 * Verifica la navegación lateral con lista de lecciones
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeccionSidebar } from './LeccionSidebar';

const mockLecciones = [
  { id: 'lec-1', titulo: 'Introducción', orden: 1, duracion: 10, publicada: true },
  { id: 'lec-2', titulo: 'Conceptos básicos', orden: 2, duracion: 15, publicada: true },
  { id: 'lec-3', titulo: 'Práctica', orden: 3, duracion: 20, publicada: true },
];

describe('LeccionSidebar', () => {
  it('debería mostrar la lista de lecciones', () => {
    render(
      <LeccionSidebar
        lecciones={mockLecciones}
        leccionActivaId="lec-1"
        cursoSlug="mi-curso"
      />
    );
    expect(screen.getByText('Introducción')).toBeInTheDocument();
    expect(screen.getByText('Conceptos básicos')).toBeInTheDocument();
    expect(screen.getByText('Práctica')).toBeInTheDocument();
  });

  it('debería marcar la lección activa visualmente', () => {
    render(
      <LeccionSidebar
        lecciones={mockLecciones}
        leccionActivaId="lec-2"
        cursoSlug="mi-curso"
      />
    );
    const leccionActiva = screen.getByText('Conceptos básicos').closest('a, div, li');
    expect(leccionActiva).toHaveAttribute('aria-current', 'true');
  });

  it('debería mostrar la duración de cada lección', () => {
    render(
      <LeccionSidebar
        lecciones={mockLecciones}
        leccionActivaId="lec-1"
        cursoSlug="mi-curso"
      />
    );
    expect(screen.getByText('10min')).toBeInTheDocument();
    expect(screen.getByText('15min')).toBeInTheDocument();
  });

  it('debería mostrar botón para colapsar/expandir en móvil', () => {
    render(
      <LeccionSidebar
        lecciones={mockLecciones}
        leccionActivaId="lec-1"
        cursoSlug="mi-curso"
      />
    );
    const toggleBtn = screen.getByRole('button', { name: /lecciones|menú|contenido/i });
    expect(toggleBtn).toBeInTheDocument();
  });

  it('debería colapsar el sidebar al hacer click en el botón', () => {
    render(
      <LeccionSidebar
        lecciones={mockLecciones}
        leccionActivaId="lec-1"
        cursoSlug="mi-curso"
      />
    );
    const toggleBtn = screen.getByRole('button', { name: /lecciones|menú|contenido/i });
    fireEvent.click(toggleBtn);
    // Verificar que el sidebar se colapsa
    const sidebar = screen.getByTestId('leccion-sidebar');
    expect(sidebar).toHaveAttribute('data-collapsed', 'true');
  });

  it('debería mostrar el número total de lecciones', () => {
    render(
      <LeccionSidebar
        lecciones={mockLecciones}
        leccionActivaId="lec-1"
        cursoSlug="mi-curso"
      />
    );
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });
});
