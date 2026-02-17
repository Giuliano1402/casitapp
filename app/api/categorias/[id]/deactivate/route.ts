import { categoriaController } from "@/src/controllers/categoria.controller";

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/categorias/[id]/deactivate
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  return categoriaController.deactivate(request, Number(id));
}

