import { GET, PUT } from './route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    }),
  },
}));

jest.mock('@/lib/backend-auth', () => ({
  createUnauthorizedResponse: jest.fn(
    () => new Response(null, { status: 401 })
  ),
  getAuthenticatedBackendToken: jest.fn(),
}));

const { getAuthenticatedBackendToken } = jest.requireMock(
  '@/lib/backend-auth'
) as {
  getAuthenticatedBackendToken: jest.Mock;
};

describe('API /api/grupos/[id]/calificaciones', () => {
  const originalEnv = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'http://api.test';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env.API_URL = originalEnv;
    jest.resetAllMocks();
  });

  it('debería reenviar GET con periodoAcademicoId y materia al backend', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({
        grupoId: 'grupo-1',
        periodoAcademicoId: 'periodo-1',
        materia: 'Matemática',
        estudiantes: [],
      }),
    });

    const response = await GET(
      {
        url: 'http://localhost/api/grupos/grupo-1/calificaciones?periodoAcademicoId=periodo-1&materia=Matem%C3%A1tica',
      } as never,
      { params: Promise.resolve({ id: 'grupo-1' }) }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/grupos/grupo-1/calificaciones?periodoAcademicoId=periodo-1&materia=Matem%C3%A1tica',
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer token-demo' },
      })
    );
    expect(response.status).toBe(200);
  });

  it('debería reenviar el payload del PUT al backend', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({
        resultado: { grupoId: 'grupo-1', procesadas: 1 },
        message: 'Calificaciones cargadas exitosamente',
      }),
    });

    const response = await PUT(
      {
        url: 'http://localhost/api/grupos/grupo-1/calificaciones',
        json: async () => ({
          periodoAcademicoId: 'periodo-1',
          materia: 'Matemática',
          calificaciones: [
            {
              estudianteId: 'cm8estudiante000000000000001',
              nota: 9,
            },
          ],
        }),
      } as never,
      { params: Promise.resolve({ id: 'grupo-1' }) }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/grupos/grupo-1/calificaciones',
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-demo',
        },
        body: JSON.stringify({
          periodoAcademicoId: 'periodo-1',
          materia: 'Matemática',
          calificaciones: [
            {
              estudianteId: 'cm8estudiante000000000000001',
              nota: 9,
            },
          ],
        }),
      })
    );
    expect(response.status).toBe(200);
  });
});
