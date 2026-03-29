import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

function getApiUrl() {
  return process.env.API_URL || 'http://localhost:3001';
}

export async function GET(request: NextRequest) {
  try {
    const authToken = await getAuthenticatedBackendToken(request);
    if (!authToken) {
      return createUnauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const query = new URLSearchParams();
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    if (page) query.set('page', page);
    if (limit) query.set('limit', limit);

    const qs = query.toString();
    const url = `${getApiUrl()}/api/v1/educadores/me/grupos${qs ? `?${qs}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en educadores/me/grupos proxy GET:', error);
    return NextResponse.json(
      { message: 'Error al obtener grupos del educador' },
      { status: 500 }
    );
  }
}
