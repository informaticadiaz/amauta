import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';
const API_URL = process.env.API_URL || 'http://localhost:3001';
export async function GET(request: NextRequest) {
  const token = await getAuthenticatedBackendToken(request);
  if (!token) return createUnauthorizedResponse();
  const response = await fetch(
    `${API_URL}/api/v1/educadores/me/horarios${new URL(request.url).search}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return NextResponse.json(await response.json(), { status: response.status });
}
