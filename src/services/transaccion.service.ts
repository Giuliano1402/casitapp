/**
 * Transaccion Service
 * Lógica de negocio para transacciones
 */

import {
  transaccionRepository,
  TransaccionEntity,
  CreateTransaccionDto,
  UpdateTransaccionDto,
  FiltrosTransaccion,
} from '../repositories/transaccion.repository';

const TIPOS_VALIDOS   = ['INGRESO', 'GASTO'];
const ESTADOS_VALIDOS = ['COMPLETADO', 'PENDIENTE'];
const METODOS_VALIDOS = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'CHEQUE', 'OTRO'];

export const transaccionService = {
  async getAll(filtros: FiltrosTransaccion): Promise<TransaccionEntity[]> {
    return transaccionRepository.findAll(filtros);
  },

  async getById(id: number): Promise<TransaccionEntity> {
    const transaccion = await transaccionRepository.findById(id);
    if (!transaccion) throw new Error('Transacción no encontrada');
    return transaccion;
  },

  async create(data: CreateTransaccionDto): Promise<TransaccionEntity> {
    if (!data.tipo || !TIPOS_VALIDOS.includes(data.tipo)) {
      throw new Error('El tipo debe ser INGRESO o GASTO');
    }
    if (data.estado && !ESTADOS_VALIDOS.includes(data.estado)) {
      throw new Error('El estado debe ser COMPLETADO o PENDIENTE');
    }
    if (!data.monto || isNaN(Number(data.monto)) || Number(data.monto) <= 0) {
      throw new Error('El monto debe ser un número mayor a 0');
    }
    if (!data.fecha_transaccion) {
      throw new Error('La fecha de la transacción es obligatoria');
    }
    if (!data.categoria_id) {
      throw new Error('La categoría es obligatoria');
    }
    if (!data.usuario_id) {
      throw new Error('El usuario es obligatorio');
    }
    if (data.metodo_pago && !METODOS_VALIDOS.includes(data.metodo_pago)) {
      throw new Error('Método de pago inválido');
    }

    return transaccionRepository.create({
      ...data,
      monto: Number(data.monto),
      estado: data.estado ?? 'COMPLETADO',
    });
  },

  async update(id: number, data: UpdateTransaccionDto): Promise<TransaccionEntity> {
    await this.getById(id);

    if (data.tipo && !TIPOS_VALIDOS.includes(data.tipo)) {
      throw new Error('El tipo debe ser INGRESO o GASTO');
    }
    if (data.estado && !ESTADOS_VALIDOS.includes(data.estado)) {
      throw new Error('El estado debe ser COMPLETADO o PENDIENTE');
    }
    if (data.monto !== undefined && (isNaN(Number(data.monto)) || Number(data.monto) <= 0)) {
      throw new Error('El monto debe ser un número mayor a 0');
    }
    if (data.metodo_pago && !METODOS_VALIDOS.includes(data.metodo_pago)) {
      throw new Error('Método de pago inválido');
    }

    const actualizada = await transaccionRepository.update(id, {
      ...data,
      monto: data.monto !== undefined ? Number(data.monto) : undefined,
    });

    if (!actualizada) throw new Error('Error al actualizar la transacción');
    return actualizada;
  },

  async delete(id: number): Promise<void> {
    await this.getById(id);
    const eliminada = await transaccionRepository.delete(id);
    if (!eliminada) throw new Error('Error al eliminar la transacción');
  },
};