import { DELETE, PATCH } from './route';

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

describe('API /api/materias/[id]', () => {
  beforeEach(() => {
    process.env.API_URL = 'http://api.test';
    global.fetch = jest.fn();
  });

  afterEach(() => jest.resetAllMocks());

  it('devuelve 401 para PATCH sin autenticación', async () => {
    getAuthenticatedBackendToken.mockResolvedValue(null);

    const response = await PATCH(
      { json: async () => ({ nombre: 'Nueva' }) } as never,
      { params: Promise.resolve({ id: 'materia-1' }) }
    );

    expect(response.status).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('reenvía PATCH con payload y token', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({ materia: { id: 'materia-1', nombre: 'Lengua' } }),
    });
    const payload = { nombre: 'Lengua', descripcion: 'Comunicación' };

    const response = await PATCH({ json: async () => payload } as never, {
      params: Promise.resolve({ id: 'materia-1' }),
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/materias/materia-1',
      {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer token-demo',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );
    expect(response.status).toBe(200);
  });

  it('reenvía DELETE y conserva estado y cuerpo', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 422,
      json: async () => ({ message: 'No se puede desactivar' }),
    });

    const response = await DELETE({} as never, {
      params: Promise.resolve({ id: 'materia-1' }),
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/materias/materia-1',
      { method: 'DELETE', headers: { Authorization: 'Bearer token-demo' } }
    );
    expect(response).toEqual({
      body: { message: 'No se puede desactivar' },
      status: 422,
    });
  });
});
