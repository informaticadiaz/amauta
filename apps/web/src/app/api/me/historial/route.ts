import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

function getApiUrl() {
  return process.env.API_URL || 'http://localhost:3001';
}

export async function GET(request: unknown) {
  try {
    const authToken = await getAuthenticatedBackendToken(request as never);
    if (!authToken) {
      return createUnauthorizedResponse();
    }

    const response = await fetch(`${getApiUrl()}/api/v1/me/historial`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en /api/me/historial proxy:', error);
    return NextResponse.json(
      { message: 'Error al obtener tu historial académico' },
      { status: 500 }
    );
  }
}
