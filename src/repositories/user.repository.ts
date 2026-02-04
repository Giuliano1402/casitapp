/**
 * User Repository
 * Capa de acceso a datos para usuarios
 */

import { query } from '../lib/db';
import { UserEntity } from '../models/entities/user.entity';

export const userRepository = {
  /**
   * Crea un nuevo usuario
   */
  async create(
    name: string,
    email: string
  ): Promise<UserEntity> {
    const result = await query<UserEntity>(
      `
      INSERT INTO usuarios (name, email)
      VALUES ($1, $2)
      RETURNING id, name, email, created_at
      `,
      [name,email]
    );

    if (result.rows.length === 0) {
      throw new Error('Error al crear el usuario');
    }

    return result.rows[0];
  },

  /**
   * Busca un usuario por email
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await query<UserEntity>(
      `
      SELECT id, name, email, created_at
      FROM usuarios
      WHERE email = $1
      `,
      [email]
    );

    return result.rows[0] ?? null;
  },

  /**
   * Busca un usuario por ID
   */
  async findById(id: number): Promise<UserEntity | null> {
    const result = await query<UserEntity>(
      `
      SELECT id, name, email, created_at
      FROM usuarios
      WHERE id = $1
      `,
      [id]
    );

    return result.rows[0] ?? null;
  },

  /**
   * Obtiene todos los usuarios
   */
  async findAll(): Promise<UserEntity[]> {
    const result = await query<UserEntity>(
      `
      SELECT id, name, email, created_at
      FROM usuarios
      ORDER BY created_at DESC
      `
    );

    return result.rows;
  },

  /**
   * Actualiza un usuario
   */
  async update(
    id: number,
    name?: string,
    email?: string
  ): Promise<UserEntity | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }

    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      params.push(email);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);

    const result = await query<UserEntity>(
      `
      UPDATE usuarios
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, name, email, created_at
      `,
      params
    );

    return result.rows[0] ?? null;
  },
};
