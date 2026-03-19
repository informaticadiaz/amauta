/**
 * API Route: Proxy para detalle de evaluacion
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { SignJWT } from 'jose';

const API_URL = process.env.API_URL || 'http://localhost:3001';
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

async function createAuthToken(
  token: Record<string, unknown>
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({
      req: request,
      secret: AUTH_SECRET,
      secureCookie: true,
      salt: '__Secure-authjs.session-token',
    });
    if (!token) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const authToken = await createAuthToken(token);

    const response = await fetch(`${API_URL}/api/v1/evaluaciones/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en evaluacion proxy:', error);
    return NextResponse.json(
      { message: 'Error al obtener evaluacion' },
      { status: 500 }
    );
  }
}
