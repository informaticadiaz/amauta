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
  {
    params,
  }: {
    params: Promise<{ institucionId: string; estudianteId: string }>;
  }
) {
  try {
    const token = await getAuthenticatedBackendToken(request);
    if (!token) return createUnauthorizedResponse();

    const { institucionId, estudianteId } = await params;
    const response = await fetch(
      `${getApiUrl()}/api/v1/instituciones/${institucionId}/estudiantes/${estudianteId}/historial`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en historial administrativo proxy:', error);
    return NextResponse.json(
      { message: 'Error al obtener el historial académico' },
      { status: 500 }
    );
  }
}
