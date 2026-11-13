import { IsIn, IsNumber, Min } from 'class-validator';
import { TipoPago } from '../enums/tipo-pago.enum';

export class CrearPagoDto {
  // Mercado Pago no se registra a mano: entra por /pago/mercadopago/confirmar.
  @IsIn([TipoPago.EFECTIVO])
  tipo: TipoPago.EFECTIVO;

  @IsNumber()
  @Min(0)
  pagaCon: number;
}
