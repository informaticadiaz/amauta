/**
 * API Route: Proxy para remover estudiante de un grupo
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; estudianteId: string }> }
) {
  try {
    const authToken = await getAuthenticatedBackendToken(request);
    if (!authToken) {
      return createUnauthorizedResponse();
    }

    const { id, estudianteId } = await params;

    const response = await fetch(
      `${API_URL}/api/v1/grupos/${id}/estudiantes/${estudianteId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en grupos/:id/estudiantes/:id proxy DELETE:', error);
    return NextResponse.json(
      { message: 'Error al remover estudiante' },
      { status: 500 }
    );
  }
}
