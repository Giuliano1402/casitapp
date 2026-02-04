/**
 * User Entity
 * Representa la estructura de un usuario en la base de datos
 */
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}

export interface UserEntity {
  id: number;
  nombre: string;
  email: string;
  password_hash: string;
  fecha_registro: Date;
  activo: boolean;
}
