import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TutorPage from './page';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('@/hooks/useAuthorization', () => ({ useAuthorization: jest.fn() }));
const { useRouter } = jest.requireMock('next/navigation') as {
  useRouter: jest.Mock;
};
const { useAuthorization } = jest.requireMock('@/hooks/useAuthorization') as {
  useAuthorization: jest.Mock;
};

const student = {
  id: 'link-1',
  relacion: 'MADRE',
  estudiante: {
    id: 'student-1',
    nombre: 'Ana',
    apellido: 'García',
    matricula: {
      institucionId: 'school-1',
      periodoAcademico: { id: 'period-1', nombre: 'Actual' },
    },
  },
};
const academic = {
  boletin: {
    estudiante: { nombre: 'Ana', apellido: 'García' },
    periodo: { nombre: 'Actual' },
    grupo: { nombre: '3° A' },
    calificaciones: [{ materia: 'Matemática', nota: 9, observaciones: null }],
    asistencia: {
      total: 2,
      presente: 2,
      ausente: 0,
      tardanza: 0,
      justificado: 0,
      porcentaje: 100,
    },
  },
  asistencias: {
    asistencias: [
      {
        fecha: '2026-11-14',
        estado: 'PRESENTE',
        observaciones: null,
        grupo: { nombre: '3° A' },
      },
    ],
    resumen: {
      total: 1,
      presente: 1,
      ausente: 0,
      tardanza: 0,
      justificado: 0,
      porcentaje: 100,
    },
  },
  calificaciones: {
    calificaciones: [
      {
        materia: { nombre: 'Matemática' },
        nota: 9,
        observaciones: null,
        grupo: { nombre: '3° A' },
      },
    ],
  },
  comunicados: {
    comunicados: [
      {
        id: 'notice-1',
        titulo: 'Reunión',
        contenido: 'Reunión familiar',
        tipo: 'GENERAL',
        prioridad: 'NORMAL',
        publicadoEn: '2026-11-14',
      },
    ],
  },
};

function mockTutor() {
  useAuthorization.mockReturnValue({
    isLoading: false,
    isAuthenticated: true,
    isTutor: true,
  });
}

describe('TutorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({ replace: jest.fn() });
    global.fetch = jest.fn();
  });

  it('muestra el estado de carga de estudiantes', () => {
    mockTutor();
    (global.fetch as jest.Mock).mockReturnValue(new Promise(() => undefined));
    render(<TutorPage />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Cargando estudiantes'
    );
  });

  it('muestra estado vacío cuando no hay vínculos activos', async () => {
    mockTutor();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ estudiantes: [] }),
    });
    render(<TutorPage />);
    expect(
      await screen.findByText(/No tenés estudiantes vinculados/)
    ).toBeInTheDocument();
  });

  it('muestra un error si falla la carga de estudiantes', async () => {
    mockTutor();
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Falla de red'));
    render(<TutorPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Falla de red');
  });

  it('permite seleccionar un estudiante y renderiza los cuatro bloques en solo lectura', async () => {
    mockTutor();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/me/tutor-estudiantes')
        return Promise.resolve({
          ok: true,
          json: async () => ({ estudiantes: [student] }),
        });
      return Promise.resolve({
        ok: true,
        json: async () =>
          academic[
            url.endsWith('/boletin')
              ? 'boletin'
              : url.endsWith('/asistencias')
                ? 'asistencias'
                : url.endsWith('/calificaciones')
                  ? 'calificaciones'
                  : 'comunicados'
          ],
      });
    });
    render(<TutorPage />);
    expect(await screen.findByDisplayValue('García, Ana')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText('Boletín · Actual')).toBeInTheDocument()
    );
    expect(screen.getByText('Asistencias')).toBeInTheDocument();
    expect(screen.getByText('Calificaciones')).toBeInTheDocument();
    expect(screen.getByText('Comunicados')).toBeInTheDocument();
    expect(screen.getByText('Reunión')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Estudiante'), {
      target: { value: 'student-1' },
    });
  });
});
