import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

function getApiUrl() {
  return process.env.API_URL || 'http://localhost:3001';
}

export async function POST(
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
    const body = await request.json();

    const response = await fetch(
      `${getApiUrl()}/api/v1/cursos/${id}/foros/${postId}/respuestas`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(
      'Error en cursos/:id/foros/:postId/respuestas proxy POST:',
      error
    );
    return NextResponse.json(
      { message: 'Error al crear la respuesta del foro' },
      { status: 500 }
    );
  }
}
