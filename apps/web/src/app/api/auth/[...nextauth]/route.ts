/**
 * Route handler de NextAuth
 *
 * Maneja todas las rutas de autenticación: /api/auth/*
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
