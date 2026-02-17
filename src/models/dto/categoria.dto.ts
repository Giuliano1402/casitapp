export interface CreateCategoriaDto {
  nombre: string;
  descripcion?: string;
  color?: string;
  icono?: string;
}

export interface UpdateCategoriaDto {
  nombre?: string;
  descripcion?: string;
  color?: string;
  icono?: string;
  activa?: boolean;
}