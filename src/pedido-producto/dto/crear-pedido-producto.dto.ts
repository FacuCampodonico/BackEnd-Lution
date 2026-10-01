import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CrearPedidoProductoDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  cantidad: number;

  @IsOptional()
  @IsString()
  comentario?: string;

  @IsNotEmpty()
  @IsInt()
  pedidoId: number;

  @IsNotEmpty()
  @IsInt()
  productoId: number;
}