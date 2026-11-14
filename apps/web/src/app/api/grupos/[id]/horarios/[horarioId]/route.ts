import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function handle(
  request: NextRequest,
  method: 'PATCH' | 'DELETE',
  params: Promise<{ horarioId: string }>
) {
  const token = await getAuthenticatedBackendToken(request);
  if (!token) return createUnauthorizedResponse();
  const { horarioId } = await params;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  const body =
    method === 'PATCH' ? JSON.stringify(await request.json()) : undefined;
  if (body) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${API_URL}/api/v1/horarios/${horarioId}`, {
    method,
    headers,
    body,
  });
  if (response.status === 204) return new NextResponse(null, { status: 204 });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; horarioId: string }> }
) {
  return handle(request, 'PATCH', params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; horarioId: string }> }
) {
  return handle(request, 'DELETE', params);
}
