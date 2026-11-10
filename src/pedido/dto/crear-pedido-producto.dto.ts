import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CrearPedidoProductoDto {
  @IsNotEmpty()
  @IsInt()
  productoId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  cantidad: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  comentario?: string;
}
