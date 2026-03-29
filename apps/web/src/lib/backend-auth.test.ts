import { getAuthenticatedBackendToken } from './backend-auth';
import { TextEncoder } from 'util';

(global as typeof globalThis).TextEncoder = TextEncoder;

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    }),
  },
}));

jest.mock('./auth', () => ({
  auth: jest.fn(),
}));

jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation((payload: Record<string, unknown>) => {
    const chain = {
      setProtectedHeader: jest.fn().mockReturnThis(),
      setIssuedAt: jest.fn().mockReturnThis(),
      setExpirationTime: jest.fn().mockReturnThis(),
      sign: jest.fn().mockResolvedValue(
        JSON.stringify({
          id: payload.id,
          sub: payload.sub,
          email: payload.email,
          rol: payload.rol,
        })
      ),
    };

    return chain;
  }),
}));

const { auth } = jest.requireMock('./auth') as {
  auth: jest.Mock;
};

describe('backend-auth', () => {
  it('devuelve null si no hay sesión autenticada', async () => {
    auth.mockResolvedValue(null);

    await expect(getAuthenticatedBackendToken({} as never)).resolves.toBeNull();
  });

  it('crea un token backend a partir de la sesión de NextAuth', async () => {
    auth.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'test@amauta.test',
        rol: 'ESTUDIANTE',
      },
    });

    await expect(getAuthenticatedBackendToken({} as never)).resolves.toBe(
      JSON.stringify({
        id: 'user-1',
        sub: 'user-1',
        email: 'test@amauta.test',
        rol: 'ESTUDIANTE',
      })
    );
  });
});
