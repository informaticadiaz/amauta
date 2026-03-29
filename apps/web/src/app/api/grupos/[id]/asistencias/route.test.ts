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

describe('API /api/grupos/[id]/asistencias', () => {
  const originalEnv = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'http://api.test';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env.API_URL = originalEnv;
    jest.resetAllMocks();
  });

  it('debería reenviar la consulta GET con fecha y token al backend', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({ grupoId: 'grupo-1', estudiantes: [] }),
    });

    const response = await GET(
      {
        url: 'http://localhost/api/grupos/grupo-1/asistencias?fecha=2026-03-29',
      } as never,
      { params: Promise.resolve({ id: 'grupo-1' }) }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/grupos/grupo-1/asistencias?fecha=2026-03-29',
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
      json: async () => ({ message: 'ok' }),
    });

    const response = await PUT(
      {
        url: 'http://localhost/api/grupos/grupo-1/asistencias',
        json: async () => ({
          fecha: '2026-03-29',
          asistencias: [
            {
              estudianteId: 'cm8estudiante000000000000001',
              estado: 'PRESENTE',
            },
          ],
        }),
      } as never,
      { params: Promise.resolve({ id: 'grupo-1' }) }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/grupos/grupo-1/asistencias',
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-demo',
        },
        body: JSON.stringify({
          fecha: '2026-03-29',
          asistencias: [
            {
              estudianteId: 'cm8estudiante000000000000001',
              estado: 'PRESENTE',
            },
          ],
        }),
      })
    );
    expect(response.status).toBe(200);
  });
});
