import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Categoria } from '../../categoria/entities/categoria.entity';
import { PedidoProducto } from '../../pedido-producto/entities/pedido-producto.entity';

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
    name: 'id_categoria',
    type: 'int',
  })
  idCategoria: number;

  @ManyToOne(() => Categoria)
  @JoinColumn({ name: 'id_categoria' })
  categoria: Categoria;

  @OneToMany(() => PedidoProducto, (pedidoProducto) => pedidoProducto.producto)
  pedidosProductos: PedidoProducto[];
}