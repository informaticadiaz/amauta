import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';
const api = () => process.env.API_URL || 'http://localhost:3001';

async function forwardResponse(response: Response) {
  if (response.status === 204) return new NextResponse(null, { status: 204 });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAuthenticatedBackendToken(request);
  if (!token) return createUnauthorizedResponse();
  const { id } = await params;
  const response = await fetch(`${api()}/api/v1/grupos/${id}/materias`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return forwardResponse(response);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAuthenticatedBackendToken(request);
  if (!token) return createUnauthorizedResponse();
  const { id } = await params;
  const { materiaId } = await request.json();
  const response = await fetch(
    `${api()}/api/v1/grupos/${id}/materias/${materiaId}`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
  );
  return forwardResponse(response);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAuthenticatedBackendToken(request);
  if (!token) return createUnauthorizedResponse();
  const { id } = await params;
  const { materiaId } = await request.json();
  const response = await fetch(
    `${api()}/api/v1/grupos/${id}/materias/${materiaId}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
  );
  return forwardResponse(response);
}
