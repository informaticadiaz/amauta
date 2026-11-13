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
  { params }: { params: Promise<{ id: string; periodoId: string }> }
) {
  try {
    const token = await getAuthenticatedBackendToken(request);
    if (!token) return createUnauthorizedResponse();
    const { id, periodoId } = await params;
    const response = await fetch(
      `${getApiUrl()}/api/v1/instituciones/${id}/periodos/${periodoId}/cierre-academico/preview`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return NextResponse.json(await response.json(), {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { message: 'Error al obtener la previsualización del cierre' },
      { status: 500 }
    );
  }
}
