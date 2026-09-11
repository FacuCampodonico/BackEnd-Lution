import { IsEmail, IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';


export class CrearPedidoDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fechaHoraInicio: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fechaHoraCierre: string;

  @IsNotEmpty()
  @IsInt()
  total: number;

  @IsNotEmpty()
  @IsInt()
  empleadoId: number;

  @IsNotEmpty()
  @IsInt()
  mesaId: number;
}