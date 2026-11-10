import { 
    IsInt, 
    IsNotEmpty, 
    IsPositive,
    IsNumber,
    IsOptional,
    Min
} from 'class-validator';

export class CrearMesaDto {
  @IsInt({ message: 'El número de mesa debe ser un número entero' })
  @IsPositive({ message: 'El número de mesa debe ser positivo' })
  @IsNotEmpty({ message: 'El número de mesa es obligatorio' })
  numero: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  capacidad?: number;
}