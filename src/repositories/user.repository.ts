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
    nombre: string,
    email: string,
    passwordHash: string
  ): Promise<UserEntity> {
    const result = await query<UserEntity>(
      `
      INSERT INTO usuarios (nombre, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, nombre, email, password_hash, fecha_registro, activo
      `,
      [nombre, email, passwordHash]
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
      SELECT id, nombre, email, password_hash, fecha_registro, activo
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
      SELECT id, nombre, email, password_hash, fecha_registro, activo
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
      SELECT id, nombre, email, fecha_registro, activo
      FROM usuarios
      ORDER BY fecha_registro DESC
      `
    );

    return result.rows;
  },

  /**
   * Actualiza un usuario
   */
  async update(
    id: number,
    nombre?: string,
    email?: string
  ): Promise<UserEntity | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (nombre !== undefined) {
      updates.push(`nombre = $${paramIndex++}`);
      params.push(nombre);
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
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, nombre, email, password_hash, fecha_registro, activo
      `,
      params
    );

    return result.rows[0] ?? null;
  },
};
