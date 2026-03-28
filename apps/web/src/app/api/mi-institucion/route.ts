/**
 * API Route: Proxy para obtener la institución del usuario actual
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const authToken = await getAuthenticatedBackendToken(request);
    if (!authToken) {
      return createUnauthorizedResponse();
    }

    const response = await fetch(
      `${API_URL}/api/v1/instituciones/mi-institucion`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en mi-institucion proxy:', error);
    return NextResponse.json(
      { message: 'Error al obtener institución' },
      { status: 500 }
    );
  }
}
