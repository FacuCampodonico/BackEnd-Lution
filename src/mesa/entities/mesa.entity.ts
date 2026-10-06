import { Pedido } from '../../pedido/entities/pedido.entity';
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column,
    OneToMany
 } from 'typeorm';

export enum EstadoMesa {
  LIBRE = 'libre',
  ABIERTA = 'abierta',
  POR_PAGAR = 'por_pagar',
}

@Entity('mesa')
export class Mesa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    unique: true,
  })
  numero: number;

  @Column({
    type: 'enum',
    enum: EstadoMesa,
    default: EstadoMesa.LIBRE,
  })
  estado: EstadoMesa;

  @OneToMany(() => Pedido, (pedido) => pedido.mesa)
  pedidos: Pedido[];
}