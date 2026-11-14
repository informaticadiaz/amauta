import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function forward(
  request: NextRequest,
  method: 'GET' | 'POST',
  id: string
) {
  const token = await getAuthenticatedBackendToken(request);
  if (!token) return createUnauthorizedResponse();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  const body =
    method === 'POST' ? JSON.stringify(await request.json()) : undefined;
  if (body) headers['Content-Type'] = 'application/json';
  const response = await fetch(
    `${API_URL}/api/v1/grupos/${id}/horarios${new URL(request.url).search}`,
    { method, headers, body }
  );
  const data = response.status === 204 ? null : await response.json();
  return data === null
    ? new NextResponse(null, { status: response.status })
    : NextResponse.json(data, { status: response.status });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return forward(request, 'GET', (await params).id);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return forward(request, 'POST', (await params).id);
}
