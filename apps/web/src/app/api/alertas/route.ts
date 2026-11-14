import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function proxy(request: NextRequest, method: 'GET' | 'POST') {
  try {
    const authToken = await getAuthenticatedBackendToken(request);
    if (!authToken) return createUnauthorizedResponse();

    const response = await fetch(
      `${API_URL}/api/v1/alertas${method === 'POST' ? '/detectar' : ''}`,
      {
        method,
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en proxy de alertas:', error);
    return NextResponse.json(
      { message: 'Error al consultar alertas' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return proxy(request, 'GET');
}

export async function POST(request: NextRequest) {
  return proxy(request, 'POST');
}
