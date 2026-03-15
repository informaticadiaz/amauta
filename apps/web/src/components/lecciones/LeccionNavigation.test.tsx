/**
 * Tests para LeccionNavigation
 * Verifica la navegación anterior/siguiente entre lecciones
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { LeccionNavigation } from './LeccionNavigation';

const mockLeccionAnterior = { id: 'lec-1', titulo: 'Introducción' };
const mockLeccionSiguiente = { id: 'lec-3', titulo: 'Práctica' };

describe('LeccionNavigation', () => {
  it('debería mostrar botón anterior cuando hay lección previa', () => {
    render(
      <LeccionNavigation
        cursoSlug="mi-curso"
        leccionAnterior={mockLeccionAnterior}
        leccionSiguiente={null}
      />
    );
    expect(screen.getByRole('link', { name: /anterior/i })).toBeInTheDocument();
  });

  it('debería mostrar botón siguiente cuando hay lección siguiente', () => {
    render(
      <LeccionNavigation
        cursoSlug="mi-curso"
        leccionAnterior={null}
        leccionSiguiente={mockLeccionSiguiente}
      />
    );
    expect(
      screen.getByRole('link', { name: /siguiente/i })
    ).toBeInTheDocument();
  });

  it('debería mostrar ambos botones cuando hay anterior y siguiente', () => {
    render(
      <LeccionNavigation
        cursoSlug="mi-curso"
        leccionAnterior={mockLeccionAnterior}
        leccionSiguiente={mockLeccionSiguiente}
      />
    );
    expect(screen.getByRole('link', { name: /anterior/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /siguiente/i })
    ).toBeInTheDocument();
  });

  it('no debería mostrar botón anterior en la primera lección', () => {
    render(
      <LeccionNavigation
        cursoSlug="mi-curso"
        leccionAnterior={null}
        leccionSiguiente={mockLeccionSiguiente}
      />
    );
    expect(
      screen.queryByRole('link', { name: /anterior/i })
    ).not.toBeInTheDocument();
  });

  it('no debería mostrar botón siguiente en la última lección', () => {
    render(
      <LeccionNavigation
        cursoSlug="mi-curso"
        leccionAnterior={mockLeccionAnterior}
        leccionSiguiente={null}
      />
    );
    expect(
      screen.queryByRole('link', { name: /siguiente/i })
    ).not.toBeInTheDocument();
  });

  it('debería incluir el título de la lección anterior en el botón', () => {
    render(
      <LeccionNavigation
        cursoSlug="mi-curso"
        leccionAnterior={mockLeccionAnterior}
        leccionSiguiente={null}
      />
    );
    expect(screen.getByText('Introducción')).toBeInTheDocument();
  });

  it('debería incluir el título de la lección siguiente en el botón', () => {
    render(
      <LeccionNavigation
        cursoSlug="mi-curso"
        leccionAnterior={null}
        leccionSiguiente={mockLeccionSiguiente}
      />
    );
    expect(screen.getByText('Práctica')).toBeInTheDocument();
  });

  it('debería linkear a la URL correcta de cada lección', () => {
    render(
      <LeccionNavigation
        cursoSlug="mi-curso"
        leccionAnterior={mockLeccionAnterior}
        leccionSiguiente={mockLeccionSiguiente}
      />
    );
    const linkAnterior = screen.getByRole('link', { name: /anterior/i });
    const linkSiguiente = screen.getByRole('link', { name: /siguiente/i });
    expect(linkAnterior).toHaveAttribute(
      'href',
      '/cursos/mi-curso/lecciones/lec-1'
    );
    expect(linkSiguiente).toHaveAttribute(
      'href',
      '/cursos/mi-curso/lecciones/lec-3'
    );
  });
});
