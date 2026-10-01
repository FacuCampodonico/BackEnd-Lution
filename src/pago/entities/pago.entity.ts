import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { TipoPago } from '../enums/tipo-pago.enum';

@Entity('pago')
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TipoPago })
  tipo: TipoPago;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pagaCon?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  vuelto?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  titular?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  marca?: string;

  @Column({ type: 'int', nullable: true })
  cuotas?: number;
}