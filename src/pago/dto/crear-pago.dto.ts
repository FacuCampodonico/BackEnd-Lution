import { TipoPago } from '../enums/tipo-pago.enum';

export class CrearPagoDto {
  tipo: TipoPago;
  pagaCon?: number;
  vuelto?: number;
  titular?: string;
  marca?: string;
  cuotas?: number;
}