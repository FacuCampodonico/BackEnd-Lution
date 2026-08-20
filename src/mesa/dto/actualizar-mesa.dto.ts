import { IsOptional, IsString } from 'class-validator';

export class ActualizarMesaDto {
  @IsString()
  @IsOptional()
  estado?: string;
}