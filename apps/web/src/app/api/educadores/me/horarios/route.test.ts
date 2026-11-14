import { GET } from './route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    }),
  },
}));

jest.mock('@/lib/backend-auth', () => ({
  createUnauthorizedResponse: jest.fn(() => ({ status: 401 })),
  getAuthenticatedBackendToken: jest.fn(),
}));

const { getAuthenticatedBackendToken } = jest.requireMock(
  '@/lib/backend-auth'
) as { getAuthenticatedBackendToken: jest.Mock };

describe('API /api/educadores/me/horarios', () => {
  beforeEach(() => {
    process.env.API_URL = 'http://api.test';
    global.fetch = jest.fn();
  });

  afterEach(() => jest.resetAllMocks());

  it('rechaza la consulta sin autenticación', async () => {
    getAuthenticatedBackendToken.mockResolvedValue(null);

    const response = await GET({
      url: 'http://localhost/api/educadores/me/horarios',
    } as never);

    expect(response.status).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('reenvía el horario semanal del educador y conserva el estado', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({ horarios: [] }),
    });

    const response = await GET({
      url: 'http://localhost/api/educadores/me/horarios?diaSemana=MAR',
    } as never);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/educadores/me/horarios?diaSemana=MAR',
      { headers: { Authorization: 'Bearer token-demo' } }
    );
    expect(response).toEqual({ body: { horarios: [] }, status: 200 });
  });
});
