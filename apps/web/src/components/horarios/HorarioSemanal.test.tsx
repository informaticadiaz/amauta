import { render, screen } from '@testing-library/react';
import { HorarioSemanal } from './HorarioSemanal';

describe('HorarioSemanal', () => {
  it('ordena las clases por día y hora y muestra estados vacíos por día', () => {
    render(
      <HorarioSemanal
        horarios={[
          {
            id: '2',
            grupoId: 'g',
            materiaId: 'm',
            educadorId: 'e',
            diaSemana: 'MAR',
            horaInicio: '10:00',
            horaFin: '11:00',
            activo: true,
            materia: { id: 'm', nombre: 'Historia' },
          },
          {
            id: '1',
            grupoId: 'g',
            materiaId: 'm',
            educadorId: 'e',
            diaSemana: 'LUN',
            horaInicio: '08:00',
            horaFin: '09:00',
            activo: true,
            materia: { id: 'm', nombre: 'Matemática' },
          },
        ]}
      />
    );
    expect(screen.getByText('Matemática')).toBeInTheDocument();
    expect(screen.getByText('Historia')).toBeInTheDocument();
    expect(screen.getAllByText('Sin clases')).toHaveLength(3);
  });

  it('muestra el mensaje vacío cuando no hay franjas', () => {
    render(<HorarioSemanal horarios={[]} emptyMessage="Sin horario cargado" />);
    expect(screen.getByText('Sin horario cargado')).toBeInTheDocument();
  });
});
