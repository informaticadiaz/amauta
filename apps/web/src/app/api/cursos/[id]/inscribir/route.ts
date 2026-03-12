/**
 * API Route: Proxy para inscribirse/cancelar inscripción en un curso
 *
 * POST: inscribirse en el curso
 * DELETE: cancelar inscripción
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

export async function POST(
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

    const response = await fetch(`${API_URL}/api/v1/cursos/${id}/inscribir`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en inscribir proxy:', error);
    return NextResponse.json(
      { message: 'Error al inscribirse en el curso' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const response = await fetch(`${API_URL}/api/v1/cursos/${id}/inscribir`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en cancelar inscripción proxy:', error);
    return NextResponse.json(
      { message: 'Error al cancelar la inscripción' },
      { status: 500 }
    );
  }
}
