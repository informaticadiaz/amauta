import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAuthenticatedBackendToken(request);
    if (!token) return createUnauthorizedResponse();
    const { id } = await params;
    const response = await fetch(
      `${API_URL}/api/v1/justificaciones/${id}/resolver`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(await request.json()),
      }
    );
    return NextResponse.json(await response.json(), {
      status: response.status,
    });
  } catch (error) {
    console.error('Error en proxy de resolución de justificación:', error);
    return NextResponse.json(
      { message: 'Error al resolver la justificación' },
      { status: 500 }
    );
  }
}
