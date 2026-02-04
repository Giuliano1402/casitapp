/**
 * Auth Service
 * Lógica de negocio para autenticación y registro
 */

import crypto from 'crypto';
import {
  isValidEmail,
  isValidPassword,
  isValidName,
  passwordsMatch,
} from '../utils/validators';
import { CreateUserDto, CreateUserResponse } from '../models/dto/create-user.dto';
import { userRepository } from '../repositories/user.repository';
/**
 * Hash simple de contraseña (en producción usar bcrypt o argon2)
 * Esta es una implementación básica. Se recomienda usar bcrypt en producción.
 */
const hashPassword = (password: string): string => {
  return crypto
    .pbkdf2Sync(password, process.env.SALT_ROUNDS || 'salt', 1000, 64, 'sha512')
    .toString('hex');
};

/**
 * Verifica una contraseña contra su hash
 */
const verifyPassword = (password: string, hash: string): boolean => {
  const hashedPassword = hashPassword(password);
  return hashedPassword === hash;
};

export const authService = {
  /**
   * Registra un nuevo usuario
   */
  async register(dto: CreateUserDto): Promise<CreateUserResponse> {
    // Validaciones
    if (!isValidName(dto.nombre)) {
      throw new Error(
        'El nombre debe tener entre 2 y 100 caracteres'
      );
    }

    if (!isValidEmail(dto.email)) {
      throw new Error('El email no es válido');
    }

    if (!isValidPassword(dto.password)) {
      throw new Error(
        'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales'
      );
    }

    if (!passwordsMatch(dto.password, dto.confirmPassword)) {
      throw new Error('Las contraseñas no coinciden');
    }

    // Verifica si el usuario ya existe
    const existingUser = await userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hash la contraseña
    const passwordHash = hashPassword(dto.password);

    // Crea el usuario
    const user = await userRepository.create(
      dto.nombre,
      dto.email,
      passwordHash
    );

    // Retorna la respuesta sin la contraseña hash
    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      fecha_registro: user.fecha_registro,
      activo: user.activo,
    };
  },

  /**
   * Valida las credenciales de un usuario
   */
  async validateCredentials(email: string, password: string): Promise<boolean> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return false;
    }

    return verifyPassword(password, user.password_hash);
  },

  /**
   * Obtiene un usuario por email (sin mostrar la contraseña)
   */
  async getUserByEmail(email: string): Promise<CreateUserResponse | null> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      fecha_registro: user.fecha_registro,
      activo: user.activo,
    };
  },

  /**
   * Obtiene un usuario por ID (sin mostrar la contraseña)
   */
  async getUserById(id: number): Promise<CreateUserResponse | null> {
    const user = await userRepository.findById(id);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      fecha_registro: user.fecha_registro,
      activo: user.activo,
    };
  },
};
