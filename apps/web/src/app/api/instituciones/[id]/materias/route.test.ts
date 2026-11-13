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

describe('API /api/instituciones/[id]/materias', () => {
  beforeEach(() => {
    process.env.API_URL = 'http://api.test';
    global.fetch = jest.fn();
  });

  afterEach(() => jest.resetAllMocks());

  it('devuelve 401 y no consulta el backend sin autenticación', async () => {
    getAuthenticatedBackendToken.mockResolvedValue(null);

    const response = await GET(
      { url: 'http://localhost/api/instituciones/inst-1/materias' } as never,
      { params: Promise.resolve({ id: 'inst-1' }) }
    );

    expect(response.status).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('reenvía GET con token y conserva el cuerpo y estado del backend', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({ materias: [{ id: 'materia-1' }] }),
    });

    const response = await GET(
      { url: 'http://localhost/api/instituciones/inst-1/materias' } as never,
      { params: Promise.resolve({ id: 'inst-1' }) }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/instituciones/inst-1/materias',
      { headers: { Authorization: 'Bearer token-demo' } }
    );
    expect(response).toEqual({
      body: { materias: [{ id: 'materia-1' }] },
      status: 200,
    });
  });

  it('reenvía POST con JSON y conserva un error del backend', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 409,
      json: async () => ({ message: 'La materia ya existe' }),
    });
    const payload = { nombre: 'Matemática', descripcion: null };

    const response = await POST({ json: async () => payload } as never, {
      params: Promise.resolve({ id: 'inst-1' }),
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/instituciones/inst-1/materias',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer token-demo',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );
    expect(response).toEqual({
      body: { message: 'La materia ya existe' },
      status: 409,
    });
  });
});
