/**
 * API Route: Proxy para crear y listar evaluaciones
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const authToken = await getAuthenticatedBackendToken(request);
    if (!authToken) {
      return createUnauthorizedResponse();
    }
    const body = await request.json();

    const response = await fetch(`${API_URL}/api/v1/evaluaciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en evaluaciones proxy:', error);
    return NextResponse.json(
      { message: 'Error al crear evaluación' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authToken = await getAuthenticatedBackendToken(request);
    if (!authToken) {
      return createUnauthorizedResponse();
    }
    const { searchParams } = new URL(request.url);
    const cursoId = searchParams.get('cursoId');

    if (!cursoId) {
      return NextResponse.json(
        { message: 'cursoId es requerido' },
        { status: 400 }
      );
    }

    searchParams.delete('cursoId');
    const query = searchParams.toString();

    const response = await fetch(
      `${API_URL}/api/v1/cursos/${cursoId}/evaluaciones${
        query ? `?${query}` : ''
      }`,
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
    console.error('Error en evaluaciones proxy:', error);
    return NextResponse.json(
      { message: 'Error al obtener evaluaciones' },
      { status: 500 }
    );
  }
}
