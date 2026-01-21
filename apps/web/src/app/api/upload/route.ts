/**
 * API Route: Proxy para uploads
 *
 * Permite que Client Components suban archivos sin necesitar
 * NEXT_PUBLIC_API_URL. Next.js hace el proxy al backend.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { SignJWT } from 'jose';

const API_URL = process.env.API_URL || 'http://localhost:3001';
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Obtener token de autenticación
    const token = await getToken({
      req: request,
      secret: AUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    // Crear JWT para el backend
    const secret = new TextEncoder().encode(AUTH_SECRET);
    const authToken = await new SignJWT({
      id: token.id as string,
      sub: token.sub as string,
      email: token.email as string,
      rol: token.rol as string,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret);

    // Obtener el FormData del request
    const formData = await request.formData();

    // Hacer proxy al backend
    const response = await fetch(`${API_URL}/api/v1/uploads`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en upload proxy:', error);
    return NextResponse.json(
      { message: 'Error al subir archivo' },
      { status: 500 }
    );
  }
}
