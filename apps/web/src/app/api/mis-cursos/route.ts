/**
 * API Route: Proxy para listar mis cursos inscritos
 *
 * GET: listar inscripciones del usuario autenticado
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
    const { searchParams } = new URL(request.url);

    const response = await fetch(
      `${API_URL}/api/v1/mis-cursos?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en mis-cursos proxy:', error);
    return NextResponse.json(
      { message: 'Error al obtener mis cursos' },
      { status: 500 }
    );
  }
}
