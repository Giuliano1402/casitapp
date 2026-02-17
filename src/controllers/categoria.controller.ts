/**
 * Categoria Controller
 * Manejo de requests/responses para categorías
 */

import { NextResponse } from 'next/server';
import { categoriaService } from '../services/categoria.service';

export const categoriaController = {
  // GET /api/categorias
  async getAll(request: Request) {
  const { searchParams } = new URL(request.url);
  const soloActivas = searchParams.get('activas') === 'true';

  console.log('[CategoriaController] getAll →', { soloActivas });

  try {
    const categorias = await categoriaService.getAll(soloActivas);
    console.log(`[CategoriaController] getAll OK → ${categorias.length} categorías`);
    return NextResponse.json(categorias);
  } catch (error: any) {
    console.error('[CategoriaController] getAll FAILED →', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 });
  }
},

  // GET /api/categorias/[id]
  async getById(request: Request, id: number) {
    try {
      const categoria = await categoriaService.getById(id);
      return NextResponse.json(categoria);
    } catch (error: any) {
      const status = error.message === 'Categoría no encontrada' ? 404 : 500;
      return NextResponse.json({ error: error.message }, { status });
    }
  },

  // POST /api/categorias
  async create(request: Request) {
    try {
      const body = await request.json();
      const categoria = await categoriaService.create(body);
      return NextResponse.json(categoria, { status: 201 });
    } catch (error: any) {
      const status = error.message.includes('Ya existe') ? 409 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
  },

  // PUT /api/categorias/[id]
  async update(request: Request, id: number) {
    try {
      const body = await request.json();
      const categoria = await categoriaService.update(id, body);
      return NextResponse.json(categoria);
    } catch (error: any) {
      const status =
        error.message === 'Categoría no encontrada' ? 404 :
        error.message.includes('Ya existe') ? 409 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
  },

  // DELETE /api/categorias/[id]
  async delete(request: Request, id: number) {
    try {
      await categoriaService.delete(id);
      return NextResponse.json({ message: 'Categoría eliminada exitosamente' });
    } catch (error: any) {
      const status =
        error.message === 'Categoría no encontrada' ? 404 :
        error.message.includes('transacciones asociadas') ? 409 : 500;
      return NextResponse.json({ error: error.message }, { status });
    }
  },

  // PATCH /api/categorias/[id]/deactivate
  async deactivate(request: Request, id: number) {
    try {
      const categoria = await categoriaService.deactivate(id);
      return NextResponse.json(categoria);
    } catch (error: any) {
      const status = error.message === 'Categoría no encontrada' ? 404 : 500;
      return NextResponse.json({ error: error.message }, { status });
    }
  },
};