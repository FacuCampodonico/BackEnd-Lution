import { IsEmail, IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';


export class CrearInsumoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(120)
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El stock disponible es obligatorio' })
  @MaxLength(20)
  stockDisponible: number;

  @IsInt({ message: 'La unidad de medida debe ser un número entero' })
  @IsNotEmpty({ message: 'La unidad de medida es obligatoria' })
  unidadMedida: number;
}