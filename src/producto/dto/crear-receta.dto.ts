import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class CrearRecetaDto {
  @IsInt({ message: 'El ID del insumo debe ser un número entero' })
  @Min(1)
  insumoId: number;

  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: 'La cantidad debe ser un número con hasta 3 decimales' },
  )
  @Min(0.001, { message: 'La cantidad debe ser mayor que cero' })
  @Max(9999999.999)
  cantidad: number;
}
