import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CrearRecetaDto } from './crear-receta.dto';

export class CrearProductoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(120)
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(255)
  descripcion: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  precio: number;

  @IsInt({ message: 'El ID de la categoría debe ser un número entero' })
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  @Min(1)
  idCategoria: number;

  @ValidateIf((_producto, recetas) => recetas !== undefined)
  @IsArray()
  @ArrayUnique((receta: CrearRecetaDto) => receta?.insumoId, {
    message: 'Cada insumo debe aparecer una sola vez en la receta',
  })
  @ValidateNested({ each: true })
  @Type(() => CrearRecetaDto)
  recetas?: CrearRecetaDto[];
}
