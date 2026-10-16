import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';
const api = () => process.env.API_URL || 'http://localhost:3001';
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAuthenticatedBackendToken(request);
  if (!token) return createUnauthorizedResponse();
  const { id } = await params;
  const response = await fetch(`${api()}/api/v1/instituciones/${id}/materias`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return NextResponse.json(await response.json(), { status: response.status });
}
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAuthenticatedBackendToken(request);
  if (!token) return createUnauthorizedResponse();
  const { id } = await params;
  const response = await fetch(`${api()}/api/v1/instituciones/${id}/materias`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(await request.json()),
  });
  return NextResponse.json(await response.json(), { status: response.status });
}
