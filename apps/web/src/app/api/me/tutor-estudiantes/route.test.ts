import { GET } from './route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));
jest.mock('@/lib/backend-auth', () => ({
  createUnauthorizedResponse: jest.fn(() => ({ status: 401 })),
  getAuthenticatedBackendToken: jest.fn(),
}));

const { createUnauthorizedResponse, getAuthenticatedBackendToken } =
  jest.requireMock('@/lib/backend-auth') as {
    createUnauthorizedResponse: jest.Mock;
    getAuthenticatedBackendToken: jest.Mock;
  };

describe('GET /api/me/tutor-estudiantes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('rechaza solicitudes sin sesión', async () => {
    getAuthenticatedBackendToken.mockResolvedValue(null);
    const response = await GET({} as never);
    expect(response.status).toBe(401);
    expect(createUnauthorizedResponse).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('reenvía el token y conserva la respuesta del backend', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('tutor-token');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({ estudiantes: [] }),
    });
    const response = await GET({} as never);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ estudiantes: [] });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/me/tutor-estudiantes',
      {
        headers: { Authorization: 'Bearer tutor-token' },
      }
    );
  });
});
