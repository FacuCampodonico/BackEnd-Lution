import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Empleado } from '../../empleado/entities/empleado.entity';
import { Mesa } from '../../mesa/entities/mesa.entity';
import { OneToMany } from 'typeorm/browser';

@Entity('pedido')
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'datetime',
    length: 100,
  })
  fechaHoraInicio: Date;

    @Column({
    type: 'datetime',
    length: 100,
  })
  fechaHoraCierre: Date;

  @Column({
    type: 'float',
    scale: 255,
    precision: 10,
  })
  total: number;

  @ManyToOne(() => Empleado, empleado => empleado.pedido)
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado;

  @ManyToOne(() => Mesa, mesa => mesa.pedido)
  @JoinColumn({ name: 'mesa_id' })
  mesas: Mesa[];
}