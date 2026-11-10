import type { Insumo, UnidadMedida } from '../entities/insumo.entity';

export const unidades = {
  KG: 'kg',
  L: 'litros',
  UNIDAD: 'unidades',
  G: 'gramos',
  ML: 'mililitros',
} as const satisfies Record<UnidadMedida, string>;

export interface InsumoResponse {
  id: string;
  nombre: string;
  stock: number;
  unidad: (typeof unidades)[UnidadMedida];
}
