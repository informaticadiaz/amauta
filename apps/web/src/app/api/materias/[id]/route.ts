import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAuthenticatedBackendToken(request);
  if (!token) return createUnauthorizedResponse();
  const { id } = await params;
  const response = await fetch(
    `${process.env.API_URL || 'http://localhost:3001'}/api/v1/materias/${id}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(await request.json()),
    }
  );
  return NextResponse.json(await response.json(), { status: response.status });
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAuthenticatedBackendToken(request);
  if (!token) return createUnauthorizedResponse();
  const { id } = await params;
  const response = await fetch(
    `${process.env.API_URL || 'http://localhost:3001'}/api/v1/materias/${id}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
  );
  return NextResponse.json(await response.json(), { status: response.status });
}
