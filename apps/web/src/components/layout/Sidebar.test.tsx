import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';

jest.mock('@/hooks/useAuthorization', () => ({
  useAuthorization: jest.fn(),
}));

const { useAuthorization } = jest.requireMock('@/hooks/useAuthorization') as {
  useAuthorization: jest.Mock;
};

describe('Sidebar', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debería mostrar acceso a asistencias para educador autenticado', () => {
    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      canManageCourses: true,
      canEnrollInCourses: false,
      isAdmin: false,
      isAdminEscuela: false,
      isEducador: true,
    });

    render(<Sidebar />);

    expect(
      screen.getByRole('link', { name: /asistencias/i })
    ).toBeInTheDocument();
  });

  it('debería mostrar acceso a matrículas para admin de escuela', () => {
    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      canManageCourses: true,
      canEnrollInCourses: false,
      isAdmin: true,
      isAdminEscuela: true,
      isEducador: false,
    });

    render(<Sidebar />);

    expect(
      screen.getByRole('link', { name: /matrículas/i })
    ).toBeInTheDocument();
  });

  it('debería mostrar historial académico para estudiante', () => {
    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      canManageCourses: false,
      canEnrollInCourses: true,
      isAdmin: false,
      isAdminEscuela: false,
      isEducador: false,
      isEstudiante: true,
    });

    render(<Sidebar />);

    expect(
      screen.getByRole('link', { name: /historial académico/i })
    ).toHaveAttribute('href', '/dashboard/historial');
  });

  it('debería mostrar historial de estudiantes para admin de escuela', () => {
    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      canManageCourses: true,
      canEnrollInCourses: false,
      isAdmin: true,
      isAdminEscuela: true,
      isEducador: false,
      isEstudiante: false,
    });

    render(<Sidebar />);

    expect(
      screen.getByRole('link', { name: /historial de estudiantes/i })
    ).toHaveAttribute('href', '/dashboard/historial/estudiantes');
  });

  it('no debería mostrar acceso a asistencias para estudiante', () => {
    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      canManageCourses: false,
      canEnrollInCourses: true,
      isAdmin: false,
      isAdminEscuela: false,
      isEducador: false,
    });

    render(<Sidebar />);

    expect(
      screen.queryByRole('link', { name: /asistencias/i })
    ).not.toBeInTheDocument();
  });
});
