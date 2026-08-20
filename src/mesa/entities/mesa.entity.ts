import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column
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
}