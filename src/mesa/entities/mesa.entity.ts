import { Pedido } from '../../pedido/entities/pedido.entity';
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column,
    OneToMany
 } from 'typeorm';

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
    type: 'varchar',
    length: 50,
    default: 'libre',
  })
  estado: string;

  @OneToMany(() => Pedido, (pedido) => pedido.mesa)
  pedidos: Pedido[];
}