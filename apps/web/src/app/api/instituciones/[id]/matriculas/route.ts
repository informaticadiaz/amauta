import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

function getApiUrl() {
  return process.env.API_URL || 'http://localhost:3001';
}

function buildQuery(request: NextRequest) {
  const source = new URL(request.url).searchParams;
  const query = new URLSearchParams();
  for (const key of [
    'page',
    'limit',
    'periodoAcademicoId',
    'estado',
    'buscar',
  ]) {
    const value = source.get(key);
    if (value) query.set(key, value);
  }
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAuthenticatedBackendToken(request);
  if (!token) return createUnauthorizedResponse();

  const { id } = await params;
  const response = await fetch(
    `${getApiUrl()}/api/v1/instituciones/${id}/matriculas${buildQuery(request)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAuthenticatedBackendToken(request);
  if (!token) return createUnauthorizedResponse();

  const { id } = await params;
  const response = await fetch(
    `${getApiUrl()}/api/v1/instituciones/${id}/matriculas`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(await request.json()),
    }
  );
  return NextResponse.json(await response.json(), { status: response.status });
}
