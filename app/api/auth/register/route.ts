/**
 * POST /api/auth/register
 * Ruta para el registro de nuevos usuarios
 */

import { authController } from '@/src/controllers/auth.controller';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return authController.register(request);
}
