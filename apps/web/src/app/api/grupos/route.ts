/**
 * API Route: Proxy para listar y crear grupos
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
    const institucionId = searchParams.get('institucionId');

    if (!institucionId) {
      return NextResponse.json(
        { message: 'institucionId es requerido' },
        { status: 400 }
      );
    }

    const query = new URLSearchParams();
    const activo = searchParams.get('activo');
    const periodoAcademicoId = searchParams.get('periodoAcademicoId');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    if (activo !== null) query.set('activo', activo);
    if (periodoAcademicoId) query.set('periodoAcademicoId', periodoAcademicoId);
    if (page) query.set('page', page);
    if (limit) query.set('limit', limit);

    const qs = query.toString();
    const url = `${API_URL}/api/v1/instituciones/${institucionId}/grupos${qs ? `?${qs}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en grupos proxy GET:', error);
    return NextResponse.json(
      { message: 'Error al obtener grupos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authToken = await getAuthenticatedBackendToken(request);
    if (!authToken) {
      return createUnauthorizedResponse();
    }
    const body = await request.json();
    const { institucionId, ...dto } = body as {
      institucionId: string;
      [key: string]: unknown;
    };

    if (!institucionId) {
      return NextResponse.json(
        { message: 'institucionId es requerido' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_URL}/api/v1/instituciones/${institucionId}/grupos`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(dto),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en grupos proxy POST:', error);
    return NextResponse.json(
      { message: 'Error al crear grupo' },
      { status: 500 }
    );
  }
}
