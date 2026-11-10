import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CrearEmpleadoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(120)
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El DNI es obligatorio' })
  @MaxLength(20)
  dni: string;

  @IsInt({ message: 'El tipo de rol debe ser un número entero' })
  @IsNotEmpty({ message: 'El tipo de rol es obligatorio' })
  idTipoRol: number;

  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, {
    message: 'La contraseña debe tener al menos 6 caracteres',
  })
  password: string;
}
