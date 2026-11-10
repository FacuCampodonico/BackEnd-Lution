import type { Mesa, EstadoMesa } from '../entities/mesa.entity';
import { EstadoPedido } from '../../pedido/entities/pedido.entity';
import { pedidoResponse } from '../../pedido/dto/pedido-response.dto';

export interface MesaResponse {
  id: string;
  numero: string;
  estado: EstadoMesa;
  pedidoActualId: string | null;
  totalActual: number;
  cantidadItems: number;
}