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
) as {
  getAuthenticatedBackendToken: jest.Mock;
};

describe('API /api/cursos/[id]/lecciones', () => {
  const originalEnv = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'http://api.test';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env.API_URL = originalEnv;
    jest.clearAllMocks();
  });

  it('reenvía una respuesta exitosa del listado sin alterar el payload', async () => {
    const payload = { lecciones: [{ id: 'leccion-1' }], total: 1 };
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => payload,
    });

    const response = await GET({} as never, {
      params: Promise.resolve({ id: 'curso-1' }),
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/cursos/curso-1/lecciones',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(response).toEqual({ body: payload, status: 200 });
  });

  it('reenvía el status y payload de error del backend', async () => {
    const payload = { message: 'Curso no encontrado' };
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 404,
      json: async () => payload,
    });

    const response = await GET({} as never, {
      params: Promise.resolve({ id: 'curso-inexistente' }),
    });

    expect(response).toEqual({ body: payload, status: 404 });
  });

  it('rechaza la creación sin autenticación y no llama al backend', async () => {
    getAuthenticatedBackendToken.mockResolvedValue(null);

    const response = await POST({ json: jest.fn() } as never, {
      params: Promise.resolve({ id: 'curso-1' }),
    });

    expect(response.status).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('serializa el payload de creación y reenvía la respuesta', async () => {
    const body = {
      titulo: 'Nueva lección',
      tipo: 'TEXTO',
      contenido: { texto: 'Contenido' },
    };
    const payload = { leccion: { id: 'leccion-1' } };
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 201,
      json: async () => payload,
    });

    const response = await POST({ json: async () => body } as never, {
      params: Promise.resolve({ id: 'curso-1' }),
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/cursos/curso-1/lecciones',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-demo',
        },
        body: JSON.stringify(body),
      })
    );
    expect(response).toEqual({ body: payload, status: 201 });
  });
});
