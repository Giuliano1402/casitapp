import { transaccionController } from '@/src/controllers/transaccion.controller';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/transacciones/[id]
export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  return transaccionController.getById(request, Number(id));
}

// PUT /api/transacciones/[id]
export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  return transaccionController.update(request, Number(id));
}

// DELETE /api/transacciones/[id]
export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  return transaccionController.delete(request, Number(id));
}