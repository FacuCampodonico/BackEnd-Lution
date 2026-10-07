import type { Producto } from '../entities/producto.entity';

export interface ProductoResponse {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoriaId: string;
  categoriaNombre: string;
  insumoIds: string[];
}

export function productoResponse(producto: Producto): ProductoResponse {
  return {
    id: String(producto.id),
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: Number(producto.precio),
    categoriaId: String(producto.idCategoria),
    categoriaNombre: producto.categoria?.nombre ?? '',
    insumoIds: (producto.recetas ?? []).map((receta) =>
      String(receta.insumoId),
    ),
  };
}
