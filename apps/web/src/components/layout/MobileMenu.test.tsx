import { render, screen } from '@testing-library/react';
import { MobileMenu } from './MobileMenu';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/dashboard/historial'),
}));

jest.mock('@/hooks/useAuthorization', () => ({
  useAuthorization: jest.fn(),
}));

const { useAuthorization } = jest.requireMock('@/hooks/useAuthorization') as {
  useAuthorization: jest.Mock;
};

describe('MobileMenu', () => {
  it('muestra el historial académico para estudiantes', () => {
    useAuthorization.mockReturnValue({
      isAuthenticated: true,
      canManageCourses: false,
      isAdmin: false,
      isAdminEscuela: false,
      isEducador: false,
      isEstudiante: true,
    });

    render(<MobileMenu isOpen onClose={jest.fn()} />);

    expect(
      screen.getByRole('link', { name: /historial académico/i })
    ).toHaveAttribute('href', '/dashboard/historial');
  });

  it('oculta el historial académico para otros roles', () => {
    useAuthorization.mockReturnValue({
      isAuthenticated: true,
      canManageCourses: true,
      isAdmin: false,
      isAdminEscuela: false,
      isEducador: true,
      isEstudiante: false,
    });

    render(<MobileMenu isOpen onClose={jest.fn()} />);

    expect(
      screen.queryByRole('link', { name: /historial académico/i })
    ).not.toBeInTheDocument();
  });
});
