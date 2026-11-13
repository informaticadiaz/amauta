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

describe('proxy de preview de cierre académico', () => {
  beforeEach(() => {
    process.env.API_URL = 'http://api.test';
    global.fetch = jest.fn();
  });
  afterEach(() => jest.resetAllMocks());

  it('rechaza solicitudes sin sesión', async () => {
    getAuthenticatedBackendToken.mockResolvedValue(null);
    const response = await GET({} as never, {
      params: Promise.resolve({ id: 'inst-1', periodoId: 'p-1' }),
    });
    expect(response.status).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('reenvía el preview autenticado', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({ periodo: { estadoCierre: 'ABIERTO' } }),
    });
    const response = await GET({} as never, {
      params: Promise.resolve({ id: 'inst-1', periodoId: 'p-1' }),
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/instituciones/inst-1/periodos/p-1/cierre-academico/preview',
      { headers: { Authorization: 'Bearer token' } }
    );
    expect(response.status).toBe(200);
  });
});
