/**
 * Transaccion Repository
 * Capa de acceso a datos para transacciones
 */

import { query } from '../lib/db';

export interface TransaccionEntity {
  id: number;
  usuario_id: number;
  categoria_id: number;
  categoria_nombre?: string;
  categoria_color?: string;
  categoria_icono?: string;
  tipo: 'INGRESO' | 'GASTO';
  monto: number;
  descripcion?: string;
  fecha_transaccion: string;
  fecha_registro: string;
  es_recurrente: boolean;
  metodo_pago?: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'CHEQUE' | 'OTRO';
}

export interface CreateTransaccionDto {
  usuario_id: number;
  categoria_id: number;
  tipo: 'INGRESO' | 'GASTO';
  monto: number;
  descripcion?: string;
  fecha_transaccion: string;
  es_recurrente?: boolean;
  metodo_pago?: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'CHEQUE' | 'OTRO';
}

export interface UpdateTransaccionDto {
  categoria_id?: number;
  tipo?: 'INGRESO' | 'GASTO';
  monto?: number;
  descripcion?: string;
  fecha_transaccion?: string;
  es_recurrente?: boolean;
  metodo_pago?: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'CHEQUE' | 'OTRO';
}

export interface FiltrosTransaccion {
  usuario_id: number;
  tipo?: 'INGRESO' | 'GASTO';
  categoria_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  es_recurrente?: boolean;
}

export const transaccionRepository = {
  /**
   * Obtiene todas las transacciones de un usuario con filtros opcionales
   */
  async findAll(filtros: FiltrosTransaccion): Promise<TransaccionEntity[]> {
    const conditions: string[] = ['t.usuario_id = $1'];
    const params: any[] = [filtros.usuario_id];
    let idx = 2;

    if (filtros.tipo) {
      conditions.push(`t.tipo = $${idx++}`);
      params.push(filtros.tipo);
    }
    if (filtros.categoria_id) {
      conditions.push(`t.categoria_id = $${idx++}`);
      params.push(filtros.categoria_id);
    }
    if (filtros.fecha_desde) {
      conditions.push(`t.fecha_transaccion >= $${idx++}`);
      params.push(filtros.fecha_desde);
    }
    if (filtros.fecha_hasta) {
      conditions.push(`t.fecha_transaccion <= $${idx++}`);
      params.push(filtros.fecha_hasta);
    }
    if (filtros.es_recurrente !== undefined) {
      conditions.push(`t.es_recurrente = $${idx++}`);
      params.push(filtros.es_recurrente);
    }

    const result = await query<TransaccionEntity>(
      `
      SELECT
        t.id, t.usuario_id, t.categoria_id, t.tipo, t.monto,
        t.descripcion, t.fecha_transaccion, t.fecha_registro,
        t.es_recurrente, t.metodo_pago,
        c.nombre AS categoria_nombre,
        c.color  AS categoria_color,
        c.icono  AS categoria_icono
      FROM transacciones t
      LEFT JOIN categorias c ON c.id = t.categoria_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY t.fecha_transaccion DESC, t.fecha_registro DESC
      `,
      params
    );

    return result.rows;
  },

  /**
   * Busca una transacción por ID
   */
  async findById(id: number): Promise<TransaccionEntity | null> {
    const result = await query<TransaccionEntity>(
      `
      SELECT
        t.id, t.usuario_id, t.categoria_id, t.tipo, t.monto,
        t.descripcion, t.fecha_transaccion, t.fecha_registro,
        t.es_recurrente, t.metodo_pago,
        c.nombre AS categoria_nombre,
        c.color  AS categoria_color,
        c.icono  AS categoria_icono
      FROM transacciones t
      LEFT JOIN categorias c ON c.id = t.categoria_id
      WHERE t.id = $1
      `,
      [id]
    );

    return result.rows[0] ?? null;
  },

  /**
   * Crea una nueva transacción
   */
  async create(data: CreateTransaccionDto): Promise<TransaccionEntity> {
    const result = await query<TransaccionEntity>(
      `
      INSERT INTO transacciones
        (usuario_id, categoria_id, tipo, monto, descripcion, fecha_transaccion, es_recurrente, metodo_pago)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, usuario_id, categoria_id, tipo, monto, descripcion,
                fecha_transaccion, fecha_registro, es_recurrente, metodo_pago
      `,
      [
        data.usuario_id,
        data.categoria_id,
        data.tipo,
        data.monto,
        data.descripcion ?? null,
        data.fecha_transaccion,
        data.es_recurrente ?? false,
        data.metodo_pago ?? null,
      ]
    );

    if (result.rows.length === 0) throw new Error('Error al crear la transacción');
    return result.rows[0];
  },

  /**
   * Actualiza una transacción
   */
  async update(id: number, data: UpdateTransaccionDto): Promise<TransaccionEntity | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (data.categoria_id !== undefined) { updates.push(`categoria_id = $${idx++}`); params.push(data.categoria_id); }
    if (data.tipo !== undefined)          { updates.push(`tipo = $${idx++}`);          params.push(data.tipo); }
    if (data.monto !== undefined)         { updates.push(`monto = $${idx++}`);         params.push(data.monto); }
    if (data.descripcion !== undefined)   { updates.push(`descripcion = $${idx++}`);   params.push(data.descripcion); }
    if (data.fecha_transaccion !== undefined) { updates.push(`fecha_transaccion = $${idx++}`); params.push(data.fecha_transaccion); }
    if (data.es_recurrente !== undefined) { updates.push(`es_recurrente = $${idx++}`); params.push(data.es_recurrente); }
    if (data.metodo_pago !== undefined)   { updates.push(`metodo_pago = $${idx++}`);   params.push(data.metodo_pago); }

    if (updates.length === 0) return this.findById(id);

    params.push(id);

    const result = await query<TransaccionEntity>(
      `
      UPDATE transacciones
      SET ${updates.join(', ')}
      WHERE id = $${idx}
      RETURNING id, usuario_id, categoria_id, tipo, monto, descripcion,
                fecha_transaccion, fecha_registro, es_recurrente, metodo_pago
      `,
      params
    );

    return result.rows[0] ?? null;
  },

  /**
   * Elimina una transacción
   */
  async delete(id: number): Promise<boolean> {
    const result = await query(`DELETE FROM transacciones WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  },
};