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
    params: Promise<{ id: string; postId: string }>;
  }
) {
  try {
    const authToken = await getAuthenticatedBackendToken(request);
    if (!authToken) {
      return createUnauthorizedResponse();
    }

    const { id, postId } = await params;
    const response = await fetch(
      `${getApiUrl()}/api/v1/cursos/${id}/foros/${postId}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en cursos/:id/foros/:postId proxy GET:', error);
    return NextResponse.json(
      { message: 'Error al obtener el detalle del post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string; postId: string }>;
  }
) {
  try {
    const authToken = await getAuthenticatedBackendToken(request);
    if (!authToken) {
      return createUnauthorizedResponse();
    }

    const { id, postId } = await params;
    const response = await fetch(
      `${getApiUrl()}/api/v1/cursos/${id}/foros/${postId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    const data = response.status === 204 ? null : await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en cursos/:id/foros/:postId proxy DELETE:', error);
    return NextResponse.json(
      { message: 'Error al eliminar el post' },
      { status: 500 }
    );
  }
}
