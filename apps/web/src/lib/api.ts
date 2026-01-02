/**
 * Cliente API para comunicación con el backend
 *
 * Maneja automáticamente:
 * - Token de autenticación (desde NextAuth)
 * - Base URL del API
 * - Manejo de errores
 */

import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'http://localhost:3001';

interface ApiError {
  message: string;
  statusCode: number;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Cliente API para uso en Server Components y Server Actions
 *
 * Automáticamente incluye el token JWT de la sesión.
 *
 * @example
 * // En un Server Component
 * const cursos = await api.get('/cursos');
 *
 * // En una Server Action
 * const curso = await api.post('/cursos', { titulo: 'Nuevo Curso' });
 */
export const api = {
  async fetch<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const cookieStore = await cookies();
    const token = await getToken({
      req: {
        cookies: cookieStore,
        headers: new Headers(),
      } as never,
      secret: process.env.AUTH_SECRET,
    });

    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    if (token) {
      // Crear un JWT simple con la info necesaria para el backend
      // El backend verificará este token con el mismo AUTH_SECRET
      const authToken = await createAuthToken(token);
      headers.set('Authorization', `Bearer ${authToken}`);
    }

    const response = await fetch(`${API_URL}/api/v1${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: 'Error de conexión con el servidor',
        statusCode: response.status,
      }));

      throw new ApiClientError(
        error.message,
        error.statusCode || response.status,
        error
      );
    }

    return response.json() as Promise<T>;
  },

  get<T = unknown>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'GET' });
  },

  post<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  patch<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete<T = unknown>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'DELETE' });
  },
};

/**
 * Crea un token JWT firmado para enviar al backend
 */
async function createAuthToken(
  payload: Record<string, unknown>
): Promise<string> {
  const { SignJWT } = await import('jose');
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

  const token = await new SignJWT({
    id: payload.id as string,
    sub: payload.sub as string,
    email: payload.email as string,
    rol: payload.rol as string,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);

  return token;
}
