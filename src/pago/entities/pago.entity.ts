import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { TipoPago } from '../enums/tipo-pago.enum';
import { Pedido } from '../../pedido/entities/pedido.entity';

@Entity('pago')
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TipoPago })
  tipo: TipoPago;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: {
      to: (val?: number) => val,
      from: (val?: string) => (val ? parseFloat(val) : null),
    },
  })
  pagaCon?: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: {
      to: (val?: number) => val,
      from: (val?: string) => (val ? parseFloat(val) : null),
    },
  })
  vuelto?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  titular?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  marca?: string;

  @Column({ type: 'int', nullable: true })
  cuotas?: number;
  
  @OneToOne(() => Pedido, (pedido) => pedido.pago, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedido_id' })
  pedido: Pedido;
}