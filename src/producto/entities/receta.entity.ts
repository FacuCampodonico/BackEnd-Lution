import { Insumo } from "src/insumo/entities/insumo.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { Producto } from "./producto.entity";


@Entity('receta')
export class Receta {
  @PrimaryColumn({
    name: 'producto_id',
    type: 'int',
  })
  productoId: number;

  @PrimaryColumn({
    name: 'insumo_id',
    type: 'int',
  })
  insumoId: number;  

  @Column({
    type: 'int',
  })
  cantidad: number;

  @ManyToOne(() => Producto, (producto) => producto.recetas)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @ManyToOne(() => Insumo, (insumo) => insumo.recetas)
  @JoinColumn({ name: 'insumo_id' })
  insumo: Insumo;
}