import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Categoria } from '../../categoria/entities/categoria.entity';

@Entity('producto')
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 120,
  })
  nombre: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  descripcion: string;

  @Column({
    type: 'id_categoria',
  })
  idCategoria: number;

  @ManyToOne(() => Categoria)
  @JoinColumn({ name: 'id_categoria' })
  categoria: Categoria;
}