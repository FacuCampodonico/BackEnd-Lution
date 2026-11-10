import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ConfirmarPagoMercadoPagoDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'paymentId debe ser numérico' })
  paymentId: string;
}
