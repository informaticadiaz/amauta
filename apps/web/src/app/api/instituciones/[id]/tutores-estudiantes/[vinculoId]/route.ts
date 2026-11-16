import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; vinculoId: string }> }
) {
  try {
    const token = await getAuthenticatedBackendToken(request);
    if (!token) return createUnauthorizedResponse();
    const { id, vinculoId } = await params;
    const response = await fetch(
      `${API_URL}/api/v1/instituciones/${id}/tutores-estudiantes/${vinculoId}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
    );
    if (response.status === 204) return new NextResponse(null, { status: 204 });
    return NextResponse.json(await response.json(), {
      status: response.status,
    });
  } catch (error) {
    console.error('Error en tutores-estudiantes proxy DELETE:', error);
    return NextResponse.json(
      { message: 'Error al desactivar el vínculo' },
      { status: 500 }
    );
  }
}
