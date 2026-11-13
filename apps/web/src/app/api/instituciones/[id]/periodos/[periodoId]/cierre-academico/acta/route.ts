import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; periodoId: string }> }
) {
  try {
    const token = await getAuthenticatedBackendToken(request);
    if (!token) return createUnauthorizedResponse();
    const { id, periodoId } = await params;
    const response = await fetch(
      `${API_URL}/api/v1/instituciones/${id}/periodos/${periodoId}/cierre-academico/acta`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const body = await response.arrayBuffer();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('content-type') || 'application/pdf',
        'Content-Disposition':
          response.headers.get('content-disposition') || 'attachment',
      },
    });
  } catch {
    return NextResponse.json(
      { message: 'Error al descargar el acta de cierre' },
      { status: 500 }
    );
  }
}
