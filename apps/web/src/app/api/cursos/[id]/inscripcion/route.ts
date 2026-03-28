/**
 * API Route: Proxy para obtener el estado de inscripción en un curso
 *
 * GET: consultar si el usuario está inscrito
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

    const response = await fetch(`${API_URL}/api/v1/cursos/${id}/inscripcion`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en inscripcion status proxy:', error);
    return NextResponse.json(
      { message: 'Error al obtener estado de inscripción' },
      { status: 500 }
    );
  }
}
