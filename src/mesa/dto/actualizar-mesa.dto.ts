import { IsOptional, IsEnum } from 'class-validator';
import { EstadoMesa } from '../entities/mesa.entity';

export class ActualizarMesaDto {
  @IsEnum(EstadoMesa)
  @IsOptional()
  estado?: EstadoMesa;
}