/**
 * POST /api/auth/login
 * Ruta para el login de usuarios
 */

import { authController } from '@/src/controllers/auth.controller';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  return authController.validateLogin(request);
}

