import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Producto } from '../../producto/entities/producto.entity';
import { Pedido } from './pedido.entity';

@Entity('pedido_producto')
export class PedidoProducto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
  })
  cantidad: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  comentario: string | null;

  @Column({
    name: 'pedido_id',
    type: 'int',
  })
  pedidoId: number;

  @Column({
    name: 'producto_id',
    type: 'int',
  })
  productoId: number;

  @ManyToOne(() => Pedido, (pedido) => pedido.pedidosProductos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pedido_id' })
  pedido: Pedido;

  @ManyToOne(() => Producto, (producto) => producto.pedidos)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;
}
