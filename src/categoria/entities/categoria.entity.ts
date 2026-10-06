import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    OneToMany
} from 'typeorm';
import { Producto } from '../../producto/entities/producto.entity';


@Entity('categoria')
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  nombre: string;

  @OneToMany(() => Producto, (producto) => producto.categoria)
  productos: Producto[];
}