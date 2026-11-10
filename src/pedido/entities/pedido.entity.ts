import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Empleado } from '../../empleado/entities/empleado.entity';
import { Mesa } from '../../mesa/entities/mesa.entity';
import { PedidoProducto } from './pedido-producto.entity';
import { Pago } from '../../pago/entities/pago.entity';

export enum EstadoPedido {
  ABIERTO = 'abierto',
  PAGADO = 'pagado',
}

@Entity('pedido')
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'fecha_hora_inicio',
    type: 'datetime',
  })
  fechaHoraInicio: Date;

  @Column({
    name: 'fecha_hora_cierre',
    type: 'datetime',
    nullable: true,
  })
  fechaHoraCierre: Date | null;

  @Column({
    type: 'enum',
    enum: EstadoPedido,
    default: EstadoPedido.ABIERTO,
  })
  estado: EstadoPedido;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  total: number | null;

  @Column({
    name: 'empleado_id',
    type: 'int',
    nullable: true,
  })
  empleadoId: number | null;

  @Column({
    name: 'mesa_id',
    type: 'int',
  })
  mesaId: number;

  @ManyToOne(() => Empleado, (empleado) => empleado.pedidos, { nullable: true })
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado;

  @ManyToOne(() => Mesa, (mesa) => mesa.pedidos)
  @JoinColumn({ name: 'mesa_id' })
  mesa: Mesa;

  @OneToMany(() => PedidoProducto, (pedidoProducto) => pedidoProducto.pedido)
  pedidosProductos: PedidoProducto[];

  /** Preferencia de Mercado Pago con el QR vigente; mientras esté activa el pedido no se modifica. */
  @Column({
    name: 'mp_preference_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  mpPreferenceId: string | null;

  @Column({ name: 'mp_preferencia_expira', type: 'datetime', nullable: true })
  mpPreferenciaExpira: Date | null;

  @OneToOne(() => Pago, (pago) => pago.pedido)
  pago: Pago;
}

/** Hay un QR de Mercado Pago generado y todavía sin vencer. */
export function cobroMercadoPagoActivo(pedido: Pedido): boolean {
  return (
    pedido.estado === EstadoPedido.ABIERTO &&
    !!pedido.mpPreferenceId &&
    !!pedido.mpPreferenciaExpira &&
    new Date(pedido.mpPreferenciaExpira).getTime() > Date.now()
  );
}
