/**
 * Tests para ResumenProgreso
 * Verifica las estadísticas de aprendizaje del estudiante
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResumenProgreso } from '../ResumenProgreso';

describe('ResumenProgreso', () => {
  it('debería mostrar el número de cursos en progreso', () => {
    render(
      <ResumenProgreso enProgreso={3} completados={2} totalInscritos={5} />
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('debería mostrar el número de cursos completados', () => {
    render(
      <ResumenProgreso enProgreso={3} completados={2} totalInscritos={5} />
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('debería mostrar el total de cursos inscritos', () => {
    render(
      <ResumenProgreso enProgreso={3} completados={2} totalInscritos={5} />
    );
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('debería mostrar etiquetas descriptivas para cada estadística', () => {
    render(
      <ResumenProgreso enProgreso={3} completados={2} totalInscritos={5} />
    );
    expect(screen.getByText(/en progreso/i)).toBeInTheDocument();
    expect(screen.getByText(/completados/i)).toBeInTheDocument();
    expect(screen.getByText(/total inscritos/i)).toBeInTheDocument();
  });

  it('debería mostrar ceros cuando no hay actividad', () => {
    render(
      <ResumenProgreso enProgreso={0} completados={0} totalInscritos={0} />
    );
    const ceros = screen.getAllByText('0');
    expect(ceros.length).toBeGreaterThanOrEqual(3);
  });

  it('debería mostrar un título de sección', () => {
    render(
      <ResumenProgreso enProgreso={1} completados={0} totalInscritos={1} />
    );
    expect(screen.getByText(/mi progreso/i)).toBeInTheDocument();
  });
});
