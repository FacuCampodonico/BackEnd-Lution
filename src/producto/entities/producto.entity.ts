import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Categoria } from '../../categoria/entities/categoria.entity';
import { PedidoProducto } from '../../pedido/entities/pedido-producto.entity';
import { Receta } from './receta.entity';

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
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    default: 0
  })
  precio: number;

  @Column({
    name: 'id_categoria',
    type: 'int',
  })
  idCategoria: number;

  @ManyToOne(() => Categoria, (categoria) => categoria.productos, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_categoria' })
  categoria: Categoria;

  @OneToMany(() => PedidoProducto, (pedidoProducto) => pedidoProducto.producto)
  pedidos: PedidoProducto[];

  @OneToMany(() => Receta, (receta) => receta.producto)
  recetas: Receta[];
}
