/**
 * API Route: Proxy para obtener el progreso del estudiante en un curso
 *
 * GET: obtener progreso con IDs de lecciones completadas
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

    const response = await fetch(`${API_URL}/api/v1/cursos/${id}/progreso`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en progreso proxy:', error);
    return NextResponse.json(
      { message: 'Error al obtener el progreso' },
      { status: 500 }
    );
  }
}
