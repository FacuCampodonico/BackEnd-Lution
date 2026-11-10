import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { UNIDADES_MEDIDA } from '../entities/insumo.entity';
import type { UnidadMedida } from '../entities/insumo.entity';

export class ActualizarInsumoDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El stock debe ser numérico' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stockDisponible?: number;

  @IsOptional()
  @IsIn(UNIDADES_MEDIDA, {
    message: `La unidad de medida debe ser una de: ${UNIDADES_MEDIDA.join(', ')}`,
  })
  unidadMedida?: UnidadMedida;
}
