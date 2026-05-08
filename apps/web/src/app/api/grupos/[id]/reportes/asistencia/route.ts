import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

function getApiUrl() {
  return process.env.API_URL || 'http://localhost:3001';
}

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

    const periodoId = searchParams.get('periodoId');
    const desde = searchParams.get('desde');
    const hasta = searchParams.get('hasta');

    if (periodoId) query.set('periodoId', periodoId);
    if (desde) query.set('desde', desde);
    if (hasta) query.set('hasta', hasta);

    const qs = query.toString();
    const url = `${getApiUrl()}/api/v1/grupos/${id}/reportes/asistencia${qs ? `?${qs}` : ''}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en grupos/:id/reportes/asistencia proxy:', error);
    return NextResponse.json(
      { message: 'Error al obtener reporte de asistencia' },
      { status: 500 }
    );
  }
}
