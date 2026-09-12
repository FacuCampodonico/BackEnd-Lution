import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Producto } from '../../producto/entities/producto.entity';
import { Pedido } from './pedido.entity';

@Entity('pedido_producto')
export class PedidoProducto {
  @PrimaryColumn({
    name: 'pedido_id',
    type: 'int',
  })
  pedidoId: number;

  @PrimaryColumn({
    name: 'producto_id',
    type: 'int',
  })
  productoId: number;

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

  @ManyToOne(() => Pedido, (pedido) => pedido.productos)
  @JoinColumn({ name: 'pedido_id' })
  pedido: Pedido;

  @ManyToOne(() => Producto, (producto) => producto.pedidos)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;
}
