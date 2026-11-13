import { render, screen } from '@testing-library/react';
import { HistorialAcademico, type HistorialData } from './HistorialAcademico';

const historial: HistorialData = {
  estudianteId: 'student-1',
  promedioAcumulado: 8.25,
  estadoPromocion: null,
  periodos: [
    {
      id: 'periodo-1',
      nombre: 'Primer trimestre',
      orden: 1,
      promedio: 8.5,
      calificaciones: [
        {
          materia: { id: 'math', nombre: 'Matemática' },
          nota: 9,
          observaciones: null,
          grupo: { nombre: '3° A' },
        },
      ],
    },
  ],
  evolucionPorMateria: [
    {
      materia: { id: 'math', nombre: 'Matemática' },
      periodos: [
        { periodoId: 'periodo-1', periodo: 'Primer trimestre', promedio: 9 },
      ],
    },
  ],
};

describe('HistorialAcademico', () => {
  it('muestra promedio, periodos, notas y evolución por materia', () => {
    render(<HistorialAcademico data={historial} />);

    expect(screen.getByText('8.25')).toBeInTheDocument();
    expect(screen.getByText('Primer trimestre')).toBeInTheDocument();
    expect(screen.getAllByText('Matemática')).toHaveLength(2);
    expect(screen.getByText('3° A')).toBeInTheDocument();
    expect(screen.getByText('9.00')).toBeInTheDocument();
    expect(screen.getByText('Primer trimestre: 9.00')).toBeInTheDocument();
  });

  it('muestra el estado vacío cuando no hay periodos', () => {
    render(
      <HistorialAcademico
        data={{ ...historial, periodos: [], evolucionPorMateria: [] }}
      />
    );

    expect(
      screen.getByText('Todavía no tenés calificaciones registradas.')
    ).toBeInTheDocument();
  });
});
