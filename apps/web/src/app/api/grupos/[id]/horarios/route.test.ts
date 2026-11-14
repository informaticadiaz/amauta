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
) as { getAuthenticatedBackendToken: jest.Mock };

describe('API /api/grupos/[id]/horarios', () => {
  beforeEach(() => {
    process.env.API_URL = 'http://api.test';
    global.fetch = jest.fn();
  });

  afterEach(() => jest.resetAllMocks());

  it('rechaza GET sin autenticación', async () => {
    getAuthenticatedBackendToken.mockResolvedValue(null);

    const response = await GET(
      {
        url: 'http://localhost/api/grupos/grupo-1/horarios?diaSemana=LUN',
      } as never,
      { params: Promise.resolve({ id: 'grupo-1' }) }
    );

    expect(response.status).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('reenvía GET autenticado con query y estado del backend', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({ horarios: [] }),
    });

    const response = await GET(
      {
        url: 'http://localhost/api/grupos/grupo-1/horarios?diaSemana=LUN',
      } as never,
      { params: Promise.resolve({ id: 'grupo-1' }) }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/grupos/grupo-1/horarios?diaSemana=LUN',
      {
        method: 'GET',
        headers: { Authorization: 'Bearer token-demo' },
        body: undefined,
      }
    );
    expect(response).toEqual({ body: { horarios: [] }, status: 200 });
  });

  it('reenvía POST con el cuerpo de la nueva franja', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 201,
      json: async () => ({ horario: { id: 'horario-1' } }),
    });

    const response = await POST(
      {
        url: 'http://localhost/api/grupos/grupo-1/horarios',
        json: async () => ({
          materiaId: 'materia-1',
          educadorId: 'educador-1',
          diaSemana: 'LUN',
          horaInicio: '08:00',
          horaFin: '09:00',
        }),
      } as never,
      { params: Promise.resolve({ id: 'grupo-1' }) }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/grupos/grupo-1/horarios',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer token-demo',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materiaId: 'materia-1',
          educadorId: 'educador-1',
          diaSemana: 'LUN',
          horaInicio: '08:00',
          horaFin: '09:00',
        }),
      }
    );
    expect(response.status).toBe(201);
  });
});
