import { DELETE, PATCH } from './route';

jest.mock('next/server', () => ({
  NextResponse: class {
    body: unknown;
    status: number;
    constructor(body: unknown, init?: { status?: number }) {
      this.body = body;
      this.status = init?.status ?? 200;
    }
    static json(body: unknown, init?: { status?: number }) {
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

describe('API /api/grupos/[id]/horarios/[horarioId]', () => {
  beforeEach(() => {
    process.env.API_URL = 'http://api.test';
    global.fetch = jest.fn();
  });

  afterEach(() => jest.resetAllMocks());

  it('reenvía PATCH con el cuerpo de la actualización', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({ horario: { id: 'horario-1' } }),
    });

    const response = await PATCH(
      {
        json: async () => ({ horaFin: '10:00' }),
      } as never,
      { params: Promise.resolve({ id: 'grupo-1', horarioId: 'horario-1' }) }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/horarios/horario-1',
      {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer token-demo',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ horaFin: '10:00' }),
      }
    );
    expect(response.status).toBe(200);
  });

  it('preserva la respuesta 204 al dar de baja una franja', async () => {
    getAuthenticatedBackendToken.mockResolvedValue('token-demo');
    (global.fetch as jest.Mock).mockResolvedValue({ status: 204 });

    const response = await DELETE({} as never, {
      params: Promise.resolve({ id: 'grupo-1', horarioId: 'horario-1' }),
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/horarios/horario-1',
      {
        method: 'DELETE',
        headers: { Authorization: 'Bearer token-demo' },
        body: undefined,
      }
    );
    expect(response.status).toBe(204);
    expect(response.body).toBeNull();
  });
});
