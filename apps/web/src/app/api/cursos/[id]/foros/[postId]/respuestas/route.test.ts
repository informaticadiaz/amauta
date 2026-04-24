import { POST } from './route';

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

describe('API /api/cursos/[id]/foros/[postId]/respuestas', () => {
  const originalEnv = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'http://api.test';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env.API_URL = originalEnv;
    jest.resetAllMocks();
  });

  it('debería reenviar el payload de respuesta al backend', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 201,
      json: async () => ({
        respuesta: { id: 'respuesta-1' },
        message: 'Respuesta creada exitosamente',
      }),
    });

    const response = await POST(
      {
        url: 'http://localhost/api/cursos/curso-1/foros/post-1/respuestas',
        json: async () => ({
          contenido: 'Gracias, me sirve para estudiar.',
          respuestaParentId: 'respuesta-0',
        }),
      } as never,
      {
        params: Promise.resolve({
          id: 'curso-1',
          postId: 'post-1',
        }),
      }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/cursos/curso-1/foros/post-1/respuestas',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-demo',
        },
        body: JSON.stringify({
          contenido: 'Gracias, me sirve para estudiar.',
          respuestaParentId: 'respuesta-0',
        }),
      })
    );
    expect(response.status).toBe(201);
  });
});
