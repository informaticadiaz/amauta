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
const { getAuthenticatedBackendToken } = jest.requireMock(
  '@/lib/backend-auth'
) as { getAuthenticatedBackendToken: jest.Mock };

describe('GET /api/me/tutor-estudiantes/:id/boletin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('rechaza una solicitud no autenticada', async () => {
    getAuthenticatedBackendToken.mockResolvedValue(null);
    expect(
      (
        await GET({} as never, {
          params: Promise.resolve({ estudianteId: 'student-1' }),
        })
      ).status
    ).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('reenvía estudiante y token al endpoint protegido', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('tutor-token');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({ periodo: { nombre: 'Actual' } }),
    });
    const response = await GET({} as never, {
      params: Promise.resolve({ estudianteId: 'student-1' }),
    });
    expect(response.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/me/tutor-estudiantes/student-1/boletin',
      { headers: { Authorization: 'Bearer tutor-token' } }
    );
  });
});
