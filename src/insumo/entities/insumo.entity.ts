import { Receta } from 'src/producto/entities/receta.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

export const UNIDADES_MEDIDA = ['G', 'KG', 'ML', 'L', 'UNIDAD'] as const;

export type UnidadMedida = (typeof UNIDADES_MEDIDA)[number];

@Entity('insumo')
export class Insumo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  nombre: string;

  @Column({
    name: 'stock_disponible',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  stockDisponible: number;

  @Column({
    name: 'unidad_medida',
    type: 'enum',
    enum: UNIDADES_MEDIDA,
  })
  unidadMedida: UnidadMedida;

  @OneToMany(() => Receta, (receta) => receta.insumo)
  recetas: Receta[];
}
