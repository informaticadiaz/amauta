import { GET } from './route';
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
describe('GET /api/me/tutor-estudiantes/:id/calificaciones', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });
  it('exige autenticación', async () => {
    getAuthenticatedBackendToken.mockResolvedValue(null);
    expect(
      (
        await GET({} as never, {
          params: Promise.resolve({ estudianteId: 's-1' }),
        })
      ).status
    ).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });
  it('reenvía la consulta autenticada', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({ calificaciones: [] }),
    });
    await GET({} as never, {
      params: Promise.resolve({ estudianteId: 's-1' }),
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/me/tutor-estudiantes/s-1/calificaciones',
      { headers: { Authorization: 'Bearer token' } }
    );
  });
});
