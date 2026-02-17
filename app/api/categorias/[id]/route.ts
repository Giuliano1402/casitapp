import { categoriaController } from "@/src/controllers/categoria.controller";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/categorias/[id]
export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  return categoriaController.getById(request, Number(id));
}

// PUT /api/categorias/[id]
export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  return categoriaController.update(request, Number(id));
}

// DELETE /api/categorias/[id]
export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  return categoriaController.delete(request, Number(id));
}
