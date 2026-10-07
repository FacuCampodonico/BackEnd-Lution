import { EstadoPedido, type Pedido } from '../entities/pedido.entity';
import type { PedidoProducto } from '../entities/pedido-producto.entity';

export interface PedidoItemResponse {
  id: string;
  productoId: string;
  productoNombre: string;
  precioUnitario: number;
  cantidad: number;
}

export interface PedidoResponse {
  id: string;
  mesaId: string;
  items: PedidoItemResponse[];
  total: number;
  estado: EstadoPedido;
}

export function pedidoItemResponse(item: PedidoProducto): PedidoItemResponse {
  return {
    id: String(item.id),
    productoId: String(item.productoId),
    productoNombre: item.producto?.nombre ?? '',
    precioUnitario: Number(item.producto?.precio ?? 0),
    cantidad: item.cantidad,
  };
}

export function pedidoResponse(pedido: Pedido): PedidoResponse {
  const items = (pedido.pedidosProductos ?? []).map(pedidoItemResponse);
  const total =
    pedido.estado === EstadoPedido.PAGADO && pedido.total !== null
      ? Number(pedido.total)
      : items.reduce(
          (suma, item) => suma + item.precioUnitario * item.cantidad,
          0,
        );
  return {
    id: String(pedido.id),
    mesaId: String(pedido.mesaId),
    estado: pedido.estado,
    items,
    total,
  };
}
