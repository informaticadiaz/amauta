import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthenticatedBackendToken(request);
    if (!token) return createUnauthorizedResponse();
    const response = await fetch(`${API_URL}/api/v1/justificaciones`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type':
          request.headers.get('content-type') ?? 'application/octet-stream',
      },
      body: await request.arrayBuffer(),
    });
    return new NextResponse(await response.arrayBuffer(), {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('content-type') ?? 'application/json',
      },
    });
  } catch (error) {
    console.error('Error en proxy de justificaciones:', error);
    return NextResponse.json(
      { message: 'Error al crear la justificación' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = await getAuthenticatedBackendToken(request);
    if (!token) return createUnauthorizedResponse();
    const response = await fetch(
      `${API_URL}/api/v1/justificaciones/pendientes`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return NextResponse.json(await response.json(), {
      status: response.status,
    });
  } catch (error) {
    console.error('Error en proxy de justificaciones pendientes:', error);
    return NextResponse.json(
      { message: 'Error al obtener las justificaciones pendientes' },
      { status: 500 }
    );
  }
}
