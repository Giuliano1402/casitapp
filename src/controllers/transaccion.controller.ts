/**
 * Transaccion Controller
 * Manejo de requests/responses para transacciones
 */

import { NextResponse } from 'next/server';
import { transaccionService } from '../services/transaccion.service';

export const transaccionController = {
  // GET /api/transacciones?usuario_id=&tipo=&categoria_id=&fecha_desde=&fecha_hasta=&es_recurrente=
  async getAll(request: Request) {
    const { searchParams } = new URL(request.url);

    const usuario_id = Number(searchParams.get('usuario_id'));
    if (!usuario_id) {
      return NextResponse.json({ error: 'usuario_id es requerido' }, { status: 400 });
    }

    const filtros = {
      usuario_id,
      tipo: searchParams.get('tipo') as any ?? undefined,
      categoria_id: searchParams.get('categoria_id') ? Number(searchParams.get('categoria_id')) : undefined,
      fecha_desde: searchParams.get('fecha_desde') ?? undefined,
      fecha_hasta: searchParams.get('fecha_hasta') ?? undefined,
      es_recurrente: searchParams.get('es_recurrente') !== null
        ? searchParams.get('es_recurrente') === 'true'
        : undefined,
    };

    try {
      const transacciones = await transaccionService.getAll(filtros);
      return NextResponse.json(transacciones);
    } catch (error: any) {
      console.error('[TransaccionController] getAll FAILED →', error.message);
      return NextResponse.json({ error: 'Error al obtener transacciones' }, { status: 500 });
    }
  },

  // GET /api/transacciones/[id]
  async getById(request: Request, id: number) {
    try {
      const transaccion = await transaccionService.getById(id);
      return NextResponse.json(transaccion);
    } catch (error: any) {
      const status = error.message === 'Transacción no encontrada' ? 404 : 500;
      return NextResponse.json({ error: error.message }, { status });
    }
  },

  // POST /api/transacciones
  async create(request: Request) {
    try {
      const body = await request.json();
      const transaccion = await transaccionService.create(body);
      return NextResponse.json(transaccion, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  },

  // PUT /api/transacciones/[id]
  async update(request: Request, id: number) {
    try {
      const body = await request.json();
      const transaccion = await transaccionService.update(id, body);
      return NextResponse.json(transaccion);
    } catch (error: any) {
      const status = error.message === 'Transacción no encontrada' ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
  },

  // DELETE /api/transacciones/[id]
  async delete(request: Request, id: number) {
    try {
      await transaccionService.delete(id);
      return NextResponse.json({ message: 'Transacción eliminada exitosamente' });
    } catch (error: any) {
      const status = error.message === 'Transacción no encontrada' ? 404 : 500;
      return NextResponse.json({ error: error.message }, { status });
    }
  },
};