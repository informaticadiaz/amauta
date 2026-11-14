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

describe('API /api/me/horarios', () => {
  beforeEach(() => {
    process.env.API_URL = 'http://api.test';
    global.fetch = jest.fn();
  });

  afterEach(() => jest.resetAllMocks());

  it('rechaza la consulta sin autenticación', async () => {
    getAuthenticatedBackendToken.mockResolvedValue(null);

    const response = await GET({
      url: 'http://localhost/api/me/horarios',
    } as never);

    expect(response.status).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('reenvía el horario semanal del estudiante', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({ horarios: [] }),
    });

    const response = await GET({
      url: 'http://localhost/api/me/horarios?diaSemana=VIE',
    } as never);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/me/horarios?diaSemana=VIE',
      { headers: { Authorization: 'Bearer token-demo' } }
    );
    expect(response).toEqual({ body: { horarios: [] }, status: 200 });
  });
});
