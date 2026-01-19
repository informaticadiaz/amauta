/**
 * API Route: Proxy para imágenes del backend
 *
 * Permite servir imágenes del backend sin exponer la URL directamente.
 * Ejemplo: /api/image/uploads/cursos/abc.webp → backend/uploads/cursos/abc.webp
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const imagePath = path.join('/');

    const response = await fetch(`${API_URL}/${imagePath}`);

    if (!response.ok) {
      return new NextResponse(null, { status: 404 });
    }

    const contentType = response.headers.get('content-type') || 'image/webp';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error en image proxy:', error);
    return new NextResponse(null, { status: 500 });
  }
}
