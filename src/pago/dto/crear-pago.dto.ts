import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { TipoPago } from '../enums/tipo-pago.enum';

export class CrearPagoDto {
  @IsEnum(TipoPago)
  tipo: TipoPago;

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