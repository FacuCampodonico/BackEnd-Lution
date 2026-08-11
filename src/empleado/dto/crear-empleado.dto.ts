import { IsEmail, IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';


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
}
