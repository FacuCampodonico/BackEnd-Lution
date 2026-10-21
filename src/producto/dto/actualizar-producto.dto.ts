import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CrearRecetaDto } from './crear-receta.dto';

export class ActualizarProductoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MaxLength(120)
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
  @MaxLength(255)
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precio?: number;

  @IsOptional()
  @IsInt({ message: 'El ID de la categoría debe ser un número entero' })
  idCategoria?: number;

  // Si viene, reemplaza la receta completa del producto ([] la deja vacía).
  @ValidateIf((_producto, recetas) => recetas !== undefined)
  @IsArray()
  @ArrayUnique((receta: CrearRecetaDto) => receta?.insumoId, {
    message: 'Cada insumo debe aparecer una sola vez en la receta',
  })
  @ValidateNested({ each: true })
  @Type(() => CrearRecetaDto)
  recetas?: CrearRecetaDto[];
}
