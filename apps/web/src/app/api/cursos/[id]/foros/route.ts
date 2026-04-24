import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

function getApiUrl() {
  return process.env.API_URL || 'http://localhost:3001';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authToken = await getAuthenticatedBackendToken(request);
    if (!authToken) {
      return createUnauthorizedResponse();
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const query = new URLSearchParams();

    for (const key of ['tipo', 'etiqueta', 'sinResponder', 'page', 'limit']) {
      const value = searchParams.get(key);
      if (value) {
        query.set(key, value);
      }
    }

    const qs = query.toString();
    const url = `${getApiUrl()}/api/v1/cursos/${id}/foros${qs ? `?${qs}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en cursos/:id/foros proxy GET:', error);
    return NextResponse.json(
      { message: 'Error al obtener publicaciones del foro' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authToken = await getAuthenticatedBackendToken(request);
    if (!authToken) {
      return createUnauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();

    const response = await fetch(`${getApiUrl()}/api/v1/cursos/${id}/foros`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en cursos/:id/foros proxy POST:', error);
    return NextResponse.json(
      { message: 'Error al crear la publicación del foro' },
      { status: 500 }
    );
  }
}
