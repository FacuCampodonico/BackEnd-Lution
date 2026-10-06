import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
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
  @IsOptional()
  @IsInt()
  empleadoId?: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ItemCarritoDto)
  items: ItemCarritoDto[];
}