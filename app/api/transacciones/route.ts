import { transaccionController } from '@/src/controllers/transaccion.controller';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/src/lib/jwt';

async function getUserId(): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    const payload = verifyToken(token) as any;
    return payload?.sub ?? null;
  } catch {
    return null;
  }
}

// GET /api/transacciones
export async function GET(request: Request) {
  const usuario_id = await getUserId();
  if (!usuario_id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const url = new URL(request.url);
  url.searchParams.set('usuario_id', String(usuario_id));

  return transaccionController.getAll(new Request(url.toString(), request));
}

// POST /api/transacciones
export async function POST(request: Request) {
  const usuario_id = await getUserId();
  if (!usuario_id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json();

  const newRequest = new Request(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ ...body, usuario_id }),
  });

  return transaccionController.create(newRequest);
}