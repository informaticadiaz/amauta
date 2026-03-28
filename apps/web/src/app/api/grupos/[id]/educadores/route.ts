/**
 * API Route: Proxy para listar y asignar educadores a un grupo
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

const API_URL = process.env.API_URL || 'http://localhost:3001';

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
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    if (page) query.set('page', page);
    if (limit) query.set('limit', limit);

    const qs = query.toString();
    const url = `${API_URL}/api/v1/grupos/${id}/educadores${qs ? `?${qs}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en grupos/:id/educadores proxy GET:', error);
    return NextResponse.json(
      { message: 'Error al obtener educadores del grupo' },
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

    const response = await fetch(`${API_URL}/api/v1/grupos/${id}/educadores`, {
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
    console.error('Error en grupos/:id/educadores proxy POST:', error);
    return NextResponse.json(
      { message: 'Error al asignar educador' },
      { status: 500 }
    );
  }
}
