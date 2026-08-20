import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column 
} from 'typeorm';



@Entity('categoria')
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  nombre: string;
}