import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearProductoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(120)
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(255)
  descripcion: string;

  @IsInt({ message: 'El ID de la categoría debe ser un número entero' })
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  idCategoria: number;
}