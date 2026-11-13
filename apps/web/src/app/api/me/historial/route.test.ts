import { GET } from './route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

jest.mock('@/lib/backend-auth', () => ({
  createUnauthorizedResponse: jest.fn(() => ({ status: 401 })),
  getAuthenticatedBackendToken: jest.fn(),
}));

const { createUnauthorizedResponse, getAuthenticatedBackendToken } =
  jest.requireMock('@/lib/backend-auth') as {
    createUnauthorizedResponse: jest.Mock;
    getAuthenticatedBackendToken: jest.Mock;
  };

describe('API /api/me/historial', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('devuelve 401 sin autenticación y no consulta el backend', async () => {
    getAuthenticatedBackendToken.mockResolvedValue(null);

    const response = await GET({} as never);

    expect(response.status).toBe(401);
    expect(createUnauthorizedResponse).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('reenvía la consulta autenticada y conserva respuesta y estado', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    const payload = {
      estudianteId: 'student-1',
      periodos: [],
      promedioAcumulado: null,
      evolucionPorMateria: [],
      estadoPromocion: [],
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => payload,
    });

    const response = await GET({} as never);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(payload);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/me/historial',
      { headers: { Authorization: 'Bearer token-demo' } }
    );
  });
});
