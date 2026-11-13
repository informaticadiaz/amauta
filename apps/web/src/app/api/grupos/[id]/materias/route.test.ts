import { DELETE, GET, POST } from './route';

jest.mock('next/server', () => ({
  NextResponse: class {
    body;
    status;
    constructor(body, init) {
      this.body = body;
      this.status = init?.status ?? 200;
    }
    static json(body, init) {
      return { body, status: init?.status ?? 200 };
    }
  },
}));

jest.mock('@/lib/backend-auth', () => ({
  createUnauthorizedResponse: jest.fn(() => ({ status: 401 })),
  getAuthenticatedBackendToken: jest.fn(),
}));

const { getAuthenticatedBackendToken } = jest.requireMock(
  '@/lib/backend-auth'
) as { getAuthenticatedBackendToken: jest.Mock };

describe('API /api/grupos/[id]/materias', () => {
  beforeEach(() => {
    process.env.API_URL = 'http://api.test';
    global.fetch = jest.fn();
  });

  afterEach(() => jest.resetAllMocks());

  it('rechaza GET sin autenticación', async () => {
    getAuthenticatedBackendToken.mockResolvedValue(null);

    const response = await GET(
      { url: 'http://localhost/api/grupos/grupo-1/materias' } as never,
      { params: Promise.resolve({ id: 'grupo-1' }) }
    );

    expect(response.status).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('reenvía GET autenticado y conserva estado y cuerpo', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 403,
      json: async () => ({ message: 'Sin permiso' }),
    });

    const response = await GET(
      { url: 'http://localhost/api/grupos/grupo-1/materias' } as never,
      { params: Promise.resolve({ id: 'grupo-1' }) }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/grupos/grupo-1/materias',
      { headers: { Authorization: 'Bearer token-demo' } }
    );
    expect(response).toEqual({ body: { message: 'Sin permiso' }, status: 403 });
  });

  it('reenvía POST con materiaId en la ruta', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 201,
      json: async () => ({ asignacion: { materiaId: 'materia-1' } }),
    });

    const response = await POST(
      { json: async () => ({ materiaId: 'materia-1' }) } as never,
      { params: Promise.resolve({ id: 'grupo-1' }) }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/grupos/grupo-1/materias/materia-1',
      { method: 'POST', headers: { Authorization: 'Bearer token-demo' } }
    );
    expect(response.status).toBe(201);
  });

  it('reenvía DELETE y conserva la respuesta 204 sin intentar leer JSON', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({ status: 204 });

    const response = await DELETE(
      { json: async () => ({ materiaId: 'materia-1' }) } as never,
      { params: Promise.resolve({ id: 'grupo-1' }) }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/grupos/grupo-1/materias/materia-1',
      { method: 'DELETE', headers: { Authorization: 'Bearer token-demo' } }
    );
    expect(response.status).toBe(204);
    expect(response.body).toBeNull();
  });
});
