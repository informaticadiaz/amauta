/**
 * Tests para ProgresoBar
 * Verifica la barra de progreso visual del curso
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgresoBar } from './ProgresoBar';

describe('ProgresoBar', () => {
  it('debería mostrar el porcentaje como texto', () => {
    render(<ProgresoBar porcentaje={45} />);
    expect(screen.getByText(/45%/)).toBeInTheDocument();
  });

  it('debería mostrar 0% cuando el progreso es cero', () => {
    render(<ProgresoBar porcentaje={0} />);
    expect(screen.getByText(/0%/)).toBeInTheDocument();
  });

  it('debería mostrar 100% cuando el curso está completo', () => {
    render(<ProgresoBar porcentaje={100} />);
    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });

  it('debería renderizar la barra de progreso con data-testid', () => {
    render(<ProgresoBar porcentaje={60} />);
    expect(screen.getByTestId('progreso-bar')).toBeInTheDocument();
  });

  it('debería reflejar el ancho correcto en el fill de la barra', () => {
    render(<ProgresoBar porcentaje={75} />);
    const fill = screen.getByTestId('progreso-bar-fill');
    expect(fill).toHaveStyle({ width: '75%' });
  });

  it('debería mostrar texto personalizado de etiqueta si se provee', () => {
    render(<ProgresoBar porcentaje={30} label="Progreso del curso" />);
    expect(screen.getByText(/Progreso del curso/i)).toBeInTheDocument();
  });

  it('debería mostrar la cantidad de lecciones completadas si se provee', () => {
    render(
      <ProgresoBar porcentaje={50} leccionesCompletadas={3} totalLecciones={6} />
    );
    expect(screen.getByText(/3.*6|3 de 6/i)).toBeInTheDocument();
  });

  it('debería tener aria-label accesible', () => {
    render(<ProgresoBar porcentaje={40} />);
    const barra = screen.getByRole('progressbar');
    expect(barra).toBeInTheDocument();
    expect(barra).toHaveAttribute('aria-valuenow', '40');
  });
});
