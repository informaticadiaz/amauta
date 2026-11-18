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
    const token = await getAuthenticatedBackendToken(request);
    if (!token) return createUnauthorizedResponse();
    const { id } = await params;
    const response = await fetch(
      `${API_URL}/api/v1/justificaciones/${id}/archivo`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) {
      return NextResponse.json(
        await response
          .json()
          .catch(() => ({ message: 'No se pudo descargar el archivo' })),
        { status: response.status }
      );
    }
    const headers = new Headers();
    for (const name of ['content-type', 'content-disposition']) {
      const value = response.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new NextResponse(await response.arrayBuffer(), {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error('Error en proxy de archivo de justificación:', error);
    return NextResponse.json(
      { message: 'Error al descargar el archivo' },
      { status: 500 }
    );
  }
}
