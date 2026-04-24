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
  createUnauthorizedResponse: jest.fn(
    () => new Response(null, { status: 401 })
  ),
  getAuthenticatedBackendToken: jest.fn(),
}));

const { getAuthenticatedBackendToken } = jest.requireMock(
  '@/lib/backend-auth'
) as {
  getAuthenticatedBackendToken: jest.Mock;
};

describe('API /api/cursos/[id]/foros', () => {
  const originalEnv = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'http://api.test';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env.API_URL = originalEnv;
    jest.resetAllMocks();
  });

  it('debería reenviar filtros del listado al backend', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({ posts: [], total: 0, page: 1, limit: 20 }),
    });

    const response = await GET(
      {
        url: 'http://localhost/api/cursos/curso-1/foros?tipo=PREGUNTA&etiqueta=examen&sinResponder=true&page=2',
      } as never,
      { params: Promise.resolve({ id: 'curso-1' }) }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/cursos/curso-1/foros?tipo=PREGUNTA&etiqueta=examen&sinResponder=true&page=2',
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer token-demo' },
      })
    );
    expect(response.status).toBe(200);
  });

  it('debería reenviar el payload de creación del post al backend', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 201,
      json: async () => ({
        post: { id: 'post-1' },
        message: 'Post creado exitosamente',
      }),
    });

    const response = await POST(
      {
        url: 'http://localhost/api/cursos/curso-1/foros',
        json: async () => ({
          tipo: 'DISCUSION',
          titulo: 'Compartamos resúmenes',
          contenido: 'Dejo un espacio para compartir apuntes.',
          etiquetas: ['resumenes'],
        }),
      } as never,
      { params: Promise.resolve({ id: 'curso-1' }) }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/cursos/curso-1/foros',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-demo',
        },
        body: JSON.stringify({
          tipo: 'DISCUSION',
          titulo: 'Compartamos resúmenes',
          contenido: 'Dejo un espacio para compartir apuntes.',
          etiquetas: ['resumenes'],
        }),
      })
    );
    expect(response.status).toBe(201);
  });
});
