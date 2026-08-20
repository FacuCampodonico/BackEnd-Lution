import { 
    IsInt, 
    IsNotEmpty, 
    IsPositive 
} from 'class-validator';

export class CrearMesaDto {
  @IsInt({ message: 'El número de mesa debe ser un número entero' })
  @IsPositive({ message: 'El número de mesa debe ser positivo' })
  @IsNotEmpty({ message: 'El número de mesa es obligatorio' })
  numero: number;
}