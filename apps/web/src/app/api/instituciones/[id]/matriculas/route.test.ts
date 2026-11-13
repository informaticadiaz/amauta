import { GET, POST } from './route';

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

describe('API /api/instituciones/[id]/matriculas', () => {
  beforeEach(() => {
    process.env.API_URL = 'http://api.test';
    global.fetch = jest.fn();
  });
  afterEach(() => jest.resetAllMocks());

  it('rechaza una consulta sin autenticación', async () => {
    getAuthenticatedBackendToken.mockResolvedValue(null);
    const response = await GET(
      { url: 'http://localhost/api/instituciones/i-1/matriculas' } as never,
      { params: Promise.resolve({ id: 'i-1' }) }
    );
    expect(response.status).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('reenvía filtros, token y conserva estado y cuerpo', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 206,
      json: async () => ({ matriculas: [], total: 0 }),
    });
    const response = await GET(
      {
        url: 'http://localhost/api/instituciones/i-1/matriculas?page=2&limit=20&periodoAcademicoId=p-1&estado=BAJA&buscar=Ana&ignorado=x',
      } as never,
      { params: Promise.resolve({ id: 'i-1' }) }
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/instituciones/i-1/matriculas?page=2&limit=20&periodoAcademicoId=p-1&estado=BAJA&buscar=Ana',
      { headers: { Authorization: 'Bearer token' } }
    );
    expect(response).toEqual({
      body: { matriculas: [], total: 0 },
      status: 206,
    });
  });

  it('reenvía POST con JSON y conserva errores', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 409,
      json: async () => ({ message: 'Ya existe' }),
    });
    const payload = { estudianteId: 'e-1', periodoAcademicoId: 'p-1' };
    const response = await POST({ json: async () => payload } as never, {
      params: Promise.resolve({ id: 'i-1' }),
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/instituciones/i-1/matriculas',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );
    expect(response).toEqual({ body: { message: 'Ya existe' }, status: 409 });
  });
});
