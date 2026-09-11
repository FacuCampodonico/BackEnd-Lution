import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Categoria } from '../../categoria/entities/categoria.entity';

@Entity('insumo')
export class Insumo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 120,
  })
  nombre: string;

  @Column({
    type: 'float',
    scale: 255,
    precision: 10,
  })
  stockDisponible: number;

  @Column({
    name: 'id_categoria',
    type: 'int',
  })
  unidadMedida: number;

  @ManyToOne(() => Categoria)
  @JoinColumn({ name: 'id_categoria' })
  categoria: Categoria;
}