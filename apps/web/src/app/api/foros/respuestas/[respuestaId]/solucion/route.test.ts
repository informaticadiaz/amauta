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

describe('API /api/foros/respuestas/[respuestaId]/solucion', () => {
  const originalEnv = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'http://api.test';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env.API_URL = originalEnv;
    jest.resetAllMocks();
  });

  it('debería reenviar la acción de marcar solución al backend', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({
        respuesta: { id: 'respuesta-1', esSolucion: true },
      }),
    });

    const response = await POST(
      {
        url: 'http://localhost/api/foros/respuestas/respuesta-1/solucion',
      } as never,
      {
        params: Promise.resolve({
          respuestaId: 'respuesta-1',
        }),
      }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/foros/respuestas/respuesta-1/solucion',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer token-demo' },
      })
    );
    expect(response.status).toBe(200);
  });
});
