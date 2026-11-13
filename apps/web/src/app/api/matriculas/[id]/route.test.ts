import { PATCH } from './route';

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

describe('API /api/matriculas/[id]', () => {
  beforeEach(() => {
    process.env.API_URL = 'http://api.test';
    global.fetch = jest.fn();
  });
  afterEach(() => jest.resetAllMocks());

  it('devuelve 401 sin autenticación', async () => {
    getAuthenticatedBackendToken.mockResolvedValue(null);
    const response = await PATCH(
      { json: async () => ({ estado: 'BAJA' }) } as never,
      { params: Promise.resolve({ id: 'm-1' }) }
    );
    expect(response.status).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('reenvía PATCH con cuerpo y conserva estado y respuesta', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({ matricula: { id: 'm-1', estado: 'BAJA' } }),
    });
    const payload = { estado: 'BAJA', observaciones: 'Traslado' };
    const response = await PATCH({ json: async () => payload } as never, {
      params: Promise.resolve({ id: 'm-1' }),
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/matriculas/m-1',
      {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );
    expect(response).toEqual({
      body: { matricula: { id: 'm-1', estado: 'BAJA' } },
      status: 200,
    });
  });
});
