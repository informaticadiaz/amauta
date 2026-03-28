/**
 * API Route: Proxy para listar estudiantes por institución
 */

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
    if (!authToken) {
      return createUnauthorizedResponse();
    }

    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const query = new URLSearchParams();
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const buscar = searchParams.get('buscar');

    if (page) query.set('page', page);
    if (limit) query.set('limit', limit);
    if (buscar) query.set('buscar', buscar);

    const qs = query.toString();
    const url = `${API_URL}/api/v1/instituciones/${id}/estudiantes${qs ? `?${qs}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en instituciones/:id/estudiantes proxy GET:', error);
    return NextResponse.json(
      { message: 'Error al listar estudiantes' },
      { status: 500 }
    );
  }
}
