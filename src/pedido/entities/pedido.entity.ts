import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Empleado } from '../../empleado/entities/empleado.entity';
import { Mesa } from '../../mesa/entities/mesa.entity';

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
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  total: number | null;

  @Column({
    name: 'empleado_id',
    type: 'int',
  })
  empleadoId: number;

  @Column({
    name: 'mesa_id',
    type: 'int',
  })
  mesaId: number;

  @ManyToOne(() => Empleado, (empleado) => empleado.pedidos)
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado;

  @ManyToOne(() => Mesa, (mesa) => mesa.pedidos)
  @JoinColumn({ name: 'mesa_id' })
  mesa: Mesa;
}
