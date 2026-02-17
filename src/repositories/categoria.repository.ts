/**
 * Categoria Repository
 * Capa de acceso a datos para categorías
 */

import { query } from '../lib/db';
import { CategoriaEntity } from '../models/entities/categoria.entity';
import { CreateCategoriaDto, UpdateCategoriaDto } from '../models/dto/categoria.dto';

export const categoriaRepository = {
  /**
   * Crea una nueva categoría
   */
  async create(data: CreateCategoriaDto): Promise<CategoriaEntity> {
    const result = await query<CategoriaEntity>(
      `
      INSERT INTO categorias (nombre, descripcion, color, icono)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre, descripcion, color, icono, activa
      `,
      [data.nombre, data.descripcion ?? null, data.color ?? null, data.icono ?? null]
    );

    if (result.rows.length === 0) {
      throw new Error('Error al crear la categoría');
    }

    return result.rows[0];
  },

  /**
   * Obtiene todas las categorías (opcionalmente solo activas)
   */
  async findAll(soloActivas = false): Promise<CategoriaEntity[]> {
    const whereClause = soloActivas ? 'WHERE activa = TRUE' : '';

    const result = await query<CategoriaEntity>(
      `
      SELECT id, nombre, descripcion, color, icono, activa
      FROM categorias
      ${whereClause}
      ORDER BY nombre ASC
      `
    );

    return result.rows;
  },

  /**
   * Busca una categoría por ID
   */
  async findById(id: number): Promise<CategoriaEntity | null> {
    const result = await query<CategoriaEntity>(
      `
      SELECT id, nombre, descripcion, color, icono, activa
      FROM categorias
      WHERE id = $1
      `,
      [id]
    );

    return result.rows[0] ?? null;
  },

  /**
   * Busca una categoría por nombre (para evitar duplicados)
   */
  async findByNombre(nombre: string): Promise<CategoriaEntity | null> {
    const result = await query<CategoriaEntity>(
      `
      SELECT id, nombre, descripcion, color, icono, activa
      FROM categorias
      WHERE LOWER(nombre) = LOWER($1)
      `,
      [nombre]
    );

    return result.rows[0] ?? null;
  },

  /**
   * Actualiza una categoría
   */
  async update(id: number, data: UpdateCategoriaDto): Promise<CategoriaEntity | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.nombre !== undefined) {
      updates.push(`nombre = $${paramIndex++}`);
      params.push(data.nombre);
    }
    if (data.descripcion !== undefined) {
      updates.push(`descripcion = $${paramIndex++}`);
      params.push(data.descripcion);
    }
    if (data.color !== undefined) {
      updates.push(`color = $${paramIndex++}`);
      params.push(data.color);
    }
    if (data.icono !== undefined) {
      updates.push(`icono = $${paramIndex++}`);
      params.push(data.icono);
    }
    if (data.activa !== undefined) {
      updates.push(`activa = $${paramIndex++}`);
      params.push(data.activa);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);

    const result = await query<CategoriaEntity>(
      `
      UPDATE categorias
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, nombre, descripcion, color, icono, activa
      `,
      params
    );

    return result.rows[0] ?? null;
  },

  /**
   * Elimina una categoría (hard delete)
   * Precaución: fallará si tiene transacciones asociadas (ON DELETE RESTRICT)
   */
  async delete(id: number): Promise<boolean> {
    const result = await query(
      `DELETE FROM categorias WHERE id = $1`,
      [id]
    );

    return (result.rowCount ?? 0) > 0;
  },

  /**
   * Desactiva una categoría (soft delete recomendado)
   */
  async deactivate(id: number): Promise<CategoriaEntity | null> {
    return this.update(id, { activa: false });
  },
};