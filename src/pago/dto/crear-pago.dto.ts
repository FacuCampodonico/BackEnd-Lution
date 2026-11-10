import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { TipoPago } from '../enums/tipo-pago.enum';

export class CrearPagoDto {
  // Mercado Pago no se registra a mano: entra por /pago/mercadopago/confirmar.
  @IsIn([TipoPago.EFECTIVO, TipoPago.TARJETA])
  tipo: TipoPago.EFECTIVO | TipoPago.TARJETA;

  @ValidateIf((o) => o.tipo === TipoPago.EFECTIVO)
  @IsNumber()
  @Min(0)
  pagaCon?: number;

  @ValidateIf((o) => o.tipo === TipoPago.TARJETA)
  @IsString()
  @IsOptional()
  titular?: string;

  @ValidateIf((o) => o.tipo === TipoPago.TARJETA)
  @IsString()
  @IsOptional()
  marca?: string;

  @ValidateIf((o) => o.tipo === TipoPago.TARJETA)
  @IsNumber()
  @IsOptional()
  cuotas?: number;
}
