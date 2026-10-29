import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { EstadoPedido } from '../entities/pedido.entity';

export class ListarPedidosDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  mesaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  empleadoId?: number;

  @IsOptional()
  @IsEnum(EstadoPedido)
  estado?: EstadoPedido;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite: number = 10;
}
