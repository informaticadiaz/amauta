/**
 * Tests para EducadoresList
 */

import { render, screen } from '@testing-library/react';
import { EducadoresList } from './EducadoresList';

const mockEducadores = [
  {
    id: 'edu-1',
    email: 'profe@test.com',
    nombre: 'Juan',
    apellido: 'López',
    rol: 'TITULAR',
    asignadoEn: '2026-03-01T10:00:00Z',
  },
];

describe('EducadoresList', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    // @ts-expect-error - mock confirm
    global.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debería renderizar educadores asignados', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        educadores: mockEducadores,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }),
    });

    render(<EducadoresList grupoId="grupo-1" />);

    expect(await screen.findByText('Juan López')).toBeInTheDocument();
    expect(screen.getByText('TITULAR')).toBeInTheDocument();
  });
});
