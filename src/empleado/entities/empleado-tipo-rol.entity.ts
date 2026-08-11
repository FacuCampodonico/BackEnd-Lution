import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Empleado } from './empleado.entity';

@Entity('empleado_tipo_rol')
export class EmpleadoTipoRol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 45,
  })
  nombre: string;

  @OneToMany(() => Empleado, (empleado) => empleado.tipoRol)
  empleados: Empleado[];
}