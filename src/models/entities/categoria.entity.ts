export interface CategoriaEntity {
  id: number;
  nombre: string;
  descripcion: string | null;
  color: string | null;
  icono: string | null;
  activa: boolean;
}
