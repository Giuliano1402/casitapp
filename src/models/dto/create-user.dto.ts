/**
 * Create User DTO (Data Transfer Object)
 * Define la estructura de datos esperada para crear un nuevo usuario
 */
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;

export interface CreateUserDto {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CreateUserResponse {
  id: number;
  nombre: string;
  email: string;
  fecha_registro: Date;
  activo: boolean;
}
