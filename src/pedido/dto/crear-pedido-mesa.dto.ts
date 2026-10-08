import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  Min,
  ValidateNested,
} from 'class-validator';

export class ItemCarritoDto {
  @IsNotEmpty()
  @IsInt()
  productoId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  cantidad: number;
}

export class CrearPedidoMesaDto {
  @IsNotEmpty({ message: 'El empleado es obligatorio' })
  @IsInt({ message: 'El ID del empleado debe ser un número entero' })
  empleadoId: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ItemCarritoDto)
  items: ItemCarritoDto[];
}