import { TipoPago } from '../enums/tipo-pago.enum';

export class ActualizarPagoDto {
  tipo?: TipoPago;
  pagaCon?: number;
  vuelto?: number;
  titular?: string;
  marca?: string;
  cuotas?: number;
}