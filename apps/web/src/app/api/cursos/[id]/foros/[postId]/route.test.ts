import { DELETE, GET } from './route';

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

describe('API /api/cursos/[id]/foros/[postId]', () => {
  const originalEnv = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'http://api.test';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env.API_URL = originalEnv;
    jest.resetAllMocks();
  });

  it('debería consultar el detalle del post autenticado', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({ post: { id: 'post-1' } }),
    });

    const response = await GET(
      {
        url: 'http://localhost/api/cursos/curso-1/foros/post-1',
      } as never,
      {
        params: Promise.resolve({
          id: 'curso-1',
          postId: 'post-1',
        }),
      }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/cursos/curso-1/foros/post-1',
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer token-demo' },
      })
    );
    expect(response.status).toBe(200);
  });

  it('debería reenviar el DELETE del post al backend', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 204,
      json: async () => ({}),
    });

    const response = await DELETE(
      {
        url: 'http://localhost/api/cursos/curso-1/foros/post-1',
      } as never,
      {
        params: Promise.resolve({
          id: 'curso-1',
          postId: 'post-1',
        }),
      }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/cursos/curso-1/foros/post-1',
      expect.objectContaining({
        method: 'DELETE',
        headers: { Authorization: 'Bearer token-demo' },
      })
    );
    expect(response.status).toBe(204);
  });
});
