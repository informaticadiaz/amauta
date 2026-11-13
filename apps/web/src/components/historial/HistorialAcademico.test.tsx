import { render, screen } from '@testing-library/react';
import { HistorialAcademico, type HistorialData } from './HistorialAcademico';

const historial: HistorialData = {
  estudianteId: 'student-1',
  promedioAcumulado: 8.25,
  estadoPromocion: [
    {
      periodoId: 'periodo-1',
      periodo: 'Primer trimestre',
      grupoId: 'group-a',
      grupo: '3° A',
      estado: 'PROMOVIDO',
    },
  ],
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
    expect(screen.getByText('PROMOVIDO')).toBeInTheDocument();
  });

  it('muestra SIN EVALUAR cuando el período no tiene estado persistido', () => {
    render(
      <HistorialAcademico
        data={{
          ...historial,
          estadoPromocion: null,
        }}
      />
    );

    expect(screen.getByText('SIN EVALUAR')).toBeInTheDocument();
  });

  it('muestra estados persistidos por grupo', () => {
    render(
      <HistorialAcademico
        data={{
          ...historial,
          periodos: [
            {
              ...historial.periodos[0],
              calificaciones: [
                ...historial.periodos[0].calificaciones,
                {
                  materia: { id: 'language', nombre: 'Lengua' },
                  nota: 7,
                  observaciones: null,
                  grupo: { nombre: '3° B' },
                },
                {
                  materia: { id: 'science', nombre: 'Ciencias' },
                  nota: 6,
                  observaciones: null,
                  grupo: { nombre: '3° C' },
                },
              ],
            },
          ],
          estadoPromocion: [
            {
              periodoId: 'periodo-1',
              periodo: 'Primer trimestre',
              grupoId: 'group-a',
              grupo: '3° A',
              estado: 'PROMOVIDO',
            },
            {
              periodoId: 'periodo-1',
              periodo: 'Primer trimestre',
              grupoId: 'group-b',
              grupo: '3° B',
              estado: 'REPITENTE',
            },
            {
              periodoId: 'periodo-1',
              periodo: 'Primer trimestre',
              grupoId: 'group-c',
              grupo: '3° C',
              estado: 'EGRESADO',
            },
          ],
        }}
      />
    );

    expect(screen.getByText('PROMOVIDO')).toBeInTheDocument();
    expect(screen.getByText('REPITENTE')).toBeInTheDocument();
    expect(screen.getByText('EGRESADO')).toBeInTheDocument();
  });

  it('muestra un estado persistido en un período sin calificaciones', () => {
    render(
      <HistorialAcademico
        data={{
          ...historial,
          periodos: [
            {
              ...historial.periodos[0],
              promedio: null,
              calificaciones: [],
            },
          ],
          evolucionPorMateria: [],
        }}
      />
    );

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('PROMOVIDO')).toBeInTheDocument();
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
