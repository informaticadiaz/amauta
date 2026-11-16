import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function tokenOrUnauthorized(request: NextRequest) {
  const token = await getAuthenticatedBackendToken(request);
  return token || null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await tokenOrUnauthorized(request);
    if (!token) return createUnauthorizedResponse();
    const { id } = await params;
    const search = request.nextUrl.searchParams.toString();
    const response = await fetch(
      `${API_URL}/api/v1/instituciones/${id}/tutores-estudiantes${search ? `?${search}` : ''}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return NextResponse.json(await response.json(), {
      status: response.status,
    });
  } catch (error) {
    console.error('Error en tutores-estudiantes proxy GET:', error);
    return NextResponse.json(
      { message: 'Error al listar vínculos' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await tokenOrUnauthorized(request);
    if (!token) return createUnauthorizedResponse();
    const { id } = await params;
    const response = await fetch(
      `${API_URL}/api/v1/instituciones/${id}/tutores-estudiantes`,
      {
        method: 'POST',
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
    console.error('Error en tutores-estudiantes proxy POST:', error);
    return NextResponse.json(
      { message: 'Error al crear el vínculo' },
      { status: 500 }
    );
  }
}
