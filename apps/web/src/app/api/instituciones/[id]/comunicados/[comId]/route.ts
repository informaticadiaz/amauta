import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; comId: string }> }
) {
  try {
    const authToken = await getAuthenticatedBackendToken(request);
    if (!authToken) return createUnauthorizedResponse();

    const { id, comId } = await params;
    const response = await fetch(
      `${API_URL}/api/v1/instituciones/${id}/comunicados/${comId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en instituciones/:id/comunicados/:comId GET:', error);
    return NextResponse.json(
      { message: 'Error al obtener comunicado' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; comId: string }> }
) {
  try {
    const authToken = await getAuthenticatedBackendToken(request);
    if (!authToken) return createUnauthorizedResponse();

    const { id, comId } = await params;
    const body = await request.json();

    const response = await fetch(
      `${API_URL}/api/v1/instituciones/${id}/comunicados/${comId}`,
      {
        method: 'PATCH',
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
      'Error en instituciones/:id/comunicados/:comId PATCH:',
      error
    );
    return NextResponse.json(
      { message: 'Error al actualizar comunicado' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; comId: string }> }
) {
  try {
    const authToken = await getAuthenticatedBackendToken(request);
    if (!authToken) return createUnauthorizedResponse();

    const { id, comId } = await params;
    const response = await fetch(
      `${API_URL}/api/v1/instituciones/${id}/comunicados/${comId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.status === 204) return new NextResponse(null, { status: 204 });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(
      'Error en instituciones/:id/comunicados/:comId DELETE:',
      error
    );
    return NextResponse.json(
      { message: 'Error al archivar comunicado' },
      { status: 500 }
    );
  }
}
