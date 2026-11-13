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

const { createUnauthorizedResponse, getAuthenticatedBackendToken } =
  jest.requireMock('@/lib/backend-auth') as {
    createUnauthorizedResponse: jest.Mock;
    getAuthenticatedBackendToken: jest.Mock;
  };

describe('API historial administrativo', () => {
  beforeEach(() => {
    process.env.API_URL = 'http://api.test';
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('rechaza la consulta sin autenticación', async () => {
    getAuthenticatedBackendToken.mockResolvedValue(null);

    const response = await GET({} as never, {
      params: Promise.resolve({
        institucionId: 'inst-1',
        estudianteId: 'est-1',
      }),
    });

    expect(response.status).toBe(401);
    expect(createUnauthorizedResponse).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('reenvía institución, estudiante y token, conservando estado y cuerpo', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    const payload = { estudianteId: 'est-1', periodos: [] };
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 206,
      json: async () => payload,
    });

    const response = await GET({} as never, {
      params: Promise.resolve({
        institucionId: 'inst-1',
        estudianteId: 'est-1',
      }),
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/instituciones/inst-1/estudiantes/est-1/historial',
      { headers: { Authorization: 'Bearer token-demo' } }
    );
    expect(response).toEqual({ body: payload, status: 206 });
  });
});
