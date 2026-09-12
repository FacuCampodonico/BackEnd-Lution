import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { UNIDADES_MEDIDA } from '../entities/insumo.entity';
import type { UnidadMedida } from '../entities/insumo.entity';

export class CrearInsumoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100)
  nombre: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El stock debe ser numérico' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stockDisponible: number;

  @IsIn(UNIDADES_MEDIDA, {
    message: `La unidad de medida debe ser una de: ${UNIDADES_MEDIDA.join(', ')}`,
  })
  @IsNotEmpty({ message: 'La unidad de medida es obligatoria' })
  unidadMedida: UnidadMedida;
}
