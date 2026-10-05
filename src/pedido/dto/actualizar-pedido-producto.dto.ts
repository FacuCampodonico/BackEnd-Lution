import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class ActualizarPedidoProductoDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  cantidad?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  comentario?: string;
}
