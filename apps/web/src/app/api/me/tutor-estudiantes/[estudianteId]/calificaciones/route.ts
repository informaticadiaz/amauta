import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createUnauthorizedResponse,
  getAuthenticatedBackendToken,
} from '@/lib/backend-auth';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ estudianteId: string }> }
) {
  try {
    const token = await getAuthenticatedBackendToken(request);
    if (!token) return createUnauthorizedResponse();
    const { estudianteId } = await params;
    const response = await fetch(
      `${API_URL}/api/v1/me/tutor-estudiantes/${estudianteId}/calificaciones`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return NextResponse.json(await response.json(), {
      status: response.status,
    });
  } catch (error) {
    console.error('Error en proxy de calificaciones del tutor:', error);
    return NextResponse.json(
      { message: 'Error al obtener las calificaciones' },
      { status: 500 }
    );
  }
}
