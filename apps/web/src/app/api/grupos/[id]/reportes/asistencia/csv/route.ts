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
    const url = `${getApiUrl()}/api/v1/grupos/${id}/reportes/asistencia/csv${qs ? `?${qs}` : ''}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          message:
            (data as { message?: string }).message ?? 'Error al generar CSV',
        },
        { status: response.status }
      );
    }

    const csv = await response.text();
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="reporte-asistencia-${id}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error en grupos/:id/reportes/asistencia/csv proxy:', error);
    return NextResponse.json(
      { message: 'Error al generar reporte CSV' },
      { status: 500 }
    );
  }
}
