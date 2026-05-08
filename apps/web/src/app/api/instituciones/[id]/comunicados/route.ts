import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authToken = await getAuthenticatedBackendToken(request);
    if (!authToken) return createUnauthorizedResponse();

    const { id } = await params;
    const search = request.nextUrl.searchParams.toString();
    const url = `${API_URL}/api/v1/instituciones/${id}/comunicados${search ? `?${search}` : ''}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en instituciones/:id/comunicados GET:', error);
    return NextResponse.json(
      { message: 'Error al obtener comunicados' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authToken = await getAuthenticatedBackendToken(request);
    if (!authToken) return createUnauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    const response = await fetch(
      `${API_URL}/api/v1/instituciones/${id}/comunicados`,
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
    console.error('Error en instituciones/:id/comunicados POST:', error);
    return NextResponse.json(
      { message: 'Error al crear comunicado' },
      { status: 500 }
    );
  }
}
