import { SignJWT } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from './auth';

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

type AuthTokenPayload = Record<string, unknown>;

async function createBackendAuthToken(
  token: AuthTokenPayload
): Promise<string> {
  const secret = new TextEncoder().encode(AUTH_SECRET);

  return new SignJWT({
    id: token.id as string,
    sub: token.sub as string,
    email: token.email as string,
    rol: token.rol as string,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

export async function getAuthenticatedBackendToken(
  _request: NextRequest
): Promise<string | null> {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return createBackendAuthToken({
    id: session.user.id,
    sub: session.user.id,
    email: session.user.email ?? '',
    rol: session.user.rol,
  });
}

export async function getAuthenticatedBackendHeaders(
  request: NextRequest,
  init?: HeadersInit
): Promise<Headers | null> {
  const authToken = await getAuthenticatedBackendToken(request);

  if (!authToken) {
    return null;
  }

  const headers = new Headers(init);
  headers.set('Authorization', `Bearer ${authToken}`);

  return headers;
}

export function createUnauthorizedResponse() {
  return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
}
