/**
 * Categoria Service
 * Lógica de negocio para categorías
 */

import { categoriaRepository } from '../repositories/categoria.repository';
import { CreateCategoriaDto, UpdateCategoriaDto } from '../models/dto/categoria.dto';
import { CategoriaEntity } from '../models/entities/categoria.entity';

export const categoriaService = {
  async getAll(soloActivas = false): Promise<CategoriaEntity[]> {
    return categoriaRepository.findAll(soloActivas);
  },

  async getById(id: number): Promise<CategoriaEntity> {
    const categoria = await categoriaRepository.findById(id);

    if (!categoria) {
      throw new Error('Categoría no encontrada');
    }

    return categoria;
  },

  async create(data: CreateCategoriaDto): Promise<CategoriaEntity> {
    // Validar nombre
    if (!data.nombre || data.nombre.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }
    if (data.nombre.trim().length > 50) {
      throw new Error('El nombre no puede superar los 50 caracteres');
    }

    // Validar color (formato hex opcional)
    if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
      throw new Error('El color debe estar en formato hexadecimal (#RRGGBB)');
    }

    // Verificar duplicados
    const existente = await categoriaRepository.findByNombre(data.nombre.trim());
    if (existente) {
      throw new Error('Ya existe una categoría con ese nombre');
    }

    return categoriaRepository.create({
      ...data,
      nombre: data.nombre.trim(),
    });
  },

  async update(id: number, data: UpdateCategoriaDto): Promise<CategoriaEntity> {
    // Verificar que existe
    await this.getById(id);

    // Validaciones opcionales
    if (data.nombre !== undefined) {
      if (data.nombre.trim().length < 2) throw new Error('El nombre debe tener al menos 2 caracteres');
      if (data.nombre.trim().length > 50) throw new Error('El nombre no puede superar los 50 caracteres');

      const existente = await categoriaRepository.findByNombre(data.nombre.trim());
      if (existente && existente.id !== id) {
        throw new Error('Ya existe una categoría con ese nombre');
      }

      data.nombre = data.nombre.trim();
    }

    if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
      throw new Error('El color debe estar en formato hexadecimal (#RRGGBB)');
    }

    const actualizada = await categoriaRepository.update(id, data);
    if (!actualizada) throw new Error('Error al actualizar la categoría');

    return actualizada;
  },

  async delete(id: number): Promise<void> {
    await this.getById(id);

    try {
      const eliminada = await categoriaRepository.delete(id);
      if (!eliminada) throw new Error('Error al eliminar la categoría');
    } catch (error: any) {
      // ON DELETE RESTRICT lanzará error si tiene transacciones asociadas
      if (error.code === '23503') {
        throw new Error('No se puede eliminar: la categoría tiene transacciones asociadas. Considera desactivarla en su lugar.');
      }
      throw error;
    }
  },

  async deactivate(id: number): Promise<CategoriaEntity> {
    await this.getById(id);
    const resultado = await categoriaRepository.deactivate(id);
    if (!resultado) throw new Error('Error al desactivar la categoría');
    return resultado;
  },
};