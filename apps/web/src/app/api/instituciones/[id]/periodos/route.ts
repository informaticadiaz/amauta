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
    const url = `${getApiUrl()}/api/v1/instituciones/${id}/periodos`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en instituciones/:id/periodos proxy GET:', error);
    return NextResponse.json(
      { message: 'Error al obtener períodos académicos' },
      { status: 500 }
    );
  }
}
