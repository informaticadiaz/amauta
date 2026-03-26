/**
 * API Route: Proxy para listar y crear grupos
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

export async function GET(request: NextRequest) {
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

    const authToken = await createAuthToken(token);
    const { searchParams } = new URL(request.url);
    const institucionId = searchParams.get('institucionId');

    if (!institucionId) {
      return NextResponse.json(
        { message: 'institucionId es requerido' },
        { status: 400 }
      );
    }

    const query = new URLSearchParams();
    const activo = searchParams.get('activo');
    const periodoAcademicoId = searchParams.get('periodoAcademicoId');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    if (activo !== null) query.set('activo', activo);
    if (periodoAcademicoId) query.set('periodoAcademicoId', periodoAcademicoId);
    if (page) query.set('page', page);
    if (limit) query.set('limit', limit);

    const qs = query.toString();
    const url = `${API_URL}/api/v1/instituciones/${institucionId}/grupos${qs ? `?${qs}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en grupos proxy GET:', error);
    return NextResponse.json(
      { message: 'Error al obtener grupos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const authToken = await createAuthToken(token);
    const body = await request.json();
    const { institucionId, ...dto } = body as {
      institucionId: string;
      [key: string]: unknown;
    };

    if (!institucionId) {
      return NextResponse.json(
        { message: 'institucionId es requerido' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_URL}/api/v1/instituciones/${institucionId}/grupos`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(dto),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en grupos proxy POST:', error);
    return NextResponse.json(
      { message: 'Error al crear grupo' },
      { status: 500 }
    );
  }
}
