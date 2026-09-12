import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { EmpleadoTipoRol } from './empleado-tipo-rol.entity';
import { Pedido } from '../../pedido/entities/pedido.entity';

@Entity('empleado')
export class Empleado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  nombre: string;

  @Column({
    name: 'dni',
    type: 'varchar',
    length: 15,
    unique: true,
  })
  dni: string;

  @Column({
    name: 'id_tipo_rol',
    type: 'int',
  })
  idTipoRol: number;

  @ManyToOne(
    () => EmpleadoTipoRol,
    (tipoRol) => tipoRol.empleados,
  )
  @JoinColumn({
    name: 'id_tipo_rol',
    referencedColumnName: 'id',
  })
  tipoRol: EmpleadoTipoRol;


  @OneToMany(() => Pedido, (pedido) => pedido.empleado)
  pedidos: Pedido[];
}

