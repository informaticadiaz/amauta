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
    const periodoId = searchParams.get('periodoId');
    const grupoId = searchParams.get('grupoId');
    if (periodoId) query.set('periodoId', periodoId);
    if (grupoId) query.set('grupoId', grupoId);

    const qs = query.toString();
    const url = `${getApiUrl()}/api/v1/me/boletin${qs ? `?${qs}` : ''}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en /api/me/boletin proxy:', error);
    return NextResponse.json(
      { message: 'Error al obtener el boletín' },
      { status: 500 }
    );
  }
}
