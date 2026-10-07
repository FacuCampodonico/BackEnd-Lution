import type { Categoria } from '../entities/categoria.entity';

export interface CategoriaResponse {
  id: string;
  nombre: string;
  productoIds: string[];
}

