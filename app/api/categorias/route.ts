
// GET /api/categorias

import { categoriaController } from "@/src/controllers/categoria.controller";

// GET /api/categorias?activas=true
export async function GET(request: Request) {
  return categoriaController.getAll(request);
}

// POST /api/categorias
export async function POST(request: Request) {
  return categoriaController.create(request);
}